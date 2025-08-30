import { useState, useEffect } from 'react';
import store from '../store/index';
import { mockData } from '../data/mockData';

export default function Page() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [storeState, setStoreState] = useState(store.getState());
  const [mounted, setMounted] = useState(false);

  // Subscribe to store changes and handle hydration
  useEffect(() => {
    setMounted(true);
    // Force a refresh of store state after mounting
    setStoreState(store.getState());
    const unsubscribe = store.subscribe(setStoreState);
    return unsubscribe;
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
              <a className="tab active" href="/tesoreria">Tesorería</a>
              <a className="tab" href="/inmuebles">Inmuebles</a>
              <a className="tab" href="/documentos">Documentos</a>
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
          <h2 style={{color:'var(--navy)', margin:'0 0 24px 0'}}>Tesorería</h2>
          <div>Cargando...</div>
        </main>
      </div>
    );
  }

  const { accounts, movements, alerts, treasuryRules, scheduledPayments } = storeState;

  const getHealthStatus = (health) => {
    const healthMap = {
      'excellent': { chip: 'success', text: 'Excelente', icon: '💚' },
      'good': { chip: 'success', text: 'Bueno', icon: '✅' },
      'warning': { chip: 'warning', text: 'Atención', icon: '⚠️' },
      'error': { chip: 'error', text: 'Problema', icon: '🚨' }
    };
    return healthMap[health] || healthMap.good;
  };

  const getBalanceVariation = (today, previous) => {
    const variation = ((today - previous) / previous) * 100;
    return {
      percentage: Math.abs(variation).toFixed(1),
      isPositive: variation >= 0
    };
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Regla aplicada': return 'success';
      case 'Pendiente': return 'warning';
      case 'Excepción': return 'error';
      default: return 'warning';
    }
  };

  const getDaysLeftBadge = (daysLeft) => {
    if (daysLeft <= 1) return { class: 'error', text: 'Hoy' };
    if (daysLeft <= 7) return { class: 'warning', text: '7 días' };
    if (daysLeft <= 30) return { class: 'success', text: '30 días' };
    return { class: 'success', text: '30+ días' };
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
          <a className="tab active" href="/tesoreria">Tesorería</a>
          <a className="tab" href="/inmuebles">Inmuebles</a>
          <a className="tab" href="/documentos">Documentos</a>
          <a className="tab" href="/proyeccion">Proyección</a>
          <a className="tab" href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <button 
            className="btn btn-secondary btn-sm"
            data-action="demo:load"
            style={{marginRight: '12px'}}
          >
            🔄 Demo
          </button>
          <span>🔍</span><span>🔔</span><span>⚙️</span>
        </div>
      </div>
    </header>

    <main className="container">
      <h2 style={{color:'var(--navy)', margin:'0 0 24px 0'}}>Tesorería</h2>

      {/* Account Health Radar */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Radar de Cuentas</h3>
        <div className="grid gap-4">
          {accounts.map(account => {
            const status = getHealthStatus(account.health);
            const variationT7 = getBalanceVariation(account.balanceToday, account.balanceT7);
            const variationT30 = getBalanceVariation(account.balanceToday, account.balanceT30);
            const progressPercentage = getProgressPercentage(account.balanceToday, account.targetBalance);
            
            return (
              <div key={account.id} className="card" style={{background: '#F9FAFB'}}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{account.name}</div>
                    <div className="text-sm text-gray">{account.bank} · {account.iban}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{fontSize: '18px'}}>{status.icon}</span>
                    <span className={`chip ${status.chip}`}>{status.text}</span>
                  </div>
                </div>
                
                <div className="grid-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray">Saldo Hoy</div>
                    <div className="font-semibold" style={{fontSize: '18px'}}>
                      €{account.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray">T-7</div>
                    <div className="font-semibold" style={{fontSize: '16px', color: variationT7.isPositive ? 'var(--success)' : 'var(--error)'}}>
                      {variationT7.isPositive ? '+' : '-'}{variationT7.percentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray">T-30</div>
                    <div className="font-semibold" style={{fontSize: '16px', color: variationT30.isPositive ? 'var(--success)' : 'var(--error)'}}>
                      {variationT30.isPositive ? '+' : '-'}{variationT30.percentage}%
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray">Objetivo: €{account.targetBalance.toLocaleString('es-ES')}</span>
                    <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${progressPercentage}%`}}
                    ></div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-sm"
                  data-action="treasury:transfer"
                  data-extra={JSON.stringify({accountId: account.id})}
                >
                  Mover dinero
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movements Inbox */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Movimientos (Inbox)</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th style={{textAlign: 'right'}}>Importe</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 10).map(movement => (
                <tr key={movement.id}>
                  <td>{movement.date}</td>
                  <td>
                    <div>{movement.description}</div>
                    {movement.propertyId && (
                      <div className="text-sm text-gray">
                        {mockData.properties.find(p => p.id === movement.propertyId)?.address}
                      </div>
                    )}
                  </td>
                  <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                    <span style={{color: movement.amount > 0 ? 'var(--success)' : 'var(--error)'}}>
                      €{Math.abs(movement.amount).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </span>
                  </td>
                  <td>
                    <span className="chip">{movement.category}</span>
                  </td>
                  <td>
                    <button 
                      className={`chip ${getStatusChipClass(movement.status)}`}
                      data-action="movement:toggle-status"
                      data-id={movement.id}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px'
                      }}
                    >
                      {movement.status}
                    </button>
                  </td>
                  <td>
                    {!movement.hasDocument && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        data-action="movement:assign-document"
                        data-id={movement.id}
                      >
                        Asignar documento
                      </button>
                    )}
                    {movement.hasDocument && (
                      <span className="text-sm text-gray">✓ Documentado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules & Sweeps */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Reglas & Sweeps</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Condición</th>
                <th>Acción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {treasuryRules.map(rule => (
                <tr key={rule.id}>
                  <td className="font-semibold">{rule.name}</td>
                  <td>{rule.condition}</td>
                  <td>
                    <div>{rule.action}</div>
                    <div className="text-sm text-gray">
                      {rule.targetAccount} · €{rule.amount.toLocaleString('es-ES')}
                    </div>
                  </td>
                  <td>
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={rule.active}
                        data-action="treasury:toggle-rule"
                        data-id={rule.id}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      data-action="treasury:edit-rule"
                      data-id={rule.id}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Calendar */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Alertas · Cargos Previstos</h3>
        <div className="grid gap-3">
          {scheduledPayments.map(payment => {
            const badge = getDaysLeftBadge(payment.daysLeft);
            const property = mockData.properties.find(p => p.id === payment.propertyId);
            
            return (
              <div key={payment.id} className="card" style={{background: '#F9FAFB'}}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{payment.description}</div>
                    {property && (
                      <div className="text-sm text-gray">{property.address}</div>
                    )}
                    <div className="text-sm text-gray">Vencimiento: {payment.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{fontSize: '16px'}}>
                      €{payment.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </div>
                    <span className={`chip ${badge.class}`}>{badge.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid mb-4">
        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Resumen de Saldos</h3>
          <div className="grid-3 gap-4">
            <div>
              <div className="text-sm text-gray">Saldo Total</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--navy)'}}>
                €{accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('es-ES', {minimumFractionDigits: 2})}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Ingresos del Mes</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                €8.450,00
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Gastos del Mes</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--error)'}}>
                €3.240,50
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Flujo de Caja</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Enero 2024</span>
              <span className="font-semibold text-success">+€5.209,50</span>
            </div>
            <div className="bg-gray-200" style={{height: '8px', borderRadius: '4px', background: '#E5E7EB'}}>
              <div 
                style={{
                  width: '72%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--teal), var(--success))', 
                  borderRadius: '4px'
                }}
              ></div>
            </div>
          </div>
          <div className="text-sm text-gray">
            Flujo positivo respecto al mes anterior (+15.2%)
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0}}>Movimientos Recientes</h3>
          <button 
            className="btn btn-secondary btn-sm"
            data-action="movements:view-all"
          >
            Ver todos
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Cuenta</th>
              <th className="text-right">Importe</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>15/01/2024</td>
              <td>Transferencia alquiler C/ Mayor 12</td>
              <td>BBVA Principal</td>
              <td className="text-right font-medium" style={{color: 'var(--success)'}}>+€850,00</td>
              <td><span className="chip success">Procesado</span></td>
            </tr>
            <tr>
              <td>14/01/2024</td>
              <td>Pago Iberdrola</td>
              <td>ING Gastos</td>
              <td className="text-right font-medium" style={{color: 'var(--error)'}}>-€145,67</td>
              <td><span className="chip success">Procesado</span></td>
            </tr>
            <tr>
              <td>12/01/2024</td>
              <td>Reparación fontanería</td>
              <td>ING Gastos</td>
              <td className="text-right font-medium" style={{color: 'var(--error)'}}>-€89,50</td>
              <td><span className="chip warning">Pendiente doc.</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4">
        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Acciones Rápidas</h3>
          <div className="grid gap-2">
            <button 
              className="btn btn-primary"
              data-action="treasury:register-income"
            >
              💰 Registrar ingreso
            </button>
            <button 
              className="btn btn-secondary"
              data-action="treasury:connect-account"
            >
              🏦 Conectar nueva cuenta
            </button>
            <button 
              className="btn btn-secondary"
              data-action="treasury:generate-report"
            >
              📊 Generar informe
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Alertas</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2" style={{background: '#FEF3C7', borderRadius: '6px'}}>
              <span>⚠️</span>
              <span className="text-sm">Cuenta ING con saldo bajo (€3.240)</span>
            </div>
            <div className="flex items-center gap-2 p-2" style={{background: '#EFF6FF', borderRadius: '6px'}}>
              <span>ℹ️</span>
              <span className="text-sm">Próximo pago comunidad: 25/01/2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Money Modal */}
      {showTransferModal && selectedAccount && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Mover dinero</h3>
              <button 
                className="btn-close"
                onClick={() => setShowTransferModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray mb-2">Desde</div>
              <div className="font-semibold">{selectedAccount.name}</div>
              <div className="text-sm text-gray">
                Saldo: €{selectedAccount.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Hacia</label>
              <select className="form-control">
                {accounts.filter(a => a.id !== selectedAccount.id).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.bank}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Importe</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowTransferModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // Mock transfer functionality
                  alert('Transferencia simulada realizada');
                  setShowTransferModal(false);
                }}
              >
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Assignment Modal */}
      {showDocumentModal && selectedMovement && (
        <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Asignar documento</h3>
              <button 
                className="btn-close"
                onClick={() => setShowDocumentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray mb-2">Movimiento</div>
              <div className="font-semibold">{selectedMovement.description}</div>
              <div className="text-sm text-gray">
                €{Math.abs(selectedMovement.amount).toLocaleString('es-ES', {minimumFractionDigits: 2})} · {selectedMovement.date}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Documento disponible</label>
              <select className="form-control">
                <option value="">Seleccionar documento...</option>
                {mockData.documents.filter(d => d.status === 'Listo para asignar' || d.status === 'Pendiente').map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.provider} - {doc.concept} - €{doc.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowDocumentModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // Mock document assignment
                  alert('Documento asignado al movimiento');
                  setShowDocumentModal(false);
                }}
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  </>);
}
