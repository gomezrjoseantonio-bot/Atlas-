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
        // Use local worker if available, fallback to CDN
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
      
      // Check if we're in development for enhanced debugging
      const isDev = typeof window !== 'undefined' && 
                   (window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1');
      
      if (isDev) {
        console.log('Development mode detected - enabling detailed OCR logging');
      }
      
      // Simplified worker configuration - let Tesseract.js handle asset loading
      console.log('Creating Tesseract worker with basic configuration...');
      
      // Create worker with simpler options for maximum compatibility
      this.worker = await Tesseract.createWorker(['spa', 'eng'], 1, {
        logger: (m) => {
          if (isDev) {
            console.log('Tesseract:', m);
          } else if (m.status === 'recognizing text' || m.progress > 0) {
            console.log(`Tesseract: ${m.status} ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
      
      // In development, add a global test function
      if (isDev && typeof window !== 'undefined') {
        window.atlasOCRService = this;
        window.testAtlasOCR = async (file) => {
          try {
            const result = await this.processDocument(file);
            console.log('Test OCR result:', result);
            return result;
          } catch (error) {
            console.error('Test OCR failed:', error);
            throw error;
          }
        };
        console.log('OCR test functions added to window.testAtlasOCR');
      }
      
    } catch (error) {
      console.error('Failed to initialize OCR Service:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
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
      console.log(`Starting OCR processing for file: ${file.name} (${file.type})`);
      
      // Initialize worker if needed
      if (!this.isInitialized) {
        if (onProgress) {
          onProgress({
            type: 'initialization',
            status: 'Iniciando OCR...'
          });
        }
        
        try {
          await this.initialize();
        } catch (initError) {
          console.warn('Bilingual OCR initialization failed, trying English-only fallback:', initError);
          
          if (onProgress) {
            onProgress({
              type: 'initialization',
              status: 'Intentando configuración alternativa...'
            });
          }
          
          try {
            // Fallback to English-only worker
            this.worker = await Tesseract.createWorker('eng');
            this.isInitialized = true;
            console.log('Fallback OCR initialization successful (English only)');
          } catch (fallbackError) {
            console.error('All OCR initialization attempts failed:', fallbackError);
            throw new Error('No se pudo inicializar el OCR. Intente recargar la página.');
          }
        }
      }

      const fileType = file.type || this.getFileTypeFromName(file.name);
      
      // Simplified processing with 90-second timeout
      const processTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout after 90 seconds')), 90000);
      });
      
      let processingPromise;
      if (fileType === 'application/pdf') {
        processingPromise = this.processPDF(file, onProgress);
      } else if (fileType.startsWith('image/')) {
        processingPromise = this.processImage(file, onProgress);
      } else {
        throw new Error(`Tipo de archivo no soportado: ${fileType}`);
      }
      
      return await Promise.race([processingPromise, processTimeout]);
    } catch (error) {
      console.error('OCR processing failed:', error);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('timeout')) {
        userMessage = 'El procesamiento tardó demasiado. Intente con una imagen más pequeña.';
      } else if (error.message.includes('inicializar')) {
        userMessage = 'Error al inicializar OCR. Recargue la página e intente de nuevo.';
      }
      
      // Clean up worker on errors
      if (error.message.includes('timeout') || error.message.includes('inicializar')) {
        await this.terminate();
      }
      
      const friendlyError = new Error(userMessage);
      friendlyError.originalError = error;
      throw friendlyError;
    }
  }

  async processPDF(file, onProgress = null) {
    const pdfjsLib = await this.initializePDFJS();
    if (!pdfjsLib) {
      throw new Error('PDF.js no disponible para procesar PDFs');
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
        const viewport = page.getViewport({ scale: 1.5 }); // Moderate resolution for better performance
        
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

        // Shorter timeout for individual pages (60 seconds)
        const pageTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout procesando página ${pageNum}`)), 60000);
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
      // Shorter timeout for images (60 seconds)
      const imageTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout procesando imagen')), 60000);
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

      // Enhanced date patterns for Spanish documents
      const datePatterns = [
        /(\d{1,2})\s+de\s+\w+\s+de\s+(\d{4})/gi, // "14 de agosto de 2025"
        /(\d{1,2})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{4})/g, // DD/MM/YYYY
        /(\d{4})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{1,2})/g, // YYYY/MM/DD
        /fecha[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi, // "Fecha: DD/MM/YYYY"
        /emisi[óo]n[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi // "Emisión: DD/MM/YYYY"
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = text.match(pattern);
        if (dateMatch && dateMatch[0]) {
          extractedData.date = dateMatch[0];
          break;
        }
      }

      // Enhanced amount patterns specifically for utility bills like WEKIWI
      const amountPatterns = [
        // Enhanced patterns for utility bills
        /total\s+factura[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /total[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /importe[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // Specific patterns for energy bills
        /por\s+(?:potencia|energia)\s+[^€]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /potencia\s+contratada[^€]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /energia\s+consumida[^€]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // General amount patterns
        /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/g,
        // IVA patterns
        /iva\s+\d+%[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        /impuesto\s+el[ée]ctrico[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // Base patterns
        /base[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
        // Equipment rental patterns
        /alquiler\s+de\s+equipo[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi
      ];

      const amounts = [];
      amountPatterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
          const amount = match[1] || match[0];
          // Enhanced Spanish number format conversion
          const normalizedAmount = this.parseSpanishAmount(amount);
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
      
      // Enhanced identification based on context
      const totalMatch = amounts.find(a => 
        a.context.toLowerCase().includes('total') || 
        a.context.toLowerCase().includes('factura')
      );
      const ivaMatch = amounts.find(a => 
        a.context.toLowerCase().includes('iva') ||
        a.context.toLowerCase().includes('impuesto')
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

      // Enhanced provider/company detection
      const providerPatterns = [
        // Specific utility companies
        /wekiwi/gi,
        /endesa/gi,
        /iberdrola/gi,
        /naturgy/gi,
        /repsol/gi,
        // Company name patterns
        /^([A-Z][a-zA-ZÀ-ÿ\s,\.]+(?:S\.?L\.?|S\.?A\.?|C\.?B\.?))/gm,
        /([A-Z][a-zA-ZÀ-ÿ\s]+)\s+S\.?L\.?/gi,
        /([A-Z][a-zA-ZÀ-ÿ\s]+)\s+S\.?A\.?/gi,
        // Document header patterns
        /^([A-Z\s]{4,})/gm
      ];

      for (const pattern of providerPatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          let providerName = (match[1] || match[0]).trim();
          providerName = providerName.replace(/[:\n\r]+/g, ' ').trim();
          if (providerName.length > 2 && providerName.length < 50) {
            extractedData.provider = providerName;
            break;
          }
        }
      }

      // Enhanced concept extraction for utility bills
      const conceptPatterns = [
        /periodo\s+de\s+consumo[:\s]*([^\n\r]+)/gi,
        /suministro[:\s]*([^\n\r]+)/gi,
        /factura[:\s]+de[:\s]*([^\n\r]+)/gi,
        /(?:concepto|descripción|servicios?)[:\s]*([^\n\r]+)/gi,
        // Look for service descriptions
        /(?:electricidad|gas|agua|telefon[íi]a|internet)[^\n\r]*/gi
      ];

      for (const pattern of conceptPatterns) {
        const conceptMatch = text.match(pattern);
        if (conceptMatch && conceptMatch[1]) {
          const concept = conceptMatch[1].trim();
          if (concept.length > 5 && concept.length < 100) {
            extractedData.concept = concept;
            break;
          }
        } else if (conceptMatch && conceptMatch[0]) {
          const concept = conceptMatch[0].trim();
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

  // Helper method to parse Spanish amount formatting
  parseSpanishAmount(amount) {
    try {
      // Handle Spanish number format: 1.234,56 or 1234,56
      let normalized = amount.toString();
      
      // Remove currency symbols
      normalized = normalized.replace(/[€$]/g, '');
      
      // If there's a comma followed by exactly 2 digits at the end, it's decimal
      if (/,\d{2}$/.test(normalized)) {
        // Replace the decimal comma with a dot
        normalized = normalized.replace(/,(\d{2})$/, '.$1');
        // Remove thousands separators (dots and commas before the decimal)
        normalized = normalized.replace(/[.,](?=\d{3})/g, '');
      } else {
        // No decimal part, remove all separators
        normalized = normalized.replace(/[.,]/g, '');
      }
      
      return parseFloat(normalized);
    } catch (error) {
      console.warn('Error parsing Spanish amount:', amount, error);
      return NaN;
    }
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