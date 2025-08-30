export default function Page() {
  const accounts = [
    {
      id: 1,
      name: 'Cuenta Corriente Principal',
      bank: 'BBVA',
      balance: 12450.67,
      health: 'good',
      lastUpdate: '2024-01-15'
    },
    {
      id: 2, 
      name: 'Cuenta Ahorro Inmuebles',
      bank: 'Santander',
      balance: 25800.45,
      health: 'excellent',
      lastUpdate: '2024-01-14'
    },
    {
      id: 3,
      name: 'Cuenta Gastos Inmuebles',
      bank: 'ING',
      balance: 3240.12,
      health: 'warning',
      lastUpdate: '2024-01-12'
    }
  ];

  const getHealthStatus = (health) => {
    const healthMap = {
      'excellent': { chip: 'success', text: 'Excelente', icon: '💚' },
      'good': { chip: 'success', text: 'Bueno', icon: '✅' },
      'warning': { chip: 'warning', text: 'Atención', icon: '⚠️' },
      'error': { chip: 'error', text: 'Problema', icon: '🚨' }
    };
    return healthMap[health] || healthMap.good;
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
            return (
              <div key={account.id} className="card" style={{background: '#F9FAFB'}}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{account.name}</div>
                    <div className="text-sm text-gray">{account.bank}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{fontSize: '18px'}}>{status.icon}</span>
                    <span className={`chip ${status.chip}`}>{status.text}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray">Saldo actual</div>
                    <div className="font-semibold" style={{fontSize: '18px'}}>
                      €{account.balance.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray">Última actualización</div>
                    <div className="text-sm">{account.lastUpdate}</div>
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
          <button className="btn btn-secondary btn-sm">Ver todos</button>
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
            <button className="btn btn-primary">💰 Registrar ingreso</button>
            <button className="btn btn-secondary">🏦 Conectar nueva cuenta</button>
            <button className="btn btn-secondary">📊 Generar informe</button>
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
    </main>
  </>);
}
