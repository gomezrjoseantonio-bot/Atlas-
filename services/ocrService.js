import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.isInitialized = false;
    this.worker = null;
    this.pdfjsLib = null;
  }

  async initializePDFJS() {
    if (typeof window === 'undefined') return null;
    
    if (!this.pdfjsLib) {
      try {
        // Dynamic import to avoid SSR issues
        this.pdfjsLib = await import('pdfjs-dist');
        // Configure worker from local files
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = '/ocr/pdf.worker.min.js';
      } catch (error) {
        console.warn('PDF.js not available, PDF processing disabled:', error);
        return null;
      }
    }
    return this.pdfjsLib;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create Tesseract worker with local paths
      this.worker = await Tesseract.createWorker('spa+eng', 1, {
        workerPath: '/ocr/tesseract.worker.min.js',
        corePath: '/ocr/tesseract-core.wasm',
        langPath: '/ocr/lang/',
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Emit progress events for UI updates
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('atlas:ocr-progress', {
                detail: { progress: m.progress, status: m.status }
              });
              document.dispatchEvent(event);
            }
          }
        }
      });

      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR Service:', error);
      throw error;
    }
  }

  async processDocument(file, onProgress = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const fileType = file.type || this.getFileTypeFromName(file.name);
      
      if (fileType === 'application/pdf') {
        return await this.processPDF(file, onProgress);
      } else if (fileType.startsWith('image/')) {
        return await this.processImage(file, onProgress);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  async processPDF(file, onProgress = null) {
    const pdfjsLib = await this.initializePDFJS();
    if (!pdfjsLib) {
      throw new Error('PDF.js not available for PDF processing');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    let allText = '';
    let totalConfidence = 0;
    let pageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress({
          type: 'page-progress',
          current: pageNum,
          total: numPages,
          status: `Procesando página ${pageNum}/${numPages}`
        });
      }

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher resolution for better OCR
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to blob for Tesseract
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      const result = await this.worker.recognize(blob);
      
      allText += `\n--- Página ${pageNum} ---\n${result.data.text}`;
      totalConfidence += result.data.confidence;
      pageTexts.push({
        page: pageNum,
        text: result.data.text,
        confidence: result.data.confidence
      });
    }

    const avgConfidence = totalConfidence / numPages;
    const extractedData = this.extractSpanishInvoiceData(allText);

    return {
      text: allText.trim(),
      confidence: Math.round(avgConfidence),
      language: 'spa+eng',
      pages: pageTexts.length,
      pagesOcr: pageTexts,
      extractedData
    };
  }

  async processImage(file, onProgress = null) {
    if (onProgress) {
      onProgress({
        type: 'processing',
        status: 'Procesando imagen...'
      });
    }

    const result = await this.worker.recognize(file);
    const extractedData = this.extractSpanishInvoiceData(result.data.text);

    return {
      text: result.data.text,
      confidence: Math.round(result.data.confidence),
      language: 'spa+eng',
      pages: 1,
      pagesOcr: [{
        page: 1,
        text: result.data.text,
        confidence: result.data.confidence
      }],
      extractedData
    };
  }

  extractSpanishInvoiceData(text) {
    const extractedData = {
      date: null,
      provider: null,
      base: null,
      iva: null,
      total: null,
      concept: null
    };

    try {
      // Extract date patterns (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)
      const datePatterns = [
        /(\d{1,2})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{4})/g,
        /(\d{4})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{1,2})/g
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = text.match(pattern);
        if (dateMatch) {
          extractedData.date = dateMatch[0];
          break;
        }
      }

      // Extract amounts (€, EUR patterns)
      const amountPatterns = [
        /(?:total|importe|cantidad)[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/g,
        /base[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /i\.?v\.?a\.?[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi
      ];

      const amounts = [];
      amountPatterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
          const amount = match[1] || match[0];
          const normalizedAmount = parseFloat(amount.replace(/[.,](\d{2})$/, '.$1').replace(/[.,]/g, ''));
          if (!isNaN(normalizedAmount) && normalizedAmount > 0) {
            amounts.push(normalizedAmount);
          }
        });
      });

      // Try to identify base, IVA, and total
      if (amounts.length > 0) {
        amounts.sort((a, b) => b - a); // Sort descending
        extractedData.total = amounts[0]; // Largest amount is likely total
        
        if (amounts.length >= 2) {
          extractedData.base = amounts[1]; // Second largest is likely base
        }
        
        if (amounts.length >= 3) {
          extractedData.iva = amounts[2]; // Third might be IVA
        } else if (extractedData.base && extractedData.total) {
          extractedData.iva = extractedData.total - extractedData.base;
        }
      }

      // Extract provider/company name (look for common Spanish business indicators)
      const providerPatterns = [
        /(?:empresa|compañía|s\.l\.|s\.a\.|sociedad)[:\s]*([^\n\r]+)/gi,
        /cif[:\s]*[a-z]\d{8}[:\s]*([^\n\r]+)/gi,
        /^([A-Z][a-zA-Z\s,\.]+(?:S\.L\.|S\.A\.|C\.B\.))/gm
      ];

      for (const pattern of providerPatterns) {
        const providerMatch = text.match(pattern);
        if (providerMatch) {
          extractedData.provider = providerMatch[1] ? providerMatch[1].trim() : providerMatch[0].trim();
          break;
        }
      }

      // Extract concept/description
      const conceptPatterns = [
        /(?:concepto|descripción|servicios?)[:\s]*([^\n\r]+)/gi,
        /(?:por|para)[:\s]+([^\n\r]{10,})/gi
      ];

      for (const pattern of conceptPatterns) {
        const conceptMatch = text.match(pattern);
        if (conceptMatch && conceptMatch[1]) {
          extractedData.concept = conceptMatch[1].trim();
          break;
        }
      }

    } catch (error) {
      console.warn('Error extracting Spanish invoice data:', error);
    }

    return extractedData;
  }

  getFileTypeFromName(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'heic': 'image/heic'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
const ocrService = new OCRService();
export default ocrService;