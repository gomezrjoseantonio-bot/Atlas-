import { useState } from 'react';
import { mockData } from '../data/mockData';

export default function Page() {
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [timeframe, setTimeframe] = useState('12');
  const [activeTab, setActiveTab] = useState('inmuebles');

  const { projectionScenarios, personalFinances, properties } = mockData;

  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 0})}`;
  };

  const scenarios = {
    base: {
      name: 'Base',
      description: 'Escenario conservador basado en datos históricos',
      ...projectionScenarios.base,
      color: 'var(--navy)'
    },
    optimista: {
      name: 'Optimista', 
      description: 'Crecimiento favorable del mercado',
      ...projectionScenarios.optimista,
      color: 'var(--success)'
    },
    pesimista: {
      name: 'Pesimista',
      description: 'Condiciones adversas del mercado',
      ...projectionScenarios.pesimista,
      color: 'var(--error)'
    }
  };

  const generatePropertyForecast = (scenario, months) => {
    const currentMonthlyRent = properties.reduce((sum, p) => sum + (p.status === 'Ocupado' ? p.monthlyRent : 0), 0);
    const currentMonthlyExpenses = properties.reduce((sum, p) => sum + p.monthlyExpenses, 0);
    const forecast = [];
    
    for (let i = 1; i <= months; i++) {
      const monthlyRentGrowth = scenario.rentIncrease / 100 / 12;
      const monthlyExpenseGrowth = scenario.expenseIncrease / 100 / 12;
      
      const projectedRent = currentMonthlyRent * (1 + monthlyRentGrowth * i) * (scenario.occupancyRate / 100);
      const projectedExpenses = currentMonthlyExpenses * (1 + monthlyExpenseGrowth * i);
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

  const generatePersonalForecast = (months) => {
    const forecast = [];
    
    for (let i = 1; i <= months; i++) {
      const netSalary = personalFinances.monthlyNetSalary;
      const expenses = personalFinances.monthlyExpenses;
      const netIncome = netSalary - expenses;
      
      forecast.push({
        month: i,
        monthName: new Date(2024, i - 1).toLocaleDateString('es-ES', { month: 'short' }),
        income: netSalary,
        expenses: expenses,
        net: netIncome
      });
    }
    
    return forecast;
  };

  const generateConsolidatedForecast = (scenario, months) => {
    const propertyForecast = generatePropertyForecast(scenario, months);
    const personalForecast = generatePersonalForecast(months);
    
    return propertyForecast.map((prop, index) => ({
      month: prop.month,
      monthName: prop.monthName,
      propertyNet: prop.net,
      personalNet: personalForecast[index].net,
      totalNet: prop.net + personalForecast[index].net
    }));
  };

  const calculateDSCR = (netIncome, debtPayments) => {
    // Mock debt payments calculation
    const monthlyDebtPayments = 1103; // Sum of mortgage payments from mockData
    return netIncome / monthlyDebtPayments;
  };

  const currentScenario = scenarios[selectedScenario];
  const propertyForecast = generatePropertyForecast(currentScenario, parseInt(timeframe));
  const personalForecast = generatePersonalForecast(parseInt(timeframe));
  const consolidatedForecast = generateConsolidatedForecast(currentScenario, parseInt(timeframe));

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
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--navy)', margin:0}}>Proyección Financiera</h2>
        <div className="flex gap-2">
          <select 
            className="form-control"
            style={{width: 'auto', marginBottom: 0}}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
            <option value="36">36 meses</option>
          </select>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-1 mb-4">
        <button 
          onClick={() => setActiveTab('inmuebles')}
          className={`btn ${activeTab === 'inmuebles' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          🏠 Inmuebles
        </button>
        <button 
          onClick={() => setActiveTab('personal')}
          className={`btn ${activeTab === 'personal' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          👤 Personal
        </button>
        <button 
          onClick={() => setActiveTab('consolidado')}
          className={`btn ${activeTab === 'consolidado' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          📊 Consolidado
        </button>
      </div>

      {/* Inmuebles Tab */}
      {activeTab === 'inmuebles' && (
        <div className="space-y-4">
          {/* Scenario Selection */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Forecast Cartera - 3 Escenarios</h3>
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
                      <span className="chip success">+{scenario.rentIncrease}% renta</span>
                      <span className="chip gray">{scenario.occupancyRate}% ocupación</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray">{scenario.description}</div>
                </button>
              ))}
            </div>

            {/* Interactive Sliders */}
            <div className="grid-3 gap-4">
              <div>
                <label className="text-sm font-medium">Ocupación</label>
                <input 
                  type="range" 
                  min="70" 
                  max="100" 
                  value={currentScenario.occupancyRate}
                  className="form-control"
                  onChange={() => alert('Slider interactivo (simulado)')}
                />
                <div className="text-sm text-gray text-center">{currentScenario.occupancyRate}%</div>
              </div>
              <div>
                <label className="text-sm font-medium">Incremento Renta</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={currentScenario.rentIncrease}
                  className="form-control"
                  onChange={() => alert('Slider interactivo (simulado)')}
                />
                <div className="text-sm text-gray text-center">+{currentScenario.rentIncrease}%</div>
              </div>
              <div>
                <label className="text-sm font-medium">Incremento Gastos</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={currentScenario.expenseIncrease}
                  className="form-control"
                  onChange={() => alert('Slider interactivo (simulado)')}
                />
                <div className="text-sm text-gray text-center">+{currentScenario.expenseIncrease}%</div>
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Proyección {timeframe} meses</h3>
            <div className="grid-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray">Ingresos Totales</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                  {formatCurrency(propertyForecast.reduce((sum, m) => sum + m.rent, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">Gastos Totales</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--error)'}}>
                  {formatCurrency(propertyForecast.reduce((sum, m) => sum + m.expenses, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">Beneficio Neto</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--navy)'}}>
                  {formatCurrency(propertyForecast.reduce((sum, m) => sum + m.net, 0))}
                </div>
              </div>
            </div>
            
            {/* Mini Chart Placeholder */}
            <div style={{
              height: '200px', 
              background: '#F9FAFB', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--gray)'
            }}>
              📈 Gráfico interactivo (próximo hito)
            </div>
          </div>
        </div>
      )}

      {/* Personal Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Finanzas Personales</h3>
            
            <div className="grid-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Nómina neta mensual</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={personalFinances.monthlyNetSalary}
                  onChange={() => alert('Input simulado')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Gastos macro mensuales</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={personalFinances.monthlyExpenses}
                  onChange={() => alert('Input simulado')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Provisión IRPF</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={personalFinances.irpfProvision}
                  onChange={() => alert('Input simulado')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Provisión IVA</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={personalFinances.ivaProvision}
                  onChange={() => alert('Input simulado')}
                />
              </div>
            </div>

            <div className="grid-2 gap-4">
              <div>
                <div className="text-sm text-gray">Resultado mensual</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                  {formatCurrency(personalFinances.monthlyNetSalary - personalFinances.monthlyExpenses)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">Resultado anual estimado</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--navy)'}}>
                  {formatCurrency(personalFinances.estimatedAnnualNet - personalFinances.estimatedAnnualExpenses)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consolidado Tab */}
      {activeTab === 'consolidado' && (
        <div className="space-y-4">
          <div className="card">
            <h3 style={{margin: '0 0 16px 0'}}>Vista Consolidada - Cartera + Personal</h3>
            
            <div className="grid-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray">Total Cartera ({timeframe}m)</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--teal)'}}>
                  {formatCurrency(consolidatedForecast.reduce((sum, m) => sum + m.propertyNet, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">Total Personal ({timeframe}m)</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--navy)'}}>
                  {formatCurrency(consolidatedForecast.reduce((sum, m) => sum + m.personalNet, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray">Total Consolidado</div>
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                  {formatCurrency(consolidatedForecast.reduce((sum, m) => sum + m.totalNet, 0))}
                </div>
              </div>
            </div>

            {/* DSCR and Investment Capacity */}
            <div className="grid-2 gap-4">
              <div className="card" style={{background: '#F9FAFB'}}>
                <div className="text-sm text-gray">DSCR (Debt Service Coverage)</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>
                  {calculateDSCR(consolidatedForecast[0]?.totalNet || 0, 1103).toFixed(2)}x
                </div>
                <div className={`chip ${calculateDSCR(consolidatedForecast[0]?.totalNet || 0, 1103) > 1.25 ? 'success' : 'warning'}`}>
                  {calculateDSCR(consolidatedForecast[0]?.totalNet || 0, 1103) > 1.25 ? 'Saludable' : 'Atención'}
                </div>
              </div>
              <div className="card" style={{background: '#F9FAFB'}}>
                <div className="text-sm text-gray">Capacidad de compra</div>
                <div className="font-semibold" style={{fontSize: '18px', color: 'var(--success)'}}>
                  €185.000
                </div>
                <div className="chip success">Disponible</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  </>);
}
