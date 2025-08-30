import { useState, useEffect } from 'react';
import store from '../store/index';
import InvoiceBreakdownModal from '../components/InvoiceBreakdownModal';
import CapexAssignmentModal from '../components/CapexAssignmentModal';
import ocrService from '../services/ocrService';

export default function Page() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [showQuickClose, setShowQuickClose] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedInboxEntries, setSelectedInboxEntries] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  
  // H10: OCR Processing states
  const [ocrProgress, setOcrProgress] = useState({});
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  
  // H9B: CAPEX Modal states
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showCapexModal, setShowCapexModal] = useState(false);
  const [selectedDocumentForModal, setSelectedDocumentForModal] = useState(null);
  const [duplicateDetected, setDuplicateDetected] = useState([]);
  const [showManualExpenseModal, setShowManualExpenseModal] = useState(false);
  
  // Persistent filters using sessionStorage
  const [filterMonth, setFilterMonth] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('documents.filterMonth') || 'all';
    }
    return 'all';
  });
  const [filterProvider, setFilterProvider] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('documents.filterProvider') || 'all';
    }
    return 'all';
  });
  const [filterProperty, setFilterProperty] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('documents.filterProperty') || 'all';
    }
    return 'all';
  });
  const [filterStatus, setFilterStatus] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('documents.filterStatus') || 'all';
    }
    return 'all';
  });
  
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state immediately
    let currentState = store.getState();
    const hasData = currentState.accounts?.length > 0 || 
                   currentState.properties?.length > 0 || 
                   currentState.documents?.length > 0;
    
    if (!hasData) {
      console.log('Documentos init: No data detected, forcing demo data');
      store.resetDemo();
      currentState = store.getState();
    }
    
    return currentState;
  });

  // Persist filter changes to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('documents.filterMonth', filterMonth);
    }
  }, [filterMonth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('documents.filterProvider', filterProvider);
    }
  }, [filterProvider]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('documents.filterProperty', filterProperty);
    }
  }, [filterProperty]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('documents.filterStatus', filterStatus);
    }
  }, [filterStatus]);

  // Check URL parameters for filter presets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter');
      
      if (filter === 'missing') {
        setActiveTab('facturas');
        setFilterStatus('Pendiente');
      }
    }
  }, []);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => {
      unsubscribe();
    };
  }, []);
  const { documents = [], inboxEntries = [], missingInvoices = [], properties = [], capexProjects = [], fiscalTreatments = [] } = storeState;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Validada': return 'success';
      case 'Pendiente': return 'warning';
      case 'Error': return 'error';
      case 'Listo para asignar': return 'warning';
      case 'Leído': return 'success';
      case 'Error lectura': return 'error';
      case 'Pendiente de cargo': return 'warning';
      // H10: OCR status classes
      case 'Pendiente de procesamiento': return 'warning';
      case 'OCR en curso': return 'info';
      case 'OCR listo': return 'success';
      case 'Error OCR': return 'error';
      default: return 'warning';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSendToInvoices = (entryId) => {
    // Simulate OCR processing and sending to invoices
    store.sendInboxEntryToInvoices(entryId);
    
    if (window.showToast) {
      window.showToast('Documento enviado a Facturas tras OCR simulado', 'success');
    }
  };

  const handleQuickClose = () => {
    if (selectedDocuments.length === 0) {
      if (window.showToast) {
        window.showToast('Selecciona documentos para cerrar', 'warning');
      }
      return;
    }

    // Close selected documents
    selectedDocuments.forEach(docId => {
      store.updateDocumentStatus(docId, 'Validada');
    });

    if (window.showToast) {
      window.showToast(`${selectedDocuments.length} documento(s) cerrado(s) exitosamente`, 'success');
    }

    setSelectedDocuments([]);
    setShowQuickClose(false);
  };

  // Check if we should show quick close button
  useEffect(() => {
    setShowQuickClose(selectedDocuments.length > 0);
  }, [selectedDocuments]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    // Process dropped files
    const files = Array.from(e.dataTransfer.files);
    let validFiles = 0;
    
    files.forEach(file => {
      // Check file size limit (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        if (window.showToast) {
          window.showToast(
            `Archivo muy grande: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 10MB.`, 
            'error'
          );
        }
        return;
      }
      
      // Check for valid file types
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|heic)$/)) {
        if (window.showToast) {
          window.showToast(`Tipo de archivo no soportado: ${file.name}`, 'error');
        }
        return;
      }
      
      validFiles++;
      
      const entry = {
        fileName: file.name,
        fileSize: file.size < 1024 ? `${file.size}B` : 
                 file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)}KB` : 
                 `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        status: 'Pendiente de procesamiento',
        provider: 'Pendiente OCR',
        hasOcr: false, // Will be set to true after OCR processing
        ocrText: null,
        ocrConfidence: null,
        ocrLang: null,
        pagesOcr: null,
        fileType: file.type,
        originalFile: file, // Store reference for OCR processing
        amount: null // Will be extracted by OCR
      };
      
      // Check for potential duplicates based on filename and size
      const potentialDuplicates = storeState.inboxEntries.filter(existing => 
        existing.fileName === file.name && 
        Math.abs(existing.originalFile?.size - file.size) < 1000 // Within 1KB
      );
      
      if (potentialDuplicates.length > 0) {
        entry.isDuplicate = true;
        setDuplicateDetected([...duplicateDetected, entry.fileName]);
      }
      
      store.addInboxEntry(entry);
    });
    
    if (validFiles > 0) {
      // Show toast using the event system
      const event = new CustomEvent('atlas:toast', {
        detail: { type: 'success', message: `${files.length} archivo(s) añadido(s) al Inbox` }
      });
      document.dispatchEvent(event);
    }
  };

  const handleFileSelect = (e) => {
    // Process selected files - add to inbox
    const files = Array.from(e.target.files);
    let validFiles = 0;
    
    files.forEach(file => {
      // Check file size limit (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        if (window.showToast) {
          window.showToast(
            `Archivo muy grande: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 10MB.`, 
            'error'
          );
        }
        return;
      }

      // Check for valid file types
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|heic)$/)) {
        if (window.showToast) {
          window.showToast(`Tipo de archivo no soportado: ${file.name}`, 'error');
        }
        return;
      }

      validFiles++;

      const entry = {
        fileName: file.name,
        fileSize: file.size < 1024 ? `${file.size}B` : 
                 file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)}KB` : 
                 `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        status: 'Pendiente de procesamiento',
        provider: 'Pendiente OCR',
        hasOcr: false,
        ocrText: null,
        ocrConfidence: null,
        ocrLang: null,
        pagesOcr: null,
        fileType: file.type,
        originalFile: file,
        amount: null
      };
      
      store.addInboxEntry(entry);
    });
    
    if (validFiles > 0) {
      // Show toast using the event system
      const event = new CustomEvent('atlas:toast', {
        detail: { type: 'success', message: `${validFiles} archivo(s) añadido(s) al Inbox` }
      });
      document.dispatchEvent(event);
    }
    
    e.target.value = ''; // Reset input
  };

  // Remove old bulk action handler since we now use data-action
  
  // Helper function to handle bulk actions via events
  const executeBulkAction = (action) => {
    if (selectedDocuments.length === 0) {
      const event = new CustomEvent('atlas:toast', {
        detail: { type: 'warning', message: 'Selecciona al menos un documento' }
      });
      document.dispatchEvent(event);
      return;
    }

    // Create event with selected document IDs
    const actionEvent = new CustomEvent('atlas:bulk-action', {
      detail: { action, documentIds: selectedDocuments }
    });
    document.dispatchEvent(actionEvent);
    setSelectedDocuments([]);
  };

  // H10: OCR Processing Handlers
  
  const handleOCRProgress = (entryId, progress) => {
    setOcrProgress(prev => ({
      ...prev,
      [entryId]: progress
    }));
  };



  const handleProcessOCR = async () => {
    if (selectedInboxEntries.length === 0) {
      if (window.showToast) {
        window.showToast('Selecciona documentos para procesar con OCR', 'warning');
      }
      return;
    }

    setIsOCRProcessing(true);

    try {
      if (window.showToast) {
        window.showToast(
          `Procesando ${selectedInboxEntries.length} documento(s) con OCR...`,
          'info'
        );
      }

      // Process each selected entry with real OCR
      const processingPromises = selectedInboxEntries.map(async (entryId) => {
        const entry = storeState.inboxEntries.find(e => e.id === entryId);
        if (!entry || !entry.originalFile) {
          console.warn(`Entry ${entryId} not found or missing file`);
          return;
        }

        try {
          // Set processing status
          store.setInboxEntryOCRStatus(entryId, 'OCR en curso');
          
          // Process with real OCR service
          const result = await ocrService.processDocument(entry.originalFile, (progress) => {
            handleOCRProgress(entryId, progress);
          });

          // Update store with real OCR results
          store.updateInboxEntryOCR(entryId, result);
          
          // Clear progress
          setOcrProgress(prev => {
            const updated = { ...prev };
            delete updated[entryId];
            return updated;
          });

          if (window.showToast) {
            window.showToast(
              `OCR completado: ${entry.fileName} - ${result.confidence}% confianza`,
              'success'
            );
          }

        } catch (error) {
          console.error(`OCR processing failed for ${entry.fileName}:`, error);
          store.setInboxEntryOCRStatus(entryId, 'Error OCR', error.message);
          
          // Clear progress
          setOcrProgress(prev => {
            const updated = { ...prev };
            delete updated[entryId];
            return updated;
          });

          if (window.showToast) {
            window.showToast(`Error OCR en ${entry.fileName}: ${error.message}`, 'error');
          }
        }
      });

      // Wait for all OCR processes to complete
      await Promise.all(processingPromises);
      
      setSelectedInboxEntries([]);

    } catch (error) {
      console.error('Bulk OCR processing failed:', error);
      if (window.showToast) {
        window.showToast(`Error en procesamiento OCR: ${error.message}`, 'error');
      }
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const handleCancelOCR = () => {
    // Cancel OCR for selected entries
    selectedInboxEntries.forEach(entryId => {
      store.setInboxEntryOCRStatus(entryId, 'Pendiente de procesamiento');
    });
    
    setSelectedInboxEntries([]);
    setIsOCRProcessing(false);
    setOcrProgress({});

    if (window.showToast) {
      window.showToast('Procesamiento OCR cancelado', 'info');
    }
  };

  // H9B: CAPEX Functionality Handlers
  
  const handleBreakdownDocument = (document) => {
    setSelectedDocumentForModal(document);
    setShowBreakdownModal(true);
  };

  const handleAssignToCapex = (document) => {
    const documentProperty = properties.find(p => p.id === document.propertyId);
    if (!documentProperty) {
      if (window.showToast) {
        window.showToast('Asigna el documento a una propiedad primero', 'warning');
      }
      return;
    }
    
    setSelectedDocumentForModal(document);
    setShowCapexModal(true);
  };

  const handleSaveBreakdown = (breakdownData) => {
    if (!selectedDocumentForModal) return;
    
    // Add breakdown to document
    store.addDocumentBreakdown(selectedDocumentForModal.id, breakdownData.lineItems);
    
    setShowBreakdownModal(false);
    setSelectedDocumentForModal(null);
    
    if (window.showToast) {
      window.showToast(
        `Factura desglosada en ${breakdownData.lineItems.length} líneas`, 
        'success'
      );
    }
  };

  const handleCapexAssignment = (assignment) => {
    if (!selectedDocumentForModal) return;
    
    // Assign to CAPEX project
    if (assignment.lineItemIds && assignment.lineItemIds.length > 0) {
      // Assign specific line items
      assignment.lineItemIds.forEach(lineItemId => {
        store.assignToCapexProject(assignment.projectId, assignment.documentId, lineItemId);
      });
    } else {
      // Assign entire document
      store.assignToCapexProject(assignment.projectId, assignment.documentId);
    }
    
    setShowCapexModal(false);
    setSelectedDocumentForModal(null);
    
    if (window.showToast) {
      window.showToast(
        `Documento asignado a CAPEX (${formatCurrency(assignment.amount)})`, 
        'success'
      );
    }
  };

  const handleCreateCapexProject = (projectData) => {
    const project = store.addCapexProject(projectData);
    
    if (window.showToast) {
      window.showToast(`Proyecto CAPEX creado: ${project.name}`, 'success');
    }
    
    return project;
  };

  const handleAddManualExpense = (expenseData) => {
    const document = store.addManualCapexExpense(expenseData);
    
    if (window.showToast) {
      window.showToast(
        `Gasto manual añadido: ${formatCurrency(document.amount)}`, 
        'success'
      );
    }
    
    setShowManualExpenseModal(false);
  };

  const handleCapexYearClosure = (year) => {
    // Find properties with CAPEX activity in the year
    const propertiesWithCapex = properties.filter(property => {
      const propertyProjects = capexProjects.filter(project => 
        project.propertyId === property.id &&
        new Date(project.createdDate).getFullYear() === year
      );
      return propertyProjects.length > 0;
    });

    if (propertiesWithCapex.length === 0) {
      if (window.showToast) {
        window.showToast(`No hay actividad CAPEX en ${year}`, 'info');
      }
      return;
    }

    // Create closures for each property
    const closures = propertiesWithCapex.map(property => 
      store.closeCapexYear(year, property.id)
    );

    if (window.showToast) {
      window.showToast(
        `Cierre CAPEX ${year} completado (${closures.length} propiedades)`, 
        'success'
      );
    }
  };

  // Filter documents based on current filters
  const filteredDocuments = documents.filter(doc => {
    if (filterMonth !== 'all' && !doc.uploadDate.includes(`-${filterMonth}-`)) return false;
    if (filterProvider !== 'all' && doc.provider !== filterProvider) return false;
    if (filterProperty !== 'all' && doc.propertyId !== parseInt(filterProperty)) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    return true;
  });

  // Calculate fiscal summary
  const fiscalSummary = {
    deductible: documents.filter(d => d.isDeductible && d.status === 'Validada').reduce((sum, d) => sum + d.amount, 0),
    nonDeductible: documents.filter(d => !d.isDeductible).reduce((sum, d) => sum + d.amount, 0),
    pending: documents.filter(d => d.status === 'Pendiente').reduce((sum, d) => sum + d.amount, 0)
  };

  return (<>
    <header className="header">
      <div className="container nav">
        <div className="logo">
          <div className="logo-mark">
            <div className="bar short"></div>
            <div className="bar mid"></div>
            <div className="bar tall"></div>
          </div>
          <div>ATLAS</div>
        </div>
        <nav className="tabs">
          <a className="tab" href="/panel">Panel</a>
          <a className="tab" href="/tesoreria">Tesorería</a>
          <a className="tab" href="/inmuebles">Inmuebles</a>
          <a className="tab active" href="/documentos">Documentos</a>
          <a className="tab" href="/proyeccion">Proyección</a>
          <a className="tab" href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <span>🔍</span><span>🔔</span><span>⚙️</span>
        </div>
      </div>
    </header>

    <main className="container">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--navy)', margin:0}}>Documentos</h2>
        <button 
          onClick={() => setShowQuickClose(true)}
          className="btn btn-primary"
        >
          🚀 Cierre rápido
        </button>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-1 mb-4">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`btn ${activeTab === 'inbox' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          📥 Inbox
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          📄 Facturas
        </button>
      </div>

      {/* INBOX TAB */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Upload Zone */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Subida de Documentos</h3>
            
            <div 
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                background: dragOver ? '#F0FDFA' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📁</div>
              <div className="font-semibold mb-2">Arrastra aquí tus facturas o suéltalas desde el correo</div>
              <div className="text-sm text-gray mb-4">PDF, JPG, PNG, ZIP</div>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png,.heic,image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{display: 'none'}}
                id="file-input"
              />
              <input 
                type="file" 
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{display: 'none'}}
                id="camera-input"
              />
              <div className="flex gap-2">
                <label htmlFor="file-input" className="btn btn-primary">
                  📁 Seleccionar archivos
                </label>
                <label htmlFor="camera-input" className="btn btn-secondary">
                  📸 Cámara
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                className={`btn btn-primary ${isOCRProcessing ? 'opacity-50' : ''}`}
                onClick={handleProcessOCR}
                disabled={isOCRProcessing || selectedInboxEntries.length === 0}
              >
                {isOCRProcessing ? '⏳ Procesando...' : '🔍 Procesar con OCR'}
                {selectedInboxEntries.length > 0 && ` (${selectedInboxEntries.length})`}
              </button>
              {isOCRProcessing && (
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancelOCR}
                >
                  ❌ Cancelar OCR
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => setShowManualExpenseModal(true)}
              >
                ➕ Gasto manual
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleCapexYearClosure(new Date().getFullYear())}
              >
                📋 Cierre CAPEX {new Date().getFullYear()}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => store.clearInbox()}
              >
                🗑️ Limpiar
              </button>
              <div className="text-sm text-gray" style={{alignSelf: 'center', marginLeft: '16px'}}>
                💡 Soporta PDF, JPG, PNG, HEIC. OCR offline con Tesseract.js
              </div>
            </div>
          </div>

          {/* Inbox Entries */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Lista de Entradas</h3>
            
            {inboxEntries.length === 0 ? (
              <div style={{textAlign: 'center', padding: '48px 0', color: 'var(--gray)'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>📋</div>
                <div>Arrastra aquí tus facturas o suéltalas desde el correo.</div>
              </div>
            ) : (
              <>
                {/* Bulk Selection Info */}
                {selectedInboxEntries.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-medium text-blue-800">
                      {selectedInboxEntries.length} documento(s) seleccionado(s) para OCR
                    </span>
                  </div>
                )}
                
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{width: '40px'}}>
                          <input 
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInboxEntries(inboxEntries.map(e => e.id));
                              } else {
                                setSelectedInboxEntries([]);
                              }
                            }}
                            checked={selectedInboxEntries.length === inboxEntries.length && inboxEntries.length > 0}
                          />
                        </th>
                        <th>Fecha email/subida</th>
                        <th>Proveedor</th>
                        <th>Archivo</th>
                        <th>Estado</th>
                        <th>Confianza OCR</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inboxEntries.map(entry => (
                        <tr key={entry.id}>
                          <td>
                            <input 
                              type="checkbox"
                              checked={selectedInboxEntries.includes(entry.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInboxEntries([...selectedInboxEntries, entry.id]);
                                } else {
                                  setSelectedInboxEntries(selectedInboxEntries.filter(id => id !== entry.id));
                                }
                              }}
                            />
                          </td>
                          <td>{new Date(entry.uploadDate).toLocaleDateString('es-ES')}</td>
                          <td>
                            <div className="font-semibold">{entry.provider}</div>
                            {entry.isDuplicate && (
                              <span className="chip chip-warning chip-sm">
                                Posible duplicado
                              </span>
                            )}
                          </td>
                          <td>
                            <div>{entry.fileName}</div>
                            <div className="text-sm text-gray">{entry.fileSize}</div>
                            {entry.pagesOcr && entry.pagesOcr.length > 1 && (
                              <div className="text-xs text-blue-600">
                                {entry.pagesOcr.length} páginas procesadas
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`chip ${getStatusChipClass(entry.status)}`}>
                              {entry.status}
                            </span>
                            {ocrProgress[entry.id] && (
                              <div className="text-xs text-blue-600 mt-1">
                                {ocrProgress[entry.id].status}
                                {ocrProgress[entry.id].current && ocrProgress[entry.id].total && (
                                  <span> ({ocrProgress[entry.id].current}/{ocrProgress[entry.id].total})</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            {entry.ocrConfidence ? (
                              <div className="text-center">
                                <div className={`text-sm font-medium ${
                                  entry.ocrConfidence >= 90 ? 'text-green-600' :
                                  entry.ocrConfidence >= 70 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {entry.ocrConfidence}%
                                </div>
                                <div className="text-xs text-gray">
                                  {entry.ocrLang?.replace('+', ' + ')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray">—</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  // Show OCR text if available
                                  if (entry.ocrText) {
                                    alert(`OCR Text:\n\n${entry.ocrText.substring(0, 500)}${entry.ocrText.length > 500 ? '...' : ''}`);
                                  } else {
                                    alert('Vista de documento simulada');
                                  }
                                }}
                              >
                                👁️ Ver
                              </button>
                              {entry.status !== 'Validada' && entry.status !== 'OCR en curso' && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSendToInvoices(entry.id)}
                                >
                                  Enviar a Facturas
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FACTURAS TAB */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card">
            <div className="grid-4 gap-4">
              <div>
                <label className="text-sm font-medium">Mes</label>
                <select 
                  className="form-control"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="all">Todos los meses</option>
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Proveedor</label>
                <select 
                  className="form-control"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                >
                  <option value="all">Todos los proveedores</option>
                  {[...new Set(documents.map(d => d.provider))].map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Inmueble</label>
                <select 
                  className="form-control"
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                >
                  <option value="all">Todos los inmuebles</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.address}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <select 
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="Validada">Validada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Error">Error</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedDocuments.length > 0 && (
            <div className="card" style={{background: '#EFF6FF'}}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{selectedDocuments.length} documentos seleccionados</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => executeBulkAction('assign-property')}
                  >
                    Asignar inmueble
                  </button>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => executeBulkAction('validate')}
                  >
                    Marcar validada
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => executeBulkAction('request-duplicate')}
                  >
                    Pedir duplicado
                  </button>
                  <button 
                    className="btn btn-error btn-sm"
                    onClick={() => executeBulkAction('delete')}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Facturas Table */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Tabla de Facturas</h3>
            
            {filteredDocuments.length === 0 ? (
              <div style={{textAlign: 'center', padding: '48px 0', color: 'var(--gray)'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>📄</div>
                <div>Todavía no hay facturas. Sube o reenvía desde tu correo.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(filteredDocuments.map(d => d.id));
                            } else {
                              setSelectedDocuments([]);
                            }
                          }}
                        />
                      </th>
                      <th>Fecha</th>
                      <th>Proveedor</th>
                      <th>Concepto</th>
                      <th style={{textAlign: 'right'}}>Importe</th>
                      <th>Categoría</th>
                      <th>Inmueble</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(doc => (
                      <tr key={doc.id}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, doc.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                              }
                            }}
                          />
                        </td>
                        <td>{doc.uploadDate}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{doc.provider}</span>
                            {doc.ruleApplied && (
                              <span 
                                className="chip success" 
                                style={{fontSize: '10px', padding: '2px 6px'}}
                                title={`Regla aplicada: ${doc.provider} → ${doc.category}`}
                              >
                                Regla aplicada
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{doc.concept}</td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                          {formatCurrency(doc.amount)}
                        </td>
                        <td>
                          <select 
                            className="form-control"
                            value={doc.category}
                            onChange={() => alert('Categoría actualizada (simulado)')}
                          >
                            <option value="Seguros">Seguros</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Suministros">Suministros</option>
                            <option value="Servicios">Servicios</option>
                          </select>
                        </td>
                        <td>
                          <select 
                            className="form-control"
                            value={doc.propertyId || ''}
                            onChange={() => alert('Inmueble asignado (simulado)')}
                          >
                            <option value="">Sin asignar</option>
                            {properties.map(property => (
                              <option key={property.id} value={property.id}>
                                {property.address}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span className={`chip ${getStatusChipClass(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-secondary btn-xs"
                              data-action="invoice:view"
                              data-id={doc.id}
                              title="Ver"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-primary btn-xs"
                              onClick={() => handleBreakdownDocument(doc)}
                              title="Desglosar"
                            >
                              📋
                            </button>
                            <button 
                              className="btn btn-success btn-xs"
                              onClick={() => handleAssignToCapex(doc)}
                              title="Asignar a CAPEX"
                              disabled={!doc.propertyId}
                            >
                              🏗️
                            </button>
                            <button 
                              className="btn btn-secondary btn-xs"
                              data-action="invoice:edit"
                              data-id={doc.id}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-error btn-xs"
                              data-action="invoice:delete"
                              data-id={doc.id}
                              title="Borrar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fiscal Summary */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Resumen Fiscal</h3>
            <div className="grid-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray">Gastos deducibles</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                  {formatCurrency(fiscalSummary.deductible)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">No deducibles</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--gray)'}}>
                  {formatCurrency(fiscalSummary.nonDeductible)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">Pendientes</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--warning)'}}>
                  {formatCurrency(fiscalSummary.pending)}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="btn btn-primary"
                data-action="export:fiscal-pdf"
              >
                Exportar PDF (informe fiscal)
              </button>
              <button 
                className="btn btn-secondary"
                data-action="export:deductibles-csv"
              >
                Exportar Excel (deducibles)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div>
          {/* Filters */}
          <div className="card mb-4">
            <div className="flex gap-4">
              <select className="select">
                <option>Todos los meses</option>
                <option>Enero 2024</option>
                <option>Diciembre 2023</option>
              </select>
              <select className="select">
                <option>Todos los proveedores</option>
                <option>Iberdrola</option>
                <option>Gas Natural</option>
              </select>
              <select className="select">
                <option>Todos los inmuebles</option>
                <option>C/ Mayor 12</option>
                <option>Avda. Constitución 45</option>
              </select>
              <select className="select">
                <option>Todos los estados</option>
                <option>Validada</option>
                <option>Pendiente</option>
              </select>
            </div>
          </div>

          {/* Mass Actions Bar */}
          {selectedInvoices.length > 0 && (
            <div className="card mb-4" style={{background: '#EFF6FF', borderColor: 'var(--navy)'}}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {selectedInvoices.length} factura(s) seleccionada(s)
                </span>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => executeBulkAction('assign-property')}
                  >
                    Asignar inmueble
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => executeBulkAction('validate')}
                  >
                    Marcar validada
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => executeBulkAction('request-duplicate')}
                  >
                    Pedir duplicado
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => executeBulkAction('delete')}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Table */}
          <div className="card mb-4">
            <h3 style={{margin: '0 0 16px 0'}}>Facturas</h3>
            {documents.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width: '40px'}}>
                      <input type="checkbox" />
                    </th>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Concepto</th>
                    <th className="text-right">Importe</th>
                    <th>Categoría</th>
                    <th>Inmueble</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(invoice => (
                    <tr key={invoice.id}>
                      <td>
                        <input 
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id]);
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                            }
                          }}
                        />
                      </td>
                      <td>{invoice.date}</td>
                      <td className="font-medium">{invoice.provider}</td>
                      <td>{invoice.concept}</td>
                      <td className="text-right font-medium">€{invoice.amount.toFixed(2)}</td>
                      <td>
                        <select className="select" style={{fontSize: '12px', padding: '4px 8px'}} defaultValue={invoice.category}>
                          <option>Servicios</option>
                          <option>Mantenimiento</option>
                          <option>Gastos comunes</option>
                        </select>
                      </td>
                      <td>
                        <select className="select" style={{fontSize: '12px', padding: '4px 8px'}} defaultValue={invoice.property}>
                          <option value="">Seleccionar...</option>
                          <option>C/ Mayor 12</option>
                          <option>Avda. Constitución 45</option>
                        </select>
                      </td>
                      <td>
                        <span className={`chip ${getStatusChipClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button 
                            className="btn btn-secondary btn-sm"
                            data-action="invoice:view"
                            data-id={invoice.id}
                          >
                            Ver
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            data-action="invoice:edit"
                            data-id={invoice.id}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{textAlign: 'center', padding: '32px', color: 'var(--gray)'}}>
                Todavía no hay facturas. Sube o reenvía desde tu correo.
              </div>
            )}
          </div>

          {/* Fiscal Summary */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Resumen Fiscal</h3>
            <div className="grid-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray">Gastos deducibles</div>
                <div className="font-semibold" style={{fontSize: '18px', color: 'var(--success)'}}>€301.67</div>
              </div>
              <div>
                <div className="text-sm text-gray">No deducibles</div>
                <div className="font-semibold" style={{fontSize: '18px', color: 'var(--gray)'}}>€89.50</div>
              </div>
              <div>
                <div className="text-sm text-gray">Pendientes</div>
                <div className="font-semibold" style={{fontSize: '18px', color: 'var(--warning)'}}>€156.00</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-primary"
                data-action="export:fiscal-pdf"
              >
                📄 Exportar "Expediente Renta"
              </button>
              <button 
                className="btn btn-secondary"
                data-action="export:deductibles-csv"
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CLOSE MODAL */}
      {showQuickClose && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowQuickClose(false)}
        >
          <div 
            className="modal-content"
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>🚀 Cierre rápido — te faltan {missingInvoices.length} facturas</h3>
              <button 
                onClick={() => setShowQuickClose(false)}
                className="btn btn-secondary btn-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="text-sm text-gray mb-4">
              Tiempo estimado: 5 min. Recuperas deducibles y cierras el mes.
            </div>

            <div className="card mb-4">
              {missingInvoices.map(item => {
                // Check if this invoice would match any provider rule
                const matchingRule = storeState.providerRules?.find(rule => 
                  rule.active && item.provider.toLowerCase().includes(rule.providerContains.toLowerCase())
                );
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3" style={{borderBottom: '1px solid var(--border)'}}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.provider}</span>
                        {matchingRule && (
                          <span 
                            className="chip success" 
                            style={{fontSize: '10px', padding: '2px 6px'}}
                            title={`Se aplicará regla: ${matchingRule.providerContains} → ${matchingRule.category}`}
                          >
                            Regla disponible
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray">{item.date} • €{item.amount} • {item.concept}</div>
                      {item.propertyId && (
                        <div className="text-xs text-gray">
                          {properties.find(p => p.id === item.propertyId)?.address}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          // Simulate attaching document
                          setTimeout(() => {
                            // Create a new document entry
                            const newDoc = {
                              provider: item.provider,
                              concept: item.concept,
                              amount: item.amount,
                              propertyId: item.propertyId,
                              status: 'Validada',
                              category: matchingRule ? matchingRule.category : 'Servicios',
                              ruleApplied: !!matchingRule,
                              ruleId: matchingRule?.id
                            };
                            store.addDocument(newDoc);
                            
                            // Remove from missing invoices
                            const updatedMissing = storeState.missingInvoices.filter(mi => mi.id !== item.id);
                            store.setState({ missingInvoices: updatedMissing });
                            
                            // Show notification
                            if (typeof window !== 'undefined' && window.showToast) {
                              window.showToast(
                                matchingRule 
                                  ? `Documento adjuntado y regla aplicada: ${matchingRule.category}`
                                  : 'Documento adjuntado', 
                                'success'
                              );
                            }
                          }, 500); // Simulate processing delay
                        }}
                      >
                        📎 Adjuntar
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          // Simulate requesting duplicate
                          if (typeof window !== 'undefined' && window.showToast) {
                            window.showToast(`Duplicado solicitado a ${item.provider}`, 'success');
                          }
                        }}
                      >
                        📧 Pedir duplicado
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          // Simulate uploading photo
                          if (typeof window !== 'undefined' && window.showToast) {
                            window.showToast('Función de cámara simulada', 'info');
                          }
                        }}
                      >
                        📸 Subir foto
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowQuickClose(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                data-action="invoice:resolve-all"
              >
                ✅ Resolver todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* H9B: CAPEX Modals */}
      
      {/* Invoice Breakdown Modal */}
      <InvoiceBreakdownModal
        document={selectedDocumentForModal}
        isOpen={showBreakdownModal}
        onClose={() => {
          setShowBreakdownModal(false);
          setSelectedDocumentForModal(null);
        }}
        onSave={handleSaveBreakdown}
        fiscalTreatments={storeState.fiscalTreatments || []}
      />

      {/* CAPEX Assignment Modal */}
      <CapexAssignmentModal
        document={selectedDocumentForModal}
        property={selectedDocumentForModal ? properties.find(p => p.id === selectedDocumentForModal.propertyId) : null}
        capexProjects={storeState.capexProjects || []}
        isOpen={showCapexModal}
        onClose={() => {
          setShowCapexModal(false);
          setSelectedDocumentForModal(null);
        }}
        onAssign={handleCapexAssignment}
        onCreateProject={handleCreateCapexProject}
      />

      {/* Manual Expense Modal */}
      {showManualExpenseModal && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowManualExpenseModal(false)}
        >
          <div 
            className="modal-content"
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>➕ Gasto manual CAPEX</h3>
              <button 
                onClick={() => setShowManualExpenseModal(false)}
                className="btn btn-secondary btn-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const expenseData = {
                provider: formData.get('provider'),
                concept: formData.get('concept'),
                amount: parseFloat(formData.get('amount')),
                date: formData.get('date'),
                propertyId: parseInt(formData.get('propertyId')),
                fiscalTreatment: formData.get('fiscalTreatment'),
                capexProjectId: formData.get('capexProjectId') || null
              };
              handleAddManualExpense(expenseData);
            }}>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Proveedor *</label>
                  <input
                    type="text"
                    name="provider"
                    className="form-control"
                    required
                    placeholder="ej: Ferretería López"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Concepto *</label>
                  <input
                    type="text"
                    name="concept"
                    className="form-control"
                    required
                    placeholder="ej: Material reforma cocina"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Importe *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      className="form-control"
                      required
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fecha *</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Inmueble *</label>
                  <select name="propertyId" className="form-control" required>
                    <option value="">Seleccionar inmueble...</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.address || property.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tratamiento fiscal</label>
                  <select name="fiscalTreatment" className="form-control">
                    {(storeState.fiscalTreatments || []).map(treatment => (
                      <option key={treatment.id} value={treatment.id}>
                        {treatment.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Proyecto CAPEX (opcional)</label>
                  <select name="capexProjectId" className="form-control">
                    <option value="">Sin asignar a proyecto</option>
                    {(storeState.capexProjects || [])
                      .filter(project => project.status === 'active')
                      .map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} — {formatCurrency(project.spentAmount || 0)}/{formatCurrency(project.totalBudget || 0)}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowManualExpenseModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  ➕ Añadir gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>

    {/* Sticky Quick Close Button */}
    {showQuickClose && (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--success)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span className="font-medium">
          {selectedDocuments.length} documento(s) seleccionado(s)
        </span>
        <button
          onClick={handleQuickClose}
          className="btn btn-sm"
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none'
          }}
        >
          ✅ Cerrar rápido
        </button>
        <button
          onClick={() => {
            setSelectedDocuments([]);
            setShowQuickClose(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>
    )}
  </>);
}
