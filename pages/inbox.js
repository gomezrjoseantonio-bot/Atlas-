import { useState, useEffect } from 'react';
import store from '../store/index';

export default function Inbox() {
  const [storeState, setStoreState] = useState(() => store.getState());
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [processingFiles, setProcessingFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => unsubscribe();
  }, []);

  const inboxEntries = storeState?.inboxEntries || [];
  const properties = storeState?.properties || [];
  
  const pendingEntries = inboxEntries.filter(entry => 
    entry.status === 'Pendiente de procesamiento' || 
    entry.status === 'Error lectura'
  );

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
    return `${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleProcessOCR = () => {
    if (selectedFiles.length === 0) {
      window.showToast && window.showToast('Selecciona archivos para procesar', 'warning');
      return;
    }

    setProcessingFiles([...selectedFiles]);
    
    // Simulate OCR processing
    setTimeout(() => {
      const newEntries = selectedFiles.map((file, index) => ({
        id: `inbox_${Date.now()}_${index}`,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: Math.random() > 0.1 ? 'Pendiente de procesamiento' : 'Error lectura',
        origin: 'Subida',
        extractedData: Math.random() > 0.1 ? {
          date: new Date().toISOString().split('T')[0],
          supplier: `Proveedor ${Math.floor(Math.random() * 100)}`,
          concept: `Concepto extraído ${Math.floor(Math.random() * 100)}`,
          amount: Math.random() * 500 + 50
        } : null
      }));

      // Add to store
      store.updateState(state => ({
        ...state,
        inboxEntries: [...state.inboxEntries, ...newEntries]
      }));

      setSelectedFiles([]);
      setProcessingFiles([]);
      window.showToast && window.showToast(`${newEntries.length} documentos procesados`, 'success');
    }, 2000);
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  const handleAssignToProperty = (entryId, propertyId) => {
    const entry = inboxEntries.find(e => e.id === entryId);
    if (!entry) return;

    // Convert to document and remove from inbox
    const newDocument = {
      id: `doc_${Date.now()}`,
      fileName: entry.fileName,
      fileSize: entry.fileSize,
      uploadDate: entry.uploadDate,
      propertyId: propertyId,
      status: 'Validada',
      category: 'Corrientes',
      treatment: 'Deducible año (R/C)',
      origin: entry.origin,
      ...entry.extractedData
    };

    store.updateState(state => ({
      ...state,
      documents: [...state.documents, newDocument],
      inboxEntries: state.inboxEntries.filter(e => e.id !== entryId)
    }));

    window.showToast && window.showToast('Documento asignado correctamente', 'success');
  };

  const handleDeleteEntry = (entryId) => {
    store.updateState(state => ({
      ...state,
      inboxEntries: state.inboxEntries.filter(e => e.id !== entryId)
    }));
    window.showToast && window.showToast('Documento eliminado', 'info');
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'zip': return '📦';
      default: return '📄';
    }
  };

  return (
    <>
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
            <a className="tab" href="/inmuebles">Inmuebles</a>
            <a className="tab" href="/tesoreria">Tesorería</a>
            <a className="tab" href="/proyeccion">Proyección</a>
            <a className="tab" href="/configuracion">Configuración</a>
          </nav>
          <div className="actions">
            <a href="/inbox" className="btn btn-secondary btn-sm" style={{fontSize: '12px', marginRight: '8px', background: 'var(--accent-subtle)', color: 'var(--accent)'}}>
              📄 Subir documentos
            </a>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('Búsqueda próximamente disponible', 'info');
                }
              }}
              style={{marginRight: '12px', background: 'none', border: 'none', fontSize: '18px'}}
            >
              🔍
            </button>
            <span>🔔</span>
            <span>⚙️</span>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{color:'var(--accent)', margin: '0 0 4px 0'}}>Inbox Global</h2>
            <p className="text-sm text-gray" style={{margin: 0}}>
              Centro de triage para documentos pendientes de asignación
            </p>
          </div>
          <a href="/panel" className="btn btn-outline btn-sm">← Volver al Panel</a>
        </div>

        {/* Upload Section */}
        <div className="card mb-4">
          <h3 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Subir Documentos</h3>
          
          <div 
            className={`drag-drop-area ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              background: dragOver ? 'var(--accent-subtle)' : 'var(--bg)',
              transition: 'all 0.2s',
              marginBottom: '16px'
            }}
          >
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📁</div>
            <div style={{marginBottom: '8px', fontWeight: '500'}}>
              Arrastra archivos aquí o 
              <label className="btn btn-primary btn-sm" style={{marginLeft: '8px', cursor: 'pointer'}}>
                Seleccionar archivos
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf,.jpg,.jpeg,.png,.zip"
                  onChange={handleFileSelect}
                  style={{display: 'none'}}
                />
              </label>
            </div>
            <div className="text-sm text-gray">
              Formatos soportados: PDF, JPG, PNG, ZIP
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div style={{marginBottom: '16px'}}>
              <h4 style={{margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-2)'}}>
                Archivos seleccionados ({selectedFiles.length})
              </h4>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px'}}>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="chip gray">
                    {getFileIcon(file.name)} {file.name} ({Math.round(file.size / 1024)}KB)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={handleProcessOCR}
              disabled={selectedFiles.length === 0 || processingFiles.length > 0}
            >
              {processingFiles.length > 0 ? '⏳ Procesando...' : '🔍 Procesar con OCR'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleClearFiles}
              disabled={selectedFiles.length === 0}
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Pending Entries Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0, color: 'var(--accent)'}}>Documentos Pendientes</h3>
            <span className="text-sm text-gray">{pendingEntries.length} documentos</span>
          </div>

          {pendingEntries.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Fecha subida</th>
                    <th>Datos extraídos</th>
                    <th>Estado</th>
                    <th>Origen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(entry.fileName)}</span>
                          <div>
                            <div style={{fontWeight: '500'}}>{entry.fileName}</div>
                            <div className="text-xs text-gray">
                              {Math.round(entry.fileSize / 1024)}KB
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(entry.uploadDate).toLocaleDateString('es-ES')}</td>
                      <td>
                        {entry.extractedData ? (
                          <div className="text-sm">
                            <div><strong>{entry.extractedData.supplier}</strong></div>
                            <div>{entry.extractedData.concept}</div>
                            <div>{formatCurrency(entry.extractedData.amount)}</div>
                          </div>
                        ) : (
                          <span className="text-gray">No extraído</span>
                        )}
                      </td>
                      <td>
                        <span className={`chip ${
                          entry.status === 'Pendiente de procesamiento' ? 'warning' :
                          entry.status === 'Error lectura' ? 'error' : 'info'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        <span className="chip gray">{entry.origin}</span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {entry.extractedData && (
                            <select 
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignToProperty(entry.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="input"
                              style={{fontSize: '12px', padding: '4px 8px'}}
                            >
                              <option value="">Asignar a inmueble</option>
                              {properties.map(property => (
                                <option key={property.id} value={property.id}>
                                  {property.address}
                                </option>
                              ))}
                            </select>
                          )}
                          <button 
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            style={{fontSize: '12px'}}
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
          ) : (
            <div className="text-center py-8 text-gray">
              <div className="mb-2">📥</div>
              <div className="text-sm">No hay documentos pendientes</div>
              <div className="text-xs" style={{opacity: 0.7}}>
                Los documentos aparecerán aquí después del procesamiento OCR
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}