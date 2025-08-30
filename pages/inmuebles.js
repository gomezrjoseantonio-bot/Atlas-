export default function Page() {
  const properties = [
    {
      id: 1,
      address: 'C/ Mayor 12, 3º A',
      type: 'Piso',
      area: 75,
      rent: 850,
      tenant: 'María García',
      occupancy: 'occupied',
      nextPayment: '2024-02-01',
      profitability: 6.8,
      expenses: 145.67
    },
    {
      id: 2,
      address: 'Avda. Constitución 45, 1º B', 
      type: 'Piso',
      area: 85,
      rent: 950,
      tenant: 'Juan Pérez',
      occupancy: 'occupied',
      nextPayment: '2024-02-05',
      profitability: 7.2,
      expenses: 89.50
    },
    {
      id: 3,
      address: 'C/ Libertad 8, Bajo',
      type: 'Local',
      area: 120,
      rent: 1200,
      tenant: '',
      occupancy: 'vacant',
      nextPayment: '',
      profitability: 0,
      expenses: 156.00
    },
    {
      id: 4,
      address: 'Plaza Mayor 15, 2º C',
      type: 'Piso',
      area: 90,
      rent: 1100,
      tenant: 'Ana Martín',
      occupancy: 'occupied',
      nextPayment: '2024-02-10',
      profitability: 8.1,
      expenses: 234.50
    }
  ];

  const getOccupancyChip = (occupancy) => {
    const occupancyMap = {
      'occupied': { chip: 'success', text: 'Ocupado', icon: '🏠' },
      'vacant': { chip: 'warning', text: 'Vacante', icon: '🏚️' },
      'maintenance': { chip: 'error', text: 'Obras', icon: '🔧' }
    };
    return occupancyMap[occupancy] || occupancyMap.vacant;
  };

  const totalRent = properties.reduce((sum, prop) => prop.occupancy === 'occupied' ? sum + prop.rent : sum, 0);
  const totalExpenses = properties.reduce((sum, prop) => sum + prop.expenses, 0);
  const occupancyRate = (properties.filter(p => p.occupancy === 'occupied').length / properties.length) * 100;
  const avgProfitability = properties.filter(p => p.profitability > 0).reduce((sum, p) => sum + p.profitability, 0) / properties.filter(p => p.profitability > 0).length;

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
          <a className="tab active" href="/inmuebles">Inmuebles</a>
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
        <h2 style={{color:'var(--navy)', margin:0}}>Inmuebles</h2>
        <button className="btn btn-primary">+ Nuevo inmueble</button>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid-3 gap-4 mb-4">
        <div className="card">
          <div className="text-sm text-gray mb-1">Inmuebles en cartera</div>
          <div className="font-semibold" style={{fontSize: '24px', color: 'var(--navy)'}}>
            {properties.length}
          </div>
          <div className="text-sm text-gray">propiedades</div>
        </div>

        <div className="card">
          <div className="text-sm text-gray mb-1">Ocupación</div>
          <div className="font-semibold" style={{fontSize: '24px', color: 'var(--success)'}}>
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray">
            {properties.filter(p => p.occupancy === 'occupied').length} de {properties.length} ocupados
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray mb-1">Rentabilidad bruta</div>
          <div className="font-semibold" style={{fontSize: '24px', color: 'var(--teal)'}}>
            {avgProfitability.toFixed(1)}%
          </div>
          <div className="text-sm text-gray">media anual</div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid mb-4">
        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Resumen Mensual</h3>
          <div className="grid-3 gap-4">
            <div>
              <div className="text-sm text-gray">Ingresos por alquiler</div>
              <div className="font-semibold" style={{fontSize: '18px', color: 'var(--success)'}}>
                €{totalRent.toLocaleString('es-ES')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Gastos del mes</div>
              <div className="font-semibold" style={{fontSize: '18px', color: 'var(--error)'}}>
                €{totalExpenses.toLocaleString('es-ES', {minimumFractionDigits: 2})}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Beneficio neto</div>
              <div className="font-semibold" style={{fontSize: '18px', color: 'var(--navy)'}}>
                €{(totalRent - totalExpenses).toLocaleString('es-ES', {minimumFractionDigits: 2})}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Alertas</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2" style={{background: '#FEF3C7', borderRadius: '6px'}}>
              <span>🏚️</span>
              <span className="text-sm">C/ Libertad 8 lleva 45 días vacante</span>
            </div>
            <div className="flex items-center gap-2 p-2" style={{background: '#EFF6FF', borderRadius: '6px'}}>
              <span>💰</span>
              <span className="text-sm">2 pagos de alquiler próximos esta semana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0}}>Portfolio de Inmuebles</h3>
          <div className="flex gap-2">
            <select className="select">
              <option>Todos los tipos</option>
              <option>Piso</option>
              <option>Local</option>
            </select>
            <select className="select">
              <option>Todos los estados</option>
              <option>Ocupado</option>
              <option>Vacante</option>
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Tipo</th>
              <th>m²</th>
              <th className="text-right">Alquiler</th>
              <th>Inquilino</th>
              <th>Estado</th>
              <th>Próximo pago</th>
              <th className="text-right">Rentabilidad</th>
              <th className="text-right">Gastos mes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(property => {
              const status = getOccupancyChip(property.occupancy);
              return (
                <tr key={property.id}>
                  <td>
                    <div className="font-medium">{property.address}</div>
                  </td>
                  <td>{property.type}</td>
                  <td>{property.area} m²</td>
                  <td className="text-right font-medium">
                    {property.rent > 0 ? `€${property.rent}` : '-'}
                  </td>
                  <td>{property.tenant || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span>{status.icon}</span>
                      <span className={`chip ${status.chip}`}>{status.text}</span>
                    </div>
                  </td>
                  <td>{property.nextPayment || '-'}</td>
                  <td className="text-right font-medium">
                    {property.profitability > 0 ? `${property.profitability}%` : '-'}
                  </td>
                  <td className="text-right">€{property.expenses.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-secondary btn-sm">Ver</button>
                      <button className="btn btn-secondary btn-sm">Editar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="mt-4">
        <h3 style={{color: 'var(--navy)', fontSize: '16px', marginBottom: '16px'}}>Acciones rápidas</h3>
        <div className="flex gap-2">
          <button className="btn btn-secondary">🏠 Nuevo inmueble</button>
          <button className="btn btn-secondary">👥 Gestionar inquilinos</button>
          <button className="btn btn-secondary">💰 Registrar pago</button>
          <button className="btn btn-secondary">📊 Generar informe</button>
        </div>
      </div>
    </main>
  </>);
}
