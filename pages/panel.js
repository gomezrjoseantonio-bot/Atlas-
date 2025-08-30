import { useState } from 'react';

export default function Page() {
  const [personalMode, setPersonalMode] = useState(false);

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
          <a className="tab active" href="/panel">Panel</a>
          <a className="tab" href="/tesoreria">Tesorería</a>
          <a className="tab" href="/inmuebles">Inmuebles</a>
          <a className="tab" href="/documentos">Documentos</a>
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
        <h2 style={{color:'var(--navy)', margin:0}}>Panel</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">PERSONAL</span>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={personalMode} 
              onChange={(e) => setPersonalMode(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Consolidated Ribbon - Only when PERSONAL is ON */}
      {personalMode && (
        <div className="card mb-4" style={{background: 'linear-gradient(90deg, var(--teal) 0%, var(--navy) 100%)', color: '#fff'}}>
          <h3 style={{margin: '0 0 16px 0', fontSize: '16px'}}>Vista Consolidada</h3>
          <div className="grid-3 gap-4">
            <div>
              <div className="text-sm" style={{opacity: 0.8}}>Patrimonio Total</div>
              <div className="font-semibold" style={{fontSize: '20px'}}>€847.250</div>
            </div>
            <div>
              <div className="text-sm" style={{opacity: 0.8}}>Ingresos Mes</div>
              <div className="font-semibold" style={{fontSize: '20px'}}>€12.840</div>
            </div>
            <div>
              <div className="text-sm" style={{opacity: 0.8}}>Gastos Mes</div>
              <div className="font-semibold" style={{fontSize: '20px'}}>€8.650</div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Notification - Pending Invoices */}
      <div className="card mb-4" style={{borderColor: 'var(--warning)', background: '#FFFBEB'}}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium" style={{color: 'var(--warning)'}}>3 gastos sin factura</span>
            <span className="text-gray"> · Recupera deducciones (5 min)</span>
          </div>
          <a href="/documentos" className="btn btn-primary btn-sm">Resolver</a>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4">
        {/* ATLAS Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0, color: 'var(--navy)'}}>ATLAS · Inmuebles</h3>
            <span className="chip success">OK</span>
          </div>
          <div className="grid gap-4">
            <div>
              <div className="text-sm text-gray">Inmuebles en cartera</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>12 propiedades</div>
            </div>
            <div>
              <div className="text-sm text-gray">Ocupación media</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>94.2%</div>
            </div>
            <div>
              <div className="text-sm text-gray">Rentabilidad bruta</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>6.8%</div>
            </div>
          </div>
          <div className="mt-4">
            <a href="/inmuebles" className="btn btn-secondary btn-sm">Ver detalles</a>
          </div>
        </div>

        {/* PERSONAL Section - Only when enabled */}
        {personalMode ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0, color: 'var(--navy)'}}>PERSONAL</h3>
              <span className="chip warning">Pendiente</span>
            </div>
            <div className="grid gap-4">
              <div>
                <div className="text-sm text-gray">Saldo cuentas</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>€24.650</div>
              </div>
              <div>
                <div className="text-sm text-gray">Gastos mes</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>€3.240</div>
              </div>
              <div>
                <div className="text-sm text-gray">Deducciones</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>€890</div>
              </div>
            </div>
            <div className="mt-4">
              <a href="/tesoreria" className="btn btn-secondary btn-sm">Ver cuentas</a>
            </div>
          </div>
        ) : (
          <div className="card" style={{background: '#F9FAFB', border: '1px dashed var(--border)'}}>
            <div className="text-center p-4">
              <div className="text-gray mb-2">Activa PERSONAL para ver finanzas consolidadas</div>
              <button 
                onClick={() => setPersonalMode(true)}
                className="btn btn-primary btn-sm"
              >
                Activar PERSONAL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4">
        <h3 style={{color: 'var(--navy)', fontSize: '16px', marginBottom: '16px'}}>Acciones rápidas</h3>
        <div className="flex gap-2">
          <a href="/documentos" className="btn btn-secondary">📄 Subir factura</a>
          <a href="/inmuebles" className="btn btn-secondary">🏠 Nuevo inmueble</a>
          <a href="/tesoreria" className="btn btn-secondary">💳 Revisar cuentas</a>
        </div>
      </div>
    </main>

    <style jsx>{`
      .toggle {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      
      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #E5E7EB;
        transition: 0.2s;
        border-radius: 24px;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.2s;
        border-radius: 50%;
      }
      
      input:checked + .slider {
        background-color: var(--teal);
      }
      
      input:checked + .slider:before {
        transform: translateX(20px);
      }
    `}</style>
  </>);
}
