import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import store from '../store/index';
import { SearchIcon, BellIcon, SettingsIcon, RocketIcon, FileTextIcon, CheckIcon, AlertTriangleIcon, DownloadIcon, FilterIcon } from '../components/icons';

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('invoices'); // Default to facturas tab
  const [showQuickClose, setShowQuickClose] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state immediately
    return store.getState();
  });  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => {
      unsubscribe();
    };
  }, []);

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
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
  };

  // Filter documents based on current filters
  const filteredDocuments = (documents || []).filter(doc => {
    if (filterMonth !== 'all') {
      const docMonth = new Date(doc.uploadDate).getMonth();
      const filterMonthNum = parseInt(filterMonth);
      if (docMonth !== filterMonthNum) return false;
    }
    if (filterProvider !== 'all' && doc.provider !== filterProvider) return false;
    if (filterProperty !== 'all' && doc.propertyId !== parseInt(filterProperty)) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    return true;
  });

  // Get unique providers for filter
  const providers = [...new Set((documents || []).map(doc => doc.provider))];

  const executeBulkAction = (action) => {
    console.log(`Executing bulk action: ${action} on documents:`, selectedDocuments);
    setSelectedDocuments([]);
  };

  const mockMissingInvoices = missingInvoices;

  const deductibleExpenses = (documents || []).filter(doc => 
    doc.status === 'Validada' && doc.propertyId
  );
  
  const nonDeductibleExpenses = (documents || []).filter(doc => 
    doc.status === 'Validada' && !doc.propertyId
  );

  const pendingExpenses = (documents || []).filter(doc => 
    doc.status === 'Pendiente'
  );

  const totalDeductible = deductibleExpenses.reduce((sum, doc) => sum + doc.amount, 0);
  const totalNonDeductible = nonDeductibleExpenses.reduce((sum, doc) => sum + doc.amount, 0);
  const totalPending = pendingExpenses.reduce((sum, doc) => sum + doc.amount, 0);

  return (
    <div data-theme="atlas">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">ATLAS</div>
          <nav className="nav-menu">
            <a href="/panel" className="nav-link">Panel</a>
            <a href="/tesoreria" className="nav-link">Tesorería</a>
            <a href="/inmuebles" className="nav-link">Inmuebles</a>
            <a href="/documentos" className="nav-link nav-link-active">Documentos</a>
            <a href="/proyeccion" className="nav-link">Proyección</a>
            <a href="/configuracion" className="nav-link">Configuración</a>
          </nav>
          <div className="nav-actions">
            <SearchIcon size={16} />
            <BellIcon size={16} />
            <SettingsIcon size={16} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">

          {/* Page Header */}
          <div className="page-header">
            <h2>Documentos</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowQuickClose(true)}
              style={{display: 'flex', alignItems: 'center', gap: '8px'}}
            >
              <RocketIcon size={16} />
              Cierre rápido
            </button>
          </div>

          {/* Sub-navigation */}
          <div className="flex gap-1 mb-4">
            <button 
              onClick={() => router.push('/documentos')}
              className="btn btn-secondary btn-sm"
            >
              📥 Inbox
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className="btn btn-primary btn-sm"
              style={{display: 'flex', alignItems: 'center', gap: '6px'}}
            >
              <FileTextIcon size={14} />
              Facturas
            </button>
          </div>

          {/* FACTURAS TAB - Always show facturas since this is documentos-facturas route */}
          <div className="space-y-4">
            {/* Filters */}
            <div className="card">
              <div className="flex gap-4 items-end">
                <div className="form-group">
                  <label htmlFor="filter-month">Mes</label>
                  <select 
                    id="filter-month" 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="0">Enero</option>
                    <option value="1">Febrero</option>
                    <option value="2">Marzo</option>
                    <option value="3">Abril</option>
                    <option value="4">Mayo</option>
                    <option value="5">Junio</option>
                    <option value="6">Julio</option>
                    <option value="7">Agosto</option>
                    <option value="8">Septiembre</option>
                    <option value="9">Octubre</option>
                    <option value="10">Noviembre</option>
                    <option value="11">Diciembre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="filter-provider">Proveedor</label>
                  <select 
                    id="filter-provider" 
                    value={filterProvider} 
                    onChange={(e) => setFilterProvider(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    {providers.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="filter-property">Inmueble</label>
                  <select 
                    id="filter-property" 
                    value={filterProperty} 
                    onChange={(e) => setFilterProperty(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    {(properties || []).map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="filter-status">Estado</label>
                  <select 
                    id="filter-status" 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
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
                  <div style={{fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center'}}>
                    <FileTextIcon size={48} color="var(--icon-muted)" />
                  </div>
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
                        <th>Familia Fiscal</th>
                        <th>Inmueble</th>
                        <th>Prorrateo</th>
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
                          <td className="font-semibold">{doc.provider}</td>
                          <td>{doc.concept}</td>
                          <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                            {formatCurrency(doc.amount)}
                          </td>
                          <td>
                            <span className="chip chip-secondary">{doc.category}</span>
                          </td>
                          
                          {/* HITO 7: Expense Family */}
                          <td>
                            {doc.expenseFamily ? (
                              <span className="chip chip-gray">
                                {storeState.expenseFamilies.find(ef => ef.id === doc.expenseFamily)?.name.split(' ')[0] || doc.expenseFamily}
                              </span>
                            ) : (
                              <span className="text-gray text-sm">-</span>
                            )}
                            {doc.fiscalTreatment && (
                              <div className="text-xs text-gray">
                                {doc.fiscalTreatment === 'deductible' ? 'Deducible' : 
                                 doc.fiscalTreatment === 'capitalizable' ? 'Capitalizable' : 'No deducible'}
                              </div>
                            )}
                          </td>
                          
                          <td>
                            {doc.propertyId ? (
                              <span className="chip chip-primary">
                                {(properties || []).find(p => p.id === doc.propertyId)?.name || 'N/A'}
                              </span>
                            ) : (
                              <select 
                                className="select-inline"
                                defaultValue=""
                                onChange={(e) => {
                                  console.log('Assigning property', e.target.value, 'to document', doc.id);
                                }}
                              >
                                <option value="">Sin asignar</option>
                                {(properties || []).map(property => (
                                  <option key={property.id} value={property.id}>
                                    {property.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          
                          {/* HITO 7: Allocation */}
                          <td>
                            {doc.allocation ? (
                              (() => {
                                const property = properties.find(p => p.id === doc.propertyId);
                                if (!property || !property.multiUnit) {
                                  return <span className="allocation-chip no-divide">No prorr.</span>;
                                }
                                
                                const { method, distribution, excludedUnits = [] } = doc.allocation;
                                const totalUnits = property.units?.length || 0;
                                const allocatedUnits = Object.keys(distribution || {}).length;
                                const excludedCount = excludedUnits.length;
                                
                                switch (method) {
                                  case 'occupied':
                                    return <span className="allocation-chip occupied">Ocupadas {allocatedUnits}/{totalUnits}</span>;
                                  case 'total':
                                    return <span className="allocation-chip total">Totales {allocatedUnits}/{totalUnits}</span>;
                                  case 'sqm':
                                    return <span className="allocation-chip sqm">m²</span>;
                                  case 'custom':
                                    return <span className="allocation-chip custom">% custom</span>;
                                  case 'specific':
                                    const unitNames = Object.keys(distribution || {}).map(unitId => 
                                      property.units?.find(u => u.id == unitId)?.name
                                    ).filter(Boolean).join(', ');
                                    return <span className="allocation-chip specific">{unitNames}</span>;
                                  default:
                                    return <span className="allocation-chip no-divide">No prorr.</span>;
                                }
                              })()
                            ) : (
                              (() => {
                                const property = properties.find(p => p.id === doc.propertyId);
                                if (property && property.multiUnit) {
                                  return (
                                    <button 
                                      className="btn btn-primary btn-xs"
                                      data-action="document:allocate"
                                      data-id={doc.id}
                                      title="Prorratear ahora"
                                    >
                                      Prorratear ahora
                                    </button>
                                  );
                                }
                                return <span className="text-gray text-sm">-</span>;
                              })()
                            )}
                          </td>
                          <td>
                            <span className={`chip chip-${getStatusChipClass(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button 
                                className="btn btn-secondary btn-xs"
                                data-action="invoice:edit" 
                                data-id={doc.id}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-secondary btn-xs"
                                data-action="invoice:view" 
                                data-id={doc.id}
                                title="Ver"
                              >
                                👁️
                              </button>
                              <button 
                                className="btn btn-secondary btn-xs"
                                data-action="invoice:assign-movement" 
                                data-id={doc.id}
                                title="Asignar movimiento"
                              >
                                🔗
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
            <div className="grid grid-cols-3 gap-4">
              <div className="card">
                <h4 style={{margin: '0 0 8px 0', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <CheckIcon size={16} />
                  Gastos Deducibles
                </h4>
                <div className="text-xl font-bold">{formatCurrency(totalDeductible)}</div>
                <div className="text-sm text-gray">{deductibleExpenses.length} facturas</div>
              </div>
              <div className="card">
                <h4 style={{margin: '0 0 8px 0', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <AlertTriangleIcon size={16} />
                  No Deducibles
                </h4>
                <div className="text-xl font-bold">{formatCurrency(totalNonDeductible)}</div>
                <div className="text-sm text-gray">{nonDeductibleExpenses.length} facturas</div>
              </div>
              <div className="card">
                <h4 style={{margin: '0 0 8px 0', color: 'var(--error)'}}>⏳ Pendientes</h4>
                <div className="text-xl font-bold">{formatCurrency(totalPending)}</div>
                <div className="text-sm text-gray">{pendingExpenses.length} facturas</div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="card">
              <h4 style={{margin: '0 0 16px 0'}}>Exportar Datos</h4>
              <div className="flex gap-2">
                <button 
                  className="btn btn-primary"
                  data-action="export:csv-deductible"
                >
                  💾 Exportar CSV Deducibles
                </button>
                <button 
                  className="btn btn-secondary"
                  data-action="export:pdf-fiscal"
                  style={{display: 'flex', alignItems: 'center', gap: '6px'}}
                >
                  <DownloadIcon size={14} />
                  Informe PDF Fiscal
                </button>
              </div>
            </div>
          </div>

          {/* Quick Close Modal */}
          {showQuickClose && (
            <div className="modal-overlay" onClick={() => setShowQuickClose(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 style={{margin: 0}}>🚀 Cierre rápido — te faltan {mockMissingInvoices.length} facturas</h3>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowQuickClose(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <p>Proceso optimizado para resolver todas las facturas pendientes en 5 minutos.</p>
                  
                  {mockMissingInvoices.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '48px 0', color: 'var(--success)'}}>
                      <div style={{fontSize: '48px', marginBottom: '16px'}}>🎉</div>
                      <div className="font-semibold">¡Enhorabuena! No tienes facturas pendientes.</div>
                      <div className="text-sm text-gray">Tu documentación está al día.</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{marginBottom: '24px', padding: '16px', background: '#F3F4F6', borderRadius: '8px'}}>
                        <div className="font-semibold mb-2">📊 Progreso</div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{width: '0%'}}
                          ></div>
                        </div>
                        <div className="text-sm text-gray mt-1">0 de {mockMissingInvoices.length} resueltos</div>
                      </div>

                      <div className="space-y-2">
                        {mockMissingInvoices.slice(0, 10).map(invoice => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-semibold">{invoice.provider}</div>
                              <div className="text-sm text-gray">
                                {invoice.concept} · {formatCurrency(invoice.amount)}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                className="btn btn-primary btn-xs"
                                data-action="invoice:attach-file" 
                                data-id={invoice.id}
                              >
                                📎 Adjuntar
                              </button>
                              <button 
                                className="btn btn-secondary btn-xs"
                                data-action="invoice:request-duplicate" 
                                data-id={invoice.id}
                              >
                                📧 Pedir duplicado
                              </button>
                              <button 
                                className="btn btn-warning btn-xs"
                                data-action="invoice:upload-photo" 
                                data-id={invoice.id}
                              >
                                📷 Subir foto
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {mockMissingInvoices.length > 10 && (
                        <div className="text-center mt-4 text-gray">
                          Y {mockMissingInvoices.length - 10} facturas más...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowQuickClose(false)}
                  >
                    Cerrar
                  </button>
                  {mockMissingInvoices.length > 0 && (
                    <button 
                      className="btn btn-primary"
                      data-action="invoice:resolve-all"
                    >
                      🚀 Resolver todos
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}