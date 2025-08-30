import { useState, useEffect } from 'react';
import store from '../store/index';

export default function Page() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [showQuickClose, setShowQuickClose] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [storeState, setStoreState] = useState(store.getState());
  const [mounted, setMounted] = useState(false);

  // Subscribe to store changes and handle hydration
  useEffect(() => {
    setMounted(true);
    // Force a refresh of store state after mounting
    setStoreState(store.getState());
    const unsubscribe = store.subscribe(setStoreState);
    
    // Safety timeout - if we're still in loading state after 3 seconds, 
    // ensure we have data by resetting to demo data
    const safetyTimeout = setTimeout(() => {
      const currentState = store.getState();
      const hasData = currentState.accounts?.length > 0 || 
                     currentState.properties?.length > 0 || 
                     currentState.documents?.length > 0;
      
      if (!hasData) {
        console.log('Safety timeout: No data detected, forcing demo data');
        store.resetDemo();
        setStoreState(store.getState());
      }
    }, 3000);
    
    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div data-theme="atlas">
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
              <button className="btn btn-secondary btn-sm" style={{marginRight: '12px'}}>🔄 Demo</button>
              <span>🔍</span><span>🔔</span><span>⚙️</span>
            </div>
          </div>
        </header>
        <main className="container">
          <h2 style={{color:'var(--navy)', margin:'0 0 24px 0'}}>Documentos</h2>
          <div>Cargando...</div>
        </main>
      </div>
    );
  }

  const { documents = [], inboxEntries = [], missingInvoices = [], properties = [] } = storeState;

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    // Simulate file upload - add files to inbox
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const entry = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)}KB`,
        status: 'Pendiente de procesamiento',
        provider: 'Pendiente OCR',
        hasOcr: false
      };
      store.addInboxEntry(entry);
    });
    
    if (files.length > 0) {
      // Show toast using the event system
      const event = new CustomEvent('atlas:toast', {
        detail: { type: 'success', message: `${files.length} archivo(s) añadido(s) al Inbox` }
      });
      document.dispatchEvent(event);
    }
  };

  const handleFileSelect = (e) => {
    // Simulate file selection - add files to inbox
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const entry = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)}KB`,
        status: 'Pendiente de procesamiento',
        provider: 'Pendiente OCR',
        hasOcr: false
      };
      store.addInboxEntry(entry);
    });
    
    if (files.length > 0) {
      // Show toast using the event system
      const event = new CustomEvent('atlas:toast', {
        detail: { type: 'success', message: `${files.length} archivo(s) añadido(s) al Inbox` }
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
                accept=".pdf,.jpg,.jpeg,.png,.zip"
                onChange={handleFileSelect}
                style={{display: 'none'}}
                id="file-input"
              />
              <label htmlFor="file-input" className="btn btn-primary">
                Seleccionar archivos
              </label>
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                className="btn btn-primary"
                data-action="invoice:process-ocr"
              >
                Procesar con OCR
              </button>
              <button 
                className="btn btn-secondary"
                data-action="invoice:clear-upload"
              >
                Limpiar
              </button>
              <div className="text-sm text-gray" style={{alignSelf: 'center', marginLeft: '16px'}}>
                💡 El OCR es simulado en esta etapa
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
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha email/subida</th>
                      <th>Proveedor</th>
                      <th>Archivo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboxEntries.map(entry => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.uploadDate).toLocaleDateString('es-ES')}</td>
                        <td>
                          <div className="font-semibold">{entry.provider}</div>
                        </td>
                        <td>
                          <div>{entry.fileName}</div>
                          <div className="text-sm text-gray">{entry.fileSize}</div>
                        </td>
                        <td>
                          <span className={`chip ${getStatusChipClass(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-secondary btn-sm"
                              data-action="invoice:view"
                              data-id={entry.id}
                            >
                              Ver
                            </button>
                            {(entry.status === 'Leído' || entry.status === 'Listo para asignar') && (
                              <button 
                                className="btn btn-primary btn-sm"
                                data-action="inbox:send-to-invoices"
                                data-id={entry.id}
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
                              className="btn btn-secondary btn-sm"
                              data-action="invoice:view"
                              data-id={doc.id}
                            >
                              Ver
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              data-action="invoice:edit"
                              data-id={doc.id}
                            >
                              Editar
                            </button>
                            <button 
                              className="btn btn-error btn-sm"
                              data-action="invoice:delete"
                              data-id={doc.id}
                            >
                              Borrar
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
    </main>
  </>);
}
