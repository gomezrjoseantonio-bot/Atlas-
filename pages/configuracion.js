import { useState, useEffect } from 'react';
import store from '../store/index';
import { mockData } from '../data/mockData';
import Header from '../components/Header';

export default function Page() {
  const [activeSection, setActiveSection] = useState('bancos');
  const [personalToggle, setPersonalToggle] = useState(true);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state if available, otherwise use mockData
    if (typeof window !== 'undefined') {
      return store.getState();
    }
    return {
      accounts: mockData.accounts || [],
      sweepConfig: {},
      rulesEngineEnabled: true,
      ...mockData
    };
  });

  // Subscribe to store changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unsubscribe = store.subscribe(setStoreState);
      return () => {
        unsubscribe();
      };
    }
  }, []);

  // Use accounts from store state with fallback to mockData
  const accounts = storeState?.accounts || mockData.accounts || [];
  const users = mockData.users || [];
  const sweepConfig = storeState?.sweepConfig || {};
  const rulesEngineEnabled = storeState?.rulesEngineEnabled ?? true;

  const alertCount = storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  // Define sub-tabs for configuracion
  const subTabs = [
    { key: 'bancos', icon: '🏦', label: 'Bancos & Cuentas' },
    { key: 'plan', icon: '💳', label: 'Plan & Facturación' },
    { key: 'usuarios', icon: '👥', label: 'Usuarios & Roles' },
    { key: 'preferencias', icon: '⚙️', label: 'Preferencias & Datos' }
  ];

  return (<>
    <Header 
      currentTab="configuracion" 
      subTabs={subTabs}
      activeSubTab={activeSection}
      onSubTabChange={setActiveSection}
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
    />

    <main className="container">
      <h2 style={{color:'var(--navy)', margin:'0 0 24px 0'}}>Configuración</h2>

      {/* Bancos & Cuentas */}
      {activeSection === 'bancos' && (
        <div className="space-y-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Cuentas Bancarias</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Banco</th>
                    <th>Nombre de la cuenta</th>
                    <th>IBAN</th>
                    <th style={{textAlign: 'right'}}>Saldo actual</th>
                    <th>Alias</th>
                    <th>Ocultar en panel</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account.id}>
                      <td className="font-semibold">{account.bank}</td>
                      <td>{account.name}</td>
                      <td className="text-sm text-gray">{account.iban}</td>
                      <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                        €{account.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control"
                          defaultValue={account.name}
                          style={{width: '120px'}}
                        />
                      </td>
                      <td>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={account.hidden}
                            onChange={() => alert('Toggle simulado')}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-secondary btn-sm">Editar</button>
                          <button className="btn btn-error btn-sm">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => setShowNewAccountModal(true)}
            >
              + Conectar nueva cuenta
            </button>
          </div>

          {/* Reglas & Sweeps - Moved from Tesorería */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: '0'}}>Reglas & Sweeps</h3>
              <a href="/tesoreria-reglas" className="btn btn-secondary btn-sm">
                ⚙️ Configurar reglas avanzadas
              </a>
            </div>
            
            {/* Provider Rules Summary */}
            <div className="mb-4">
              <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Reglas por Proveedor</h4>
              <div className="grid gap-2">
                {storeState.providerRules && storeState.providerRules.filter(r => r.active).slice(0, 3).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-2" style={{background: '#F9FAFB', borderRadius: '4px'}}>
                    <span className="text-sm">
                      Si proveedor contiene "<strong>{rule.providerContains}</strong>" → <span className="chip">{rule.category}</span>
                    </span>
                    <span className="chip success">Activa</span>
                  </div>
                ))}
                {(!storeState.providerRules || storeState.providerRules.filter(r => r.active).length === 0) && (
                  <div className="text-sm text-gray">No hay reglas activas configuradas</div>
                )}
              </div>
            </div>

            {/* Sweep Configuration */}
            <div className="mb-4">
              <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Configuración de Sweeps</h4>
              
              <div className="grid-2 gap-6">
                <div>
                  <label className="form-label">Cuenta Hub</label>
                  <select 
                    className="form-control"
                    value={sweepConfig.hubAccountId || ''}
                    onChange={(e) => store.updateSweepConfig({ 
                      hubAccountId: parseInt(e.target.value) 
                    })}
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.bank})
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray mt-1">
                    Cuenta desde la que se sugerirán los movimientos automáticos
                  </div>
                </div>

                <div>
                  <label className="form-label">Ventana de emparejamiento</label>
                  <select 
                    className="form-control"
                    value={sweepConfig.movementMatchingDays || 3}
                    onChange={(e) => store.updateSweepConfig({ 
                      movementMatchingDays: parseInt(e.target.value) 
                    })}
                  >
                    <option value={1}>±1 día</option>
                    <option value={3}>±3 días</option>
                    <option value={7}>±7 días</option>
                  </select>
                  <div className="text-sm text-gray mt-1">
                    Margen para vincular movimientos con facturas automáticamente
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={sweepConfig.autoSweepEnabled || false}
                    onChange={(e) => store.updateSweepConfig({ 
                      autoSweepEnabled: e.target.checked 
                    })}
                  />
                  <span className="form-label" style={{margin: 0}}>Auto-sweep</span>
                </label>
                <div className="text-sm text-gray mt-1">
                  Cuando está activado, se sugerirán movimientos automáticamente al abrir la app (sin ejecutar)
                </div>
              </div>

              {/* Account Target Balances */}
              <div className="mt-6">
                <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Saldos Objetivo por Cuenta</h4>
                <div className="grid gap-3">
                  {accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-3" style={{background: '#F9FAFB', borderRadius: '8px'}}>
                      <div className="flex-1">
                        <div className="font-semibold">{account.name}</div>
                        <div className="text-sm text-gray">{account.bank}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray">Actual</div>
                          <div className="font-semibold">
                            €{account.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Objetivo:</label>
                          <input 
                            type="number"
                            className="form-control"
                            style={{width: '120px'}}
                            value={account.targetBalance}
                            onChange={(e) => {
                              const updatedAccounts = storeState.accounts.map(acc => 
                                acc.id === account.id 
                                  ? { ...acc, targetBalance: parseFloat(e.target.value) || 0 }
                                  : acc
                              );
                              store.setState({ accounts: updatedAccounts });
                            }}
                          />
                          <span className="text-sm text-gray">€</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan & Facturación */}
      {activeSection === 'plan' && (
        <div className="space-y-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Plan Actual</h3>
            <div className="flex items-center justify-between p-4" style={{background: '#F0FDFA', borderRadius: '8px', border: '1px solid var(--teal)'}}>
              <div>
                <div className="font-semibold" style={{fontSize: '18px'}}>Plan Free</div>
                <div className="text-sm text-gray">Hasta 3 inmuebles · Funciones básicas</div>
              </div>
              <div className="text-right">
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--teal)'}}>€0/mes</div>
                <button className="btn btn-primary btn-sm mt-2">Actualizar a Pro</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Planes Disponibles</h3>
            <div className="grid-2 gap-4">
              <div className="card" style={{background: '#F9FAFB'}}>
                <div className="font-semibold mb-2">Plan Pro</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--navy)'}}>€29/mes</div>
                <div className="text-sm text-gray mb-4">Facturado anualmente</div>
                <ul className="text-sm" style={{listStyle: 'none', padding: 0}}>
                  <li style={{marginBottom: '8px'}}>✅ Inmuebles ilimitados</li>
                  <li style={{marginBottom: '8px'}}>✅ Análisis avanzados</li>
                  <li style={{marginBottom: '8px'}}>✅ Exportación fiscal</li>
                  <li style={{marginBottom: '8px'}}>✅ Soporte prioritario</li>
                </ul>
                <button className="btn btn-primary">Seleccionar</button>
              </div>
              <div className="card" style={{background: '#F9FAFB'}}>
                <div className="font-semibold mb-2">Plan Enterprise</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--navy)'}}>€99/mes</div>
                <div className="text-sm text-gray mb-4">Facturado anualmente</div>
                <ul className="text-sm" style={{listStyle: 'none', padding: 0}}>
                  <li style={{marginBottom: '8px'}}>✅ Todo lo de Pro</li>
                  <li style={{marginBottom: '8px'}}>✅ Multi-empresa</li>
                  <li style={{marginBottom: '8px'}}>✅ API completa</li>
                  <li style={{marginBottom: '8px'}}>✅ Gestión de equipos</li>
                </ul>
                <button className="btn btn-secondary">Contactar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usuarios & Roles */}
      {activeSection === 'usuarios' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Usuarios del equipo</h3>
              <button className="btn btn-primary">+ Invitar usuario</button>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Último acceso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="font-semibold">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`chip ${user.role === 'Administrador' ? 'success' : 'gray'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.lastLogin).toLocaleDateString('es-ES')}</td>
                      <td>
                        <span className={`chip ${user.status === 'Activo' ? 'success' : 'error'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-secondary btn-sm">Editar</button>
                          {user.id !== 1 && (
                            <button className="btn btn-error btn-sm">Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Roles y Permisos</h3>
            <div className="grid-2 gap-4">
              <div>
                <div className="font-semibold mb-2">Administrador</div>
                <div className="text-sm text-gray mb-3">Acceso completo a todas las funciones</div>
                <div className="text-sm">
                  ✅ Gestionar inmuebles<br/>
                  ✅ Ver finanzas<br/>
                  ✅ Gestionar usuarios<br/>
                  ✅ Configuración
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Gestor</div>
                <div className="text-sm text-gray mb-3">Acceso a gestión de inmuebles y documentos</div>
                <div className="text-sm">
                  ✅ Gestionar inmuebles<br/>
                  ✅ Subir documentos<br/>
                  ❌ Ver finanzas completas<br/>
                  ❌ Gestionar usuarios
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferencias & Datos */}
      {activeSection === 'preferencias' && (
        <div className="space-y-4">
          {/* HITO 6: Automation Preferences */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>🤖 Automatización & Alertas</h3>
            <div className="grid-2 gap-6">
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    checked={rulesEngineEnabled || true}
                    onChange={(e) => store.setState({ rulesEngineEnabled: e.target.checked })}
                  />
                  <span className="form-label" style={{margin: 0}}>Motor de reglas activado</span>
                </label>
                <div className="text-sm text-gray mb-4">
                  Clasifica documentos automáticamente y sugiere movimientos entre cuentas
                </div>

                <label className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    checked={sweepConfig.showCriticalAlertsInPanel !== false}
                    onChange={(e) => store.updateSweepConfig({ showCriticalAlertsInPanel: e.target.checked })}
                  />
                  <span className="form-label" style={{margin: 0}}>Mostrar alertas críticas en Panel</span>
                </label>
                <div className="text-sm text-gray mb-4">
                  Muestra contador de alertas críticas/altas en la navegación
                </div>

                <label className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    checked={storeState.qaMode || false}
                    onChange={(e) => store.toggleQAMode()}
                  />
                  <span className="form-label" style={{margin: 0}}>Modo QA</span>
                </label>
                <div className="text-sm text-gray mb-4">
                  Activa herramientas de testing y validación para verificar H0-H7
                </div>
              </div>

              <div>
                <label className="form-label">Ventana de emparejamiento movimiento ↔ factura</label>
                <select 
                  className="form-control mb-2"
                  value={sweepConfig.movementMatchingDays || 3}
                  onChange={(e) => store.updateSweepConfig({ 
                    movementMatchingDays: parseInt(e.target.value) 
                  })}
                >
                  <option value={1}>±1 día</option>
                  <option value={3}>±3 días</option>
                  <option value={7}>±7 días</option>
                </select>
                <div className="text-sm text-gray mb-4">
                  Margen para vincular movimientos con facturas automáticamente
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (confirm('¿Restablecer reglas por defecto? Se perderán las reglas personalizadas.')) {
                      store.setState({ 
                        providerRules: [...mockData.providerRules]
                      });
                      
                      if (typeof window !== 'undefined' && window.showToast) {
                        window.showToast('Reglas restablecidas a valores por defecto', 'success');
                      }
                    }
                  }}
                >
                  Restablecer reglas por defecto
                </button>
                <div className="text-sm text-gray mt-1">
                  Carga 5 reglas base sensatas para clasificación automática
                </div>
              </div>
            </div>

            <div className="mt-6 p-4" style={{background: '#F9FAFB', borderRadius: '8px'}}>
              <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Estado del Motor de Reglas</h4>
              <div className="grid-3 gap-4">
                <div>
                  <div className="text-sm text-gray">Reglas activas</div>
                  <div className="font-semibold">
                    {storeState.providerRules ? storeState.providerRules.filter(r => r.active).length : 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray">Última ejecución</div>
                  <div className="font-semibold text-sm">
                    {storeState.lastRulesRun ? 
                      new Date(storeState.lastRulesRun).toLocaleString('es-ES') : 
                      'Nunca'
                    }
                  </div>
                </div>
                <div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const changes = store.runRulesEngine();
                      if (typeof window !== 'undefined' && window.showToast) {
                        window.showToast(`Motor ejecutado: ${changes.length} cambios aplicados`, 'success');
                      }
                    }}
                  >
                    Ejecutar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Preferencias Generales</h3>
            <div className="grid-2 gap-4">
              <div>
                <label className="text-sm font-medium">Switch Personal ON/OFF</label>
                <div className="flex items-center gap-2 mt-2">
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={personalToggle}
                      onChange={(e) => setPersonalToggle(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="text-sm text-gray">
                    {personalToggle ? 'Mostrar finanzas personales' : 'Solo mostrar inmuebles'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Idioma</label>
                <select className="form-control">
                  <option value="es">Español (ES)</option>
                  <option value="en">English (EN)</option>
                  <option value="fr">Français (FR)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Zona horaria</label>
                <select className="form-control">
                  <option value="Europe/Madrid">Europa/Madrid (CET)</option>
                  <option value="Europe/London">Europa/Londres (GMT)</option>
                  <option value="America/New_York">América/Nueva York (EST)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Formato de fecha</label>
                <select className="form-control">
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Importar / Exportar Datos</h3>
            <div className="grid-2 gap-4">
              <div>
                <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Importar</h4>
                <div className="space-y-3">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => alert('Disponible en Próximo Hito')}
                  >
                    📊 Importar CSV (inmuebles)
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => alert('Disponible en Próximo Hito')}
                  >
                    📄 Importar facturas (ZIP)
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => alert('Disponible en Próximo Hito')}
                  >
                    🏦 Importar movimientos bancarios
                  </button>
                </div>
              </div>
              <div>
                <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Exportar</h4>
                <div className="space-y-3">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => alert('Disponible en Próximo Hito')}
                  >
                    📊 Exportar todo (CSV)
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => alert('Disponible en Próximo Hito')}
                  >
                    📄 Backup completo (JSON)
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => alert('Disponible en Próximo Hito')}
                  >
                    🧾 Informe fiscal anual
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Notificaciones</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Alertas de saldo bajo</div>
                  <div className="text-sm text-gray">Notificar cuando una cuenta esté por debajo del objetivo</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Vencimiento de contratos</div>
                  <div className="text-sm text-gray">Recordatorios 30 días antes del vencimiento</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Documentos pendientes</div>
                  <div className="text-sm text-gray">Recordatorio semanal de facturas sin procesar</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>

    {/* New Account Modal */}
    {showNewAccountModal && (
      <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowNewAccountModal(false)}>
        <div className="modal" style={{maxWidth: '600px'}} onMouseDown={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0}}>Conectar nueva cuenta bancaria</h3>
            <button className="btn-close" onClick={() => setShowNewAccountModal(false)}>×</button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray mb-4">
              Conecta tu cuenta bancaria de forma segura para obtener saldos y movimientos en tiempo real.
            </p>
            
            <div className="grid-2 gap-4">
              <div className="card p-4 cursor-pointer hover:border-accent transition-colors" 
                   onClick={() => {
                     if (window.showToast) {
                       window.showToast('Conexión bancaria con Open Banking próximamente', 'info');
                     }
                     setShowNewAccountModal(false);
                   }}>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{fontSize: '24px'}}>🏦</span>
                  <div>
                    <div className="font-semibold">Open Banking</div>
                    <div className="text-sm text-gray">Conexión automática y segura</div>
                  </div>
                </div>
                <div className="text-xs text-gray">
                  Compatible con BBVA, Santander, CaixaBank, ING, y más
                </div>
              </div>
              
              <div className="card p-4 cursor-pointer hover:border-accent transition-colors"
                   onClick={() => {
                     if (window.showToast) {
                       window.showToast('Registro manual próximamente disponible', 'info');
                     }
                     setShowNewAccountModal(false);
                   }}>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{fontSize: '24px'}}>✏️</span>
                  <div>
                    <div className="font-semibold">Registro manual</div>
                    <div className="text-sm text-gray">Introduce los datos manualmente</div>
                  </div>
                </div>
                <div className="text-xs text-gray">
                  Para bancos no compatibles o cuentas offline
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowNewAccountModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
}
