import { useState } from 'react';

export default function Page() {
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [timeframe, setTimeframe] = useState('12');

  const scenarios = {
    base: {
      name: 'Base',
      description: 'Escenario conservador basado en datos históricos',
      growth: 2.5,
      occupancy: 94,
      expenses: 0,
      color: 'var(--navy)'
    },
    optimista: {
      name: 'Optimista', 
      description: 'Crecimiento favorable del mercado',
      growth: 5.2,
      occupancy: 97,
      expenses: -5,
      color: 'var(--success)'
    },
    pesimista: {
      name: 'Pesimista',
      description: 'Condiciones adversas del mercado',
      growth: 0.8,
      occupancy: 88,
      expenses: 15,
      color: 'var(--error)'
    }
  };

  const generateForecast = (scenario, months) => {
    const currentRent = 4100; // Base monthly rent
    const currentExpenses = 625; // Base monthly expenses
    const forecast = [];
    
    for (let i = 1; i <= months; i++) {
      const monthlyGrowth = scenario.growth / 100 / 12;
      const projectedRent = currentRent * (1 + monthlyGrowth * i) * (scenario.occupancy / 100);
      const projectedExpenses = currentExpenses * (1 + (scenario.expenses / 100) / 12 * i);
      const netIncome = projectedRent - projectedExpenses;
      
      forecast.push({
        month: i,
        monthName: new Date(2024, i - 1).toLocaleDateString('es-ES', { month: 'short' }),
        rent: projectedRent,
        expenses: projectedExpenses,
        net: netIncome
      });
    }
    
    return forecast;
  };

  const currentScenario = scenarios[selectedScenario];
  const forecast = generateForecast(currentScenario, parseInt(timeframe));
  const totalNet = forecast.reduce((sum, month) => sum + month.net, 0);
  const avgMonthly = totalNet / forecast.length;

  return (<>
    <header className="header">
      <div className="container nav">
        <div className="logo">
          <div className="logo-mark">
            <div className="bar short"></div>
            <div class="bar mid"></div>
            <div className="bar tall"></div>
          </div>
          <div>ATLAS</div>
        </div>
        <nav className="tabs">
          <a className="tab" href="/panel">Panel</a>
          <a className="tab" href="/tesoreria">Tesorería</a>
          <a className="tab" href="/inmuebles">Inmuebles</a>
          <a className="tab" href="/documentos">Documentos</a>
          <a className="tab active" href="/proyeccion">Proyección</a>
          <a className="tab" href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <span>🔍</span><span>🔔</span><span>⚙️</span>
        </div>
      </div>
    </header>

    <main className="container">
      <h2 style={{color:'var(--navy)', margin:'0 0 24px 0'}}>Proyección Financiera</h2>

      {/* Scenario Selection */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Escenarios</h3>
        <div className="grid gap-4 mb-4">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`card ${selectedScenario === key ? 'selected' : ''}`}
              style={{
                cursor: 'pointer',
                border: selectedScenario === key ? `2px solid ${scenario.color}` : '1px solid var(--border)',
                background: selectedScenario === key ? `${scenario.color}15` : '#fff'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold" style={{color: scenario.color}}>
                  {scenario.name}
                </div>
                <div className="flex gap-2">
                  <span className="chip success">+{scenario.growth}%</span>
                  <span className="chip gray">{scenario.occupancy}% ocupación</span>
                </div>
              </div>
              <div className="text-sm text-gray">{scenario.description}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium mr-2">Período de proyección:</label>
            <select 
              className="select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projection Summary */}
      <div className="grid mb-4">
        <div className="card">
          <h3 style={{margin: '0 0 16px 0', color: currentScenario.color}}>
            Resumen - Escenario {currentScenario.name}
          </h3>
          <div className="grid-3 gap-4">
            <div>
              <div className="text-sm text-gray">Ingreso neto total</div>
              <div className="font-semibold" style={{fontSize: '20px', color: currentScenario.color}}>
                €{totalNet.toLocaleString('es-ES', {minimumFractionDigits: 0})}
              </div>
              <div className="text-sm text-gray">{timeframe} meses</div>
            </div>
            <div>
              <div className="text-sm text-gray">Promedio mensual</div>
              <div className="font-semibold" style={{fontSize: '20px'}}>
                €{avgMonthly.toLocaleString('es-ES', {minimumFractionDigits: 0})}
              </div>
              <div className="text-sm text-gray">por mes</div>
            </div>
            <div>
              <div className="text-sm text-gray">Crecimiento anual</div>
              <div className="font-semibold" style={{fontSize: '20px', color: currentScenario.color}}>
                +{currentScenario.growth}%
              </div>
              <div className="text-sm text-gray">proyectado</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Hipótesis del Escenario</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Crecimiento de alquileres</span>
              <span className="font-medium" style={{color: currentScenario.color}}>
                {currentScenario.growth > 0 ? '+' : ''}{currentScenario.growth}% anual
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasa de ocupación</span>
              <span className="font-medium">{currentScenario.occupancy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Variación de gastos</span>
              <span className="font-medium">
                {currentScenario.expenses > 0 ? '+' : ''}{currentScenario.expenses}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Forecast Chart */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Proyección Mensual</h3>
        <div className="forecast-chart" style={{height: '200px', position: 'relative', background: '#F9FAFB', borderRadius: '8px', padding: '16px'}}>
          <div className="text-sm text-gray mb-4">Ingresos netos mensuales proyectados</div>
          <div className="flex items-end justify-between h-full">
            {forecast.slice(0, Math.min(12, forecast.length)).map((month, index) => {
              const height = (month.net / Math.max(...forecast.map(m => m.net))) * 120;
              return (
                <div key={month.month} className="flex flex-col items-center">
                  <div 
                    style={{
                      width: '20px',
                      height: `${height}px`,
                      background: currentScenario.color,
                      borderRadius: '2px 2px 0 0',
                      marginBottom: '8px'
                    }}
                  ></div>
                  <div className="text-xs">{month.monthName}</div>
                  <div className="text-xs font-medium">€{month.net.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Forecast Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0}}>Detalle de Proyección</h3>
          <button className="btn btn-secondary btn-sm">📊 Exportar</button>
        </div>
        
        <div style={{maxHeight: '400px', overflow: 'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="text-right">Ingresos</th>
                <th className="text-right">Gastos</th>
                <th className="text-right">Neto</th>
                <th className="text-right">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((month, index) => {
                const accumulated = forecast.slice(0, index + 1).reduce((sum, m) => sum + m.net, 0);
                return (
                  <tr key={month.month}>
                    <td>{month.monthName} 2024</td>
                    <td className="text-right font-medium" style={{color: 'var(--success)'}}>
                      €{month.rent.toLocaleString('es-ES', {minimumFractionDigits: 0})}
                    </td>
                    <td className="text-right" style={{color: 'var(--error)'}}>
                      €{month.expenses.toLocaleString('es-ES', {minimumFractionDigits: 0})}
                    </td>
                    <td className="text-right font-medium">
                      €{month.net.toLocaleString('es-ES', {minimumFractionDigits: 0})}
                    </td>
                    <td className="text-right font-semibold" style={{color: currentScenario.color}}>
                      €{accumulated.toLocaleString('es-ES', {minimumFractionDigits: 0})}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="mt-4">
        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Análisis de Riesgos</h3>
          <div className="grid gap-4">
            <div className="p-3" style={{background: '#FEF3C7', borderRadius: '6px', border: '1px solid var(--warning)'}}>
              <div className="font-medium mb-1">⚠️ Riesgo de Vacancia</div>
              <div className="text-sm">
                Con ocupación del {currentScenario.occupancy}%, una vacancia adicional 
                reduciría ingresos en ~€850/mes.
              </div>
            </div>
            <div className="p-3" style={{background: '#EFF6FF', borderRadius: '6px', border: '1px solid var(--navy)'}}>
              <div className="font-medium mb-1">💡 Oportunidad</div>
              <div className="text-sm">
                Incremento del {currentScenario.growth}% anual generará 
                €{((totalNet * currentScenario.growth / 100)).toFixed(0)} adicionales.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </>);
}
