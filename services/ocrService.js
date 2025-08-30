import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.isInitialized = false;
    this.worker = null;
    this.pdfjsLib = null;
    this.initializationPromise = null;
  }

  async initializePDFJS() {
    if (typeof window === 'undefined') return null;
    
    if (!this.pdfjsLib) {
      try {
        // Dynamic import to avoid SSR issues
        this.pdfjsLib = await import('pdfjs-dist');
        // Use CDN worker for now to avoid compatibility issues
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.js';
      } catch (error) {
        console.warn('PDF.js not available, PDF processing disabled:', error);
        return null;
      }
    }
    return this.pdfjsLib;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Prevent multiple initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    try {
      console.log('Initializing simplified OCR Service...');
      
      // Create worker with minimal configuration for maximum compatibility
      console.log('Creating Tesseract worker with basic configuration...');
      
      // Use a simple approach - let Tesseract.js handle defaults
      this.worker = await Tesseract.createWorker(['spa', 'eng'], 1, {
        logger: (m) => {
          console.log('Tesseract:', m);
        }
      });

      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR Service:', error);
      // Clean up on failure
      if (this.worker) {
        try {
          await this.worker.terminate();
        } catch (termError) {
          console.warn('Error terminating failed worker:', termError);
        }
        this.worker = null;
      }
      this.initializationPromise = null;
      this.isInitialized = false;
      throw error;
    }
  }

  async processDocument(file, onProgress = null) {
    try {
      console.log(`Starting simplified OCR processing for file: ${file.name} (${file.type})`);
      
      // Initialize if needed
      if (!this.isInitialized) {
        if (onProgress) {
          onProgress({
            type: 'initialization',
            status: 'Iniciando OCR...'
          });
        }
        await this.initialize();
      }

      const fileType = file.type || this.getFileTypeFromName(file.name);
      
      // Add overall timeout for document processing (3 minutes)
      const processTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Document processing timeout after 3 minutes')), 180000);
      });
      
      let processingPromise;
      if (fileType === 'application/pdf') {
        processingPromise = this.processPDF(file, onProgress);
      } else if (fileType.startsWith('image/')) {
        processingPromise = this.processImage(file, onProgress);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      return await Promise.race([processingPromise, processTimeout]);
    } catch (error) {
      console.error('OCR processing failed:', error);
      // Clean up worker on critical errors
      if (error.message.includes('timeout') || error.message.includes('Failed to initialize')) {
        await this.terminate();
      }
      throw error;
    }
  }

  async processPDF(file, onProgress = null) {
    const pdfjsLib = await this.initializePDFJS();
    if (!pdfjsLib) {
      throw new Error('PDF.js not available for PDF processing');
    }

    try {
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

        // Add timeout for individual page OCR processing (90 seconds)
        const pageTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Page ${pageNum} OCR timeout after 90 seconds`)), 90000);
        });
        
        const recognizePromise = this.worker.recognize(blob);
        const result = await Promise.race([recognizePromise, pageTimeout]);
        
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
    } catch (error) {
      console.error(`Failed to process PDF ${file.name}:`, error);
      throw error;
    }
  }

  async processImage(file, onProgress = null) {
    if (onProgress) {
      onProgress({
        type: 'processing',
        status: 'Procesando imagen...'
      });
    }

    console.log(`Processing image: ${file.name}`);
    
    try {
      // Add timeout for image OCR processing (90 seconds)
      const imageTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Image OCR timeout after 90 seconds')), 90000);
      });
      
      const recognizePromise = this.worker.recognize(file);
      const result = await Promise.race([recognizePromise, imageTimeout]);
      
      console.log(`Image OCR completed with ${result.data.confidence}% confidence`);
      
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
    } catch (error) {
      console.error(`Failed to process image ${file.name}:`, error);
      throw error;
    }
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
      console.log('Extracting data from OCR text:', text.substring(0, 200) + '...');

      // Extract date patterns (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)
      const datePatterns = [
        /(\d{1,2})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{4})/g,
        /(\d{4})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{1,2})/g,
        /(\d{1,2})\s+de\s+\w+\s+de\s+(\d{4})/gi // Spanish format: "14 de agosto de 2025"
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = text.match(pattern);
        if (dateMatch && dateMatch[0]) {
          extractedData.date = dateMatch[0];
          break;
        }
      }

      // Extract amounts - improved patterns for Spanish invoices
      const amountPatterns = [
        // Look for "TOTAL FACTURA" and similar
        /total\s+factura[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /total[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /importe[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // Amount followed by €
        /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/g,
        // IVA patterns
        /iva\s+\d+%[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // Base patterns
        /base[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // Potencia/Energia patterns for utility bills
        /por\s+(?:potencia|energia)\s+[^€]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi
      ];

      const amounts = [];
      amountPatterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
          const amount = match[1] || match[0];
          // Convert Spanish number format to standard
          const normalizedAmount = parseFloat(
            amount.replace(/[.,](\d{2})$/, '.$1') // Last comma/dot with 2 digits is decimal
                  .replace(/[.,]/g, '') // Remove thousands separators
                  .replace(/\.(\d{2})$/, '.$1') // Restore decimal point
          );
          if (!isNaN(normalizedAmount) && normalizedAmount > 0) {
            amounts.push({
              value: normalizedAmount,
              raw: amount,
              context: match[0]
            });
          }
        });
      });

      // Sort amounts by value descending
      amounts.sort((a, b) => b.value - a.value);
      
      // Try to identify total, base, and IVA based on context
      const totalMatch = amounts.find(a => 
        a.context.toLowerCase().includes('total') || 
        a.context.toLowerCase().includes('factura')
      );
      const ivaMatch = amounts.find(a => 
        a.context.toLowerCase().includes('iva')
      );
      const baseMatch = amounts.find(a => 
        a.context.toLowerCase().includes('base') ||
        a.context.toLowerCase().includes('potencia') ||
        a.context.toLowerCase().includes('energia')
      );

      if (totalMatch) {
        extractedData.total = totalMatch.value;
      } else if (amounts.length > 0) {
        extractedData.total = amounts[0].value; // Largest amount is likely total
      }

      if (ivaMatch) {
        extractedData.iva = ivaMatch.value;
      }

      if (baseMatch) {
        extractedData.base = baseMatch.value;
      } else if (extractedData.total && extractedData.iva) {
        extractedData.base = extractedData.total - extractedData.iva;
      }

      // Extract provider/company name - improved patterns
      const providerPatterns = [
        // Look for company names at the beginning
        /^([A-Z][a-zA-ZÀ-ÿ\s,\.]+(?:S\.?L\.?|S\.?A\.?|C\.?B\.?))/gm,
        // Look for specific patterns
        /([A-Z][a-zA-ZÀ-ÿ\s]+)\s+S\.?L\.?/gi,
        /([A-Z][a-zA-ZÀ-ÿ\s]+)\s+S\.?A\.?/gi,
        // CIF pattern
        /cif[:\s]*[a-z]\d{8}[:\s]*([^\n\r]+)/gi,
        // NIF pattern  
        /nif[:\s]*\d{8}[a-z][:\s]*([^\n\r]+)/gi,
        // Look for lines that might be company names (all caps or title case)
        /^([A-Z\s]{4,})/gm
      ];

      for (const pattern of providerPatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          let providerName = (match[1] || match[0]).trim();
          // Clean up the provider name
          providerName = providerName.replace(/[:\n\r]+/g, ' ').trim();
          if (providerName.length > 3 && providerName.length < 50) {
            extractedData.provider = providerName;
            break;
          }
        }
      }

      // Extract concept/description - improved patterns
      const conceptPatterns = [
        /(?:concepto|descripción|servicios?)[:\s]*([^\n\r]+)/gi,
        /(?:suministro|consumo)[:\s]*([^\n\r]+)/gi,
        /periodo\s+de\s+consumo[:\s]*([^\n\r]+)/gi,
        // Look for lines that describe the service
        /(?:de|del|para)\s+([^\n\r]{15,})/gi
      ];

      for (const pattern of conceptPatterns) {
        const conceptMatch = text.match(pattern);
        if (conceptMatch && conceptMatch[1]) {
          const concept = conceptMatch[1].trim();
          if (concept.length > 5 && concept.length < 100) {
            extractedData.concept = concept;
            break;
          }
        }
      }

      console.log('Extracted data:', extractedData);

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
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }
      this.isInitialized = false;
      this.initializationPromise = null;
      console.log('OCR Service terminated successfully');
    } catch (error) {
      console.warn('Error terminating OCR service:', error);
    }
  }
}

// Export singleton instance
const ocrService = new OCRService();
export default ocrService;