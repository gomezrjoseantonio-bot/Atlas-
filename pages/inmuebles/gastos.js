import { useState, useEffect } from 'react';
import store from '../../store/index';
import { mockData } from '../../data/mockData';

export default function GastosPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all');
  
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
          <a className="tab active" href="/inmuebles">Inmuebles</a>
          <a className="tab" href="/tesoreria">Tesorería</a>
          <a className="tab" href="/proyeccion">Proyección</a>
          <a className="tab" href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <a href="/inbox" className="btn btn-secondary btn-sm" style={{fontSize: '12px', marginRight: '8px'}}>
            📄 Subir documentos
          </a>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => store.resetDemo()}
            style={{marginRight: '12px'}}
          >
            🔄 Demo
          </button>
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
          <a href="/tesoreria" className="notification-badge">
            <span>🔔</span>
            {storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length > 0 && (
              <span className="badge">
                {storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length}
              </span>
            )}
          </a>
          <span>⚙️</span>
        </div>
      </div>
    </header>

    <main className="container">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--accent)', margin:0}}>Gastos</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          📄 Subir facturas
        </button>
      </div>

      <div className="text-sm text-gray mb-6">
        Facturas y documentos del activo: gastos corrientes y mejoras (CAPEX).
      </div>

      {/* Banner */}
      <div className="card mb-6" style={{borderColor: 'var(--warning)', background: '#FFFBEB'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{fontSize: '20px'}}>💡</span>
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
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            if (window.showToast) {
              window.showToast('Procesamiento de archivos próximamente disponible', 'info');
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            if (window.showToast) {
              window.showToast('Selección de archivos próximamente disponible', 'info');
            }
          }}
        >
          <div style={{fontSize: '48px', marginBottom: '16px'}}>📄</div>
          <div className="font-semibold mb-2">Arrastra archivos aquí o haz clic para seleccionar</div>
          <div className="text-sm text-gray mb-4">Formatos: PDF, JPG, PNG, ZIP (múltiples archivos)</div>
          <div className="flex gap-2 justify-center">
            <button className="btn btn-primary btn-sm">Procesar con OCR</button>
            <button className="btn btn-secondary btn-sm">Limpiar</button>
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
        <h3 style={{margin: '0 0 16px 0'}}>Documentos ({filteredDocuments.length})</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Concepto</th>
                <th style={{textAlign: 'right'}}>Importe</th>
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
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (window.showToast) {
                            window.showToast('Visualización de PDF próximamente disponible', 'info');
                          }
                        }}
                      >
                        👁
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (window.showToast) {
                            window.showToast('Edición de documentos próximamente disponible', 'info');
                          }
                        }}
                      >
                        ✏️
                      </button>
                      {(doc.treatment === 'mejora' || doc.treatment === 'mobiliario') && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowBreakdownModal(true);
                          }}
                        >
                          🧱
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{color: 'var(--danger)'}}
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                            if (window.showToast) {
                              window.showToast('Eliminación de documentos próximamente disponible', 'info');
                            }
                          }
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center text-gray">
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