import { useState, useEffect } from 'react';
import store from '../../store/index';
import { mockData } from '../../data/mockData';
import Header from '../../components/Header';
import { FileTextIcon, AlertTriangleIcon, BarChart3Icon } from '../../components/icons';

export default function GastosPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  
  const [storeState, setStoreState] = useState(() => {
    return store.getState();
  });

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => {
      unsubscribe();
    };
  }, []);

  const documents = storeState?.documents || mockData.documents || [];
  const properties = storeState?.properties || mockData.properties || [];

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    const validFiles = fileList.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type) && file.size < 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length !== fileList.length) {
      if (window.showToast) {
        window.showToast('Algunos archivos no son válidos (solo PDF, JPG, PNG < 10MB)', 'warning');
      }
    }

    setUploadedFiles(prev => [...prev, ...validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded'
    }))]);

    if (window.showToast) {
      window.showToast(`${validFiles.length} archivo(s) subido(s) correctamente`, 'success');
    }
  };

  const handleOCRProcess = async () => {
    if (uploadedFiles.length === 0) {
      if (window.showToast) {
        window.showToast('No hay archivos para procesar', 'warning');
      }
      return;
    }

    setIsProcessingOCR(true);
    
    // Simulate OCR processing
    for (let i = 0; i < uploadedFiles.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadedFiles(prev => prev.map((file, index) => 
        index === i ? { ...file, status: 'processing' } : file
      ));
    }

    // Simulate OCR completion and add to documents
    const newDocuments = uploadedFiles.map(fileData => ({
      id: Date.now() + Math.random(),
      filename: fileData.name,
      date: new Date().toISOString().split('T')[0],
      provider: 'Proveedor (OCR)',
      concept: 'Concepto extraído por OCR',
      amount: Math.round(Math.random() * 500 + 50), // Random amount for demo
      category: 'Suministros',
      treatment: 'deducible',
      status: 'Validada',
      origin: 'Subida',
      propertyId: null
    }));

    // Add documents to store
    store.updateState(state => ({
      ...state,
      documents: [...(state.documents || []), ...newDocuments]
    }));

    setIsProcessingOCR(false);
    setUploadedFiles([]);

    if (window.showToast) {
      window.showToast(`${newDocuments.length} documento(s) procesado(s) con OCR`, 'success');
    }
  };

  const handleExportPDF = () => {
    const data = filteredDocuments.map(doc => ({
      Fecha: doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '',
      Proveedor: doc.provider || '',
      Concepto: doc.concept || '',
      Importe: formatCurrency(doc.amount),
      Categoría: doc.category || '',
      Tratamiento: getTreatmentChip(doc.treatment).text,
      Estado: doc.status || '',
      Inmueble: getPropertyName(doc.propertyId)
    }));

    // Simulate PDF export
    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('Exportación completada (CSV por ahora)', 'success');
    }
  };

  const handleExportExcel = () => {
    // For now, same as CSV
    handleExportPDF();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.alias || property.address : 'Sin asignar';
  };

  const getTreatmentChip = (treatment) => {
    const treatments = {
      'deducible': { text: 'Deducible año (R/C)', class: 'success' },
      'mejora': { text: 'Mejora (CAPEX)', class: 'warning' },
      'mobiliario': { text: 'Mobiliario 10a', class: 'info' }
    };
    return treatments[treatment] || { text: treatment, class: 'neutral' };
  };

  const getStatusChip = (status) => {
    const statuses = {
      'Validada': 'success',
      'Pendiente': 'warning',
      'Error': 'error'
    };
    return statuses[status] || 'warning';
  };

  const getOriginChip = (origin) => {
    const origins = {
      'Subida': 'neutral',
      'Email': 'info',
      'CSV': 'success'
    };
    return origins[origin] || 'neutral';
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (filterType !== 'all') {
      if (filterType === 'corrientes' && doc.treatment !== 'deducible') return false;
      if (filterType === 'capex' && doc.treatment !== 'mejora') return false;
      if (filterType === 'mobiliario' && doc.treatment !== 'mobiliario') return false;
    }
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (filterOrigin !== 'all' && doc.origin !== filterOrigin) return false;
    if (filterAssignment !== 'all') {
      if (filterAssignment === 'asignado' && !doc.propertyId) return false;
      if (filterAssignment === 'sin_asignar' && doc.propertyId) return false;
    }
    return true;
  });

  // Calculate fiscal summary
  const fiscalSummary = {
    deducible: documents.filter(d => d.treatment === 'deducible').reduce((sum, d) => sum + (d.amount || 0), 0),
    amortizable: documents.filter(d => d.treatment === 'mejora' || d.treatment === 'mobiliario').reduce((sum, d) => sum + (d.amount || 0), 0),
    pendiente: documents.filter(d => d.status === 'Pendiente').length
  };

  const alertCount = storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  return (<>
    <Header 
      currentTab="inmuebles" 
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
      showInmueblesSubTabs={true}
      currentInmueblesTab="gastos"
    />

    <main className="container">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--accent)', margin:0}}>Gastos</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
          style={{display: 'flex', alignItems: 'center', gap: '6px'}}
        >
          <FileTextIcon size={16} /> Subir facturas
        </button>
      </div>

      <div className="text-sm text-gray mb-6">
        Facturas y documentos del activo: gastos corrientes y mejoras (CAPEX).
      </div>

      {/* Banner */}
      <div className="card mb-6" style={{borderColor: 'var(--warning)', background: '#FFFBEB'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon size={20} />
            <div>
              <div className="font-medium text-sm">
                Las mejoras (CAPEX) no se deducen completas en el año: se amortizan
              </div>
              <div className="text-xs text-gray">
                Mobiliario 10 años; resto según tipo
              </div>
            </div>
          </div>
          <button className="btn-close" style={{fontSize: '14px'}}>×</button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-4 mb-6">
        <a href="/inmuebles" className="tab">Cartera</a>
        <a href="/inmuebles/contratos" className="tab">Contratos</a>
        <a href="/inmuebles/prestamos" className="tab">Préstamos</a>
        <a href="/inmuebles/gastos" className="tab active">Gastos</a>
        <a href="/inmuebles/analisis" className="tab">Análisis</a>
      </div>

      {/* Upload Section */}
      <div className="card mb-6">
        <h3 style={{margin: '0 0 16px 0'}}>Subir documentos</h3>
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
          style={{
            borderColor: uploadedFiles.length > 0 ? 'var(--success)' : 'var(--border)',
            backgroundColor: uploadedFiles.length > 0 ? '#F0FDF4' : 'transparent'
          }}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFileUpload(files);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.pdf,.jpg,.jpeg,.png';
            input.onchange = (e) => {
              if (e.target.files.length > 0) {
                handleFileUpload(e.target.files);
              }
            };
            input.click();
          }}
        >
          <div style={{fontSize: '48px', marginBottom: '16px'}}>
            {uploadedFiles.length > 0 ? '✅' : '📄'}
          </div>
          <div className="font-semibold mb-2">
            {uploadedFiles.length > 0 
              ? `${uploadedFiles.length} archivo(s) subido(s)` 
              : 'Arrastra archivos aquí o haz clic para seleccionar'
            }
          </div>
          <div className="text-sm text-gray mb-4">Formatos: PDF, JPG, PNG (máx. 10MB cada uno)</div>
          
          {uploadedFiles.length > 0 && (
            <div className="mb-4">
              <div className="text-left max-w-md mx-auto">
                {uploadedFiles.map((fileData) => (
                  <div key={fileData.id} className="flex items-center justify-between p-2 bg-white rounded border mb-1">
                    <div className="text-sm">
                      <div className="font-medium">{fileData.name}</div>
                      <div className="text-gray">{(fileData.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <div className="text-xs">
                      {fileData.status === 'uploaded' && '📤'}
                      {fileData.status === 'processing' && '⏳'}
                      {fileData.status === 'completed' && '✅'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <button 
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOCRProcess();
              }}
              disabled={uploadedFiles.length === 0 || isProcessingOCR}
            >
              {isProcessingOCR ? '⏳ Procesando...' : '🔍 Procesar con OCR'}
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFiles([]);
                if (window.showToast) {
                  window.showToast('Archivos eliminados', 'info');
                }
              }}
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h3 style={{margin: '0 0 16px 0'}}>Filtros rápidos</h3>
        <div className="grid-4 gap-4">
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select 
              className="form-control"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="corrientes">Corrientes (R/C)</option>
              <option value="capex">CAPEX</option>
              <option value="mobiliario">Mobiliario</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Estado</label>
            <select 
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Validada">Validada</option>
              <option value="Error">Error</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Origen</label>
            <select 
              className="form-control"
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Subida">Subida</option>
              <option value="Email">Email</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Asignación</label>
            <select 
              className="form-control"
              value={filterAssignment}
              onChange={(e) => setFilterAssignment(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="asignado">Asignado</option>
              <option value="sin_asignar">Sin asignar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0}}>Documentos ({filteredDocuments.length})</h3>
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleExportPDF}
              disabled={filteredDocuments.length === 0}
            >
              📄 Exportar PDF
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleExportExcel}
              disabled={filteredDocuments.length === 0}
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Concepto</th>
                <th style={{textAlign: 'right'}}>Importe (ES)</th>
                <th>Categoría</th>
                <th>Tratamiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '—'}</td>
                  <td>{doc.provider || '—'}</td>
                  <td>{doc.concept || '—'}</td>
                  <td style={{textAlign: 'right'}}>{formatCurrency(doc.amount)}</td>
                  <td>{doc.category || '—'}</td>
                  <td>
                    {doc.treatment && (
                      <span className={`chip ${getTreatmentChip(doc.treatment).class}`}>
                        {getTreatmentChip(doc.treatment).text}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`chip ${getStatusChip(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (window.showToast) {
                            window.showToast(`Visualizando ${doc.filename || 'documento'}`, 'info');
                          }
                        }}
                        title="Ver"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (window.showToast) {
                            window.showToast(`Editando ${doc.concept || 'documento'}`, 'info');
                          }
                        }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {(doc.treatment === 'mejora' || doc.treatment === 'mobiliario') && (
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowBreakdownModal(true);
                          }}
                          title="Desglosar CAPEX"
                        >
                          🧱
                        </button>
                      )}
                      <button 
                        className="btn btn-error btn-sm"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                            store.updateState(state => ({
                              ...state,
                              documents: state.documents.filter(d => d.id !== doc.id)
                            }));
                            if (window.showToast) {
                              window.showToast('Documento eliminado', 'success');
                            }
                          }
                        }}
                        title="Borrar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center text-gray py-8">
                    No hay documentos que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiscal Summary */}
      <div className="card">
        <h3 style={{margin: '0 0 16px 0'}}>Resumen fiscal</h3>
        <div className="grid-3 gap-4 mb-4">
          <div className="card" style={{background: '#F0FDF4'}}>
            <div className="text-sm text-gray">Deducible año</div>
            <div className="font-bold text-lg" style={{color: 'var(--success)'}}>
              {formatCurrency(fiscalSummary.deducible)}
            </div>
          </div>
          <div className="card" style={{background: '#FFFBEB'}}>
            <div className="text-sm text-gray">Amortizable (CAPEX)</div>
            <div className="font-bold text-lg" style={{color: 'var(--warning)'}}>
              {formatCurrency(fiscalSummary.amortizable)}
            </div>
          </div>
          <div className="card" style={{background: '#FEF2F2'}}>
            <div className="text-sm text-gray">Documentos pendientes</div>
            <div className="font-bold text-lg" style={{color: 'var(--danger)'}}>
              {fiscalSummary.pendiente}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Exportación PDF próximamente disponible', 'info');
              }
            }}
          >
            📄 Exportar PDF
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Exportación Excel próximamente disponible', 'info');
              }
            }}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>
    </main>

    {/* CAPEX Breakdown Modal */}
    {showBreakdownModal && selectedDocument && (
      <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowBreakdownModal(false)}>
        <div className="modal" style={{maxWidth: '600px'}} onMouseDown={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0}}>Desglosar inversión (CAPEX)</h3>
            <button className="btn-close" onClick={() => setShowBreakdownModal(false)}>×</button>
          </div>
          
          <div className="mb-4">
            <div className="font-semibold mb-2">{selectedDocument.concept}</div>
            <div className="text-sm text-gray mb-4">
              Importe total: {formatCurrency(selectedDocument.amount)}
            </div>
            
            <div className="space-y-3">
              <div className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Mejoras estructurales</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{width: '120px', margin: 0}} 
                    placeholder="0,00"
                  />
                </div>
                <div className="text-xs text-gray">Tipo fiscal: Mejora | Prorrateo: m²</div>
              </div>
              
              <div className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Mobiliario</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{width: '120px', margin: 0}} 
                    placeholder="0,00"
                  />
                </div>
                <div className="text-xs text-gray">Tipo fiscal: Mobiliario 10a | Años amortización: 10</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBreakdownModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('Desglose CAPEX guardado correctamente', 'success');
                }
                setShowBreakdownModal(false);
              }}
            >
              Guardar desglose
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
}