import { useState } from 'react';

export default function Page() {
  const [activeSection, setActiveSection] = useState('perfil');

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
          <a className="tab" href="/documentos">Documentos</a>
          <a className="tab" href="/proyeccion">Proyección</a>
          <a className="tab active" href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <span>🔍</span><span>🔔</span><span>⚙️</span>
        </div>
      </div>
    </header>

    <main className="container">
      <h2 style={{color:'var(--navy)', margin:'0 0 24px 0'}}>Configuración</h2>

      {/* Section Navigation */}
      <div className="flex gap-1 mb-4">
        <button 
          onClick={() => setActiveSection('perfil')}
          className={`btn ${activeSection === 'perfil' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          👤 Perfil
        </button>
        <button 
          onClick={() => setActiveSection('inmuebles')}
          className={`btn ${activeSection === 'inmuebles' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          🏠 Inmuebles
        </button>
        <button 
          onClick={() => setActiveSection('fiscal')}
          className={`btn ${activeSection === 'fiscal' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          📊 Fiscal
        </button>
        <button 
          onClick={() => setActiveSection('avanzado')}
          className={`btn ${activeSection === 'avanzado' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          ⚙️ Avanzado
        </button>
      </div>

      {/* PERFIL SECTION */}
      {activeSection === 'perfil' && (
        <div className="grid gap-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Información Personal</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1">Nombre completo</label>
                <input type="text" className="input" defaultValue="José Antonio Gómez" style={{width: '100%'}} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Email</label>
                <input type="email" className="input" defaultValue="jose@example.com" style={{width: '100%'}} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Teléfono</label>
                <input type="tel" className="input" defaultValue="+34 600 123 456" style={{width: '100%'}} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Preferencias</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Modo PERSONAL</div>
                  <div className="text-sm text-gray">Incluir finanzas personales en el panel</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notificaciones por email</div>
                  <div className="text-sm text-gray">Recibir alertas de pagos y vencimientos</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Recordatorios móviles</div>
                  <div className="text-sm text-gray">Push notifications en el móvil</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INMUEBLES SECTION */}
      {activeSection === 'inmuebles' && (
        <div className="grid gap-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Configuración de Inmuebles</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1">Incremento anual por defecto</label>
                <div className="flex gap-2">
                  <input type="number" className="input" defaultValue="2.5" style={{width: '100px'}} />
                  <span className="flex items-center">%</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Fianza estándar</label>
                <div className="flex gap-2">
                  <input type="number" className="input" defaultValue="2" style={{width: '100px'}} />
                  <span className="flex items-center">meses de alquiler</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Comisión gestión (%)</label>
                <input type="number" className="input" defaultValue="8" style={{width: '100px'}} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Tipos de Inmueble</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2" style={{background: '#F9FAFB', borderRadius: '6px'}}>
                <span>🏠 Piso</span>
                <button className="btn btn-secondary btn-sm">Editar</button>
              </div>
              <div className="flex items-center justify-between p-2" style={{background: '#F9FAFB', borderRadius: '6px'}}>
                <span>🏢 Local comercial</span>
                <button className="btn btn-secondary btn-sm">Editar</button>
              </div>
              <div className="flex items-center justify-between p-2" style={{background: '#F9FAFB', borderRadius: '6px'}}>
                <span>🏘️ Casa</span>
                <button className="btn btn-secondary btn-sm">Editar</button>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm mt-3">+ Nuevo tipo</button>
          </div>
        </div>
      )}

      {/* FISCAL SECTION */}
      {activeSection === 'fiscal' && (
        <div className="grid gap-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Configuración Fiscal</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1">NIF/CIF</label>
                <input type="text" className="input" defaultValue="12345678Z" style={{width: '200px'}} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Régimen fiscal</label>
                <select className="select" style={{width: '250px'}}>
                  <option>Estimación directa simplificada</option>
                  <option>Estimación directa normal</option>
                  <option>Estimación objetiva</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Trimestre actual</label>
                <select className="select" style={{width: '150px'}}>
                  <option>1T 2024</option>
                  <option>2T 2024</option>
                  <option>3T 2024</option>
                  <option>4T 2024</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Categorías de Gastos</h3>
            <div className="space-y-2">
              {['Suministros', 'Mantenimiento', 'Seguros', 'Gastos comunidad', 'IBI', 'Gestión'].map(category => (
                <div key={category} className="flex items-center justify-between p-2" style={{background: '#F9FAFB', borderRadius: '6px'}}>
                  <span>{category}</span>
                  <div className="flex gap-1">
                    <span className="chip success">Deducible</span>
                    <button className="btn btn-secondary btn-sm">Editar</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm mt-3">+ Nueva categoría</button>
          </div>
        </div>
      )}

      {/* AVANZADO SECTION */}
      {activeSection === 'avanzado' && (
        <div className="grid gap-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Integraciones</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Conexión bancaria</div>
                  <div className="text-sm text-gray">Sincronización automática con cuentas</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip success">Conectado</span>
                  <button className="btn btn-secondary btn-sm">Gestionar</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Google Drive</div>
                  <div className="text-sm text-gray">Backup automático de documentos</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip gray">No conectado</span>
                  <button className="btn btn-primary btn-sm">Conectar</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Asesoría fiscal</div>
                  <div className="text-sm text-gray">Compartir datos con gestoria</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip warning">Pendiente</span>
                  <button className="btn btn-secondary btn-sm">Configurar</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Datos y Privacidad</h3>
            <div className="space-y-3">
              <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'flex-start'}}>
                📥 Exportar todos los datos
              </button>
              <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'flex-start'}}>
                🗄️ Hacer backup completo
              </button>
              <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'flex-start'}}>
                🔐 Gestionar permisos
              </button>
              <div style={{borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '16px'}}>
                <button className="btn" style={{background: 'var(--error)', color: '#fff', width: '100%', justifyContent: 'flex-start'}}>
                  🗑️ Eliminar cuenta permanentemente
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Información del Sistema</h3>
            <div className="text-sm text-gray space-y-1">
              <div>Versión ATLAS: 2.1.4</div>
              <div>Última actualización: 15/01/2024</div>
              <div>Base de datos: 2.4 MB</div>
              <div>Documentos: 847 MB</div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex gap-2 justify-end">
        <button className="btn btn-secondary">Cancelar</button>
        <button className="btn btn-primary">💾 Guardar cambios</button>
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

      .space-y-1 > * + * { margin-top: 4px; }
      .space-y-2 > * + * { margin-top: 8px; }
      .space-y-3 > * + * { margin-top: 12px; }
      .space-y-4 > * + * { margin-top: 16px; }
    `}</style>
  </>);
}