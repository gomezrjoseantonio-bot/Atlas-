import { useState } from 'react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [showQuickClose, setShowQuickClose] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const mockInboxItems = [
    {
      id: 1,
      date: '2024-01-15',
      provider: 'Iberdrola',
      file: 'factura_iberdrola_01.pdf',
      status: 'read',
      statusText: 'Leído'
    },
    {
      id: 2,
      date: '2024-01-12', 
      provider: 'Reparaciones García',
      file: 'presupuesto_fontaneria.jpg',
      status: 'error',
      statusText: 'Error lectura'
    },
    {
      id: 3,
      date: '2024-01-10',
      provider: 'Comunidad Vecinos',
      file: 'cuota_enero.pdf',
      status: 'pending',
      statusText: 'Listo para asignar'
    }
  ];

  const mockInvoices = [
    {
      id: 1,
      date: '2024-01-15',
      provider: 'Iberdrola',
      concept: 'Suministro eléctrico',
      amount: 145.67,
      category: 'Servicios',
      property: 'C/ Mayor 12',
      status: 'validated',
      statusText: 'Validada'
    },
    {
      id: 2,
      date: '2024-01-12',
      provider: 'Reparaciones García', 
      concept: 'Reparación fontanería',
      amount: 89.50,
      category: 'Mantenimiento',
      property: '',
      status: 'pending',
      statusText: 'Pendiente'
    },
    {
      id: 3,
      date: '2024-01-10',
      provider: 'Comunidad Vecinos',
      concept: 'Cuota mensual',
      amount: 156.00,
      category: 'Gastos comunes',
      property: 'C/ Mayor 12',
      status: 'expected',
      statusText: 'Cargo previsto'
    }
  ];

  const mockMissingInvoices = [
    {
      id: 1,
      provider: 'Gas Natural',
      date: '2024-01-08',
      amount: 67.50,
      property: 'C/ Mayor 12'
    },
    {
      id: 2,
      provider: 'Seguro Hogar',
      date: '2024-01-05',
      amount: 89.20,
      property: 'Avda. Constitución 45'
    },
    {
      id: 3,
      provider: 'Internet Fibra',
      date: '2024-01-01',
      amount: 45.99,
      property: 'C/ Mayor 12'
    }
  ];

  const getStatusChip = (status, text) => {
    const statusMap = {
      'validated': 'success',
      'pending': 'warning', 
      'error': 'error',
      'expected': 'gray',
      'read': 'success'
    };
    return <span className={`chip ${statusMap[status] || 'gray'}`}>{text}</span>;
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
        <div>
          {/* Upload Section */}
          <div className="card mb-4">
            <h3 style={{margin: '0 0 16px 0'}}>Subida de documentos</h3>
            <div 
              className="upload-zone"
              style={{
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                background: '#F9FAFB',
                marginBottom: '16px'
              }}
            >
              <div style={{fontSize: '24px', marginBottom: '8px'}}>📁</div>
              <div className="font-medium mb-2">Arrastra aquí tus facturas o suéltalas desde el correo</div>
              <div className="text-sm text-gray mb-4">PDF, JPG, PNG, ZIP</div>
              <div className="flex gap-2 justify-center">
                <button className="btn btn-primary">Seleccionar archivos</button>
                <button className="btn btn-secondary">Procesar con OCR</button>
                <button className="btn btn-secondary">Limpiar</button>
              </div>
            </div>
            <div className="text-sm text-gray">
              💡 El OCR es simulado en esta etapa
            </div>
          </div>

          {/* Inbox Entries */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Entradas recientes</h3>
            {mockInboxItems.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Archivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInboxItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td>{item.provider}</td>
                      <td className="text-sm">{item.file}</td>
                      <td>{getStatusChip(item.status, item.statusText)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-secondary btn-sm">Ver</button>
                          <button className="btn btn-primary btn-sm">Enviar a Facturas</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{textAlign: 'center', padding: '32px', color: 'var(--gray)'}}>
                Arrastra aquí tus facturas o suéltalas desde el correo.
              </div>
            )}
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
                  <button className="btn btn-secondary btn-sm">Asignar inmueble</button>
                  <button className="btn btn-secondary btn-sm">Marcar validada</button>
                  <button className="btn btn-secondary btn-sm">Pedir duplicado</button>
                  <button className="btn btn-secondary btn-sm">Borrar</button>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Table */}
          <div className="card mb-4">
            <h3 style={{margin: '0 0 16px 0'}}>Facturas</h3>
            {mockInvoices.length > 0 ? (
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
                  {mockInvoices.map(invoice => (
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
                      <td>{getStatusChip(invoice.status, invoice.statusText)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-secondary btn-sm">Ver</button>
                          <button className="btn btn-secondary btn-sm">Editar</button>
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
              <button className="btn btn-primary">📄 Exportar "Expediente Renta"</button>
              <button className="btn btn-secondary">📊 Exportar Excel</button>
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
              <h3 style={{margin: 0}}>🚀 Cierre rápido — te faltan {mockMissingInvoices.length} facturas</h3>
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
              {mockMissingInvoices.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3" style={{borderBottom: '1px solid var(--border)'}}>
                  <div className="flex-1">
                    <div className="font-medium">{item.provider}</div>
                    <div className="text-sm text-gray">{item.date} • €{item.amount} • {item.property}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm">📎 Adjuntar</button>
                    <button className="btn btn-secondary btn-sm">📧 Pedir duplicado</button>
                    <button className="btn btn-secondary btn-sm">📸 Subir foto</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowQuickClose(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                ✅ Resolver todos
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  </>);
}
