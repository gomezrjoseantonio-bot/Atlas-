import { useState, useEffect } from 'react';
import store from '../store/index';
import { mockData } from '../data/mockData';
import Header from '../components/Header';
import { HomeIcon, BarChart3Icon, AlertTriangleIcon } from '../components/icons';

export default function Page() {
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [timeframe, setTimeframe] = useState('12');
  const [activeTab, setActiveTab] = useState('inmuebles');
  const [showDSCRModal, setShowDSCRModal] = useState(false);
  
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

  const { properties, predictedItems, loans } = storeState;
  const { projectionScenarios, personalFinances } = mockData;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
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
      
      // Add predicted items for this month
      const monthDate = new Date(2024, i - 1);
      const monthPredictedIncome = (predictedItems || [])
        .filter(item => {
          const itemDate = new Date(item.dueDate);
          return item.type === 'income' && 
                 itemDate.getFullYear() === monthDate.getFullYear() && 
                 itemDate.getMonth() === monthDate.getMonth();
        })
        .reduce((sum, item) => sum + item.amount, 0);
        
      const monthPredictedExpenses = (predictedItems || [])
        .filter(item => {
          const itemDate = new Date(item.dueDate);
          return item.type === 'charge' && 
                 itemDate.getFullYear() === monthDate.getFullYear() && 
                 itemDate.getMonth() === monthDate.getMonth();
        })
        .reduce((sum, item) => sum + item.amount, 0);
      
      const totalRent = projectedRent + monthPredictedIncome;
      const totalExpenses = projectedExpenses + monthPredictedExpenses;
      const netIncome = totalRent - totalExpenses;
      
      forecast.push({
        month: i,
        monthName: new Date(2024, i - 1).toLocaleDateString('es-ES', { month: 'short' }),
        rent: totalRent,
        expenses: totalExpenses,
        net: netIncome,
        predictedIncome: monthPredictedIncome,
        predictedExpenses: monthPredictedExpenses
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
    // Calculate debt payments from loans
    const monthlyDebtPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    return netIncome / monthlyDebtPayments;
  };

  const currentScenario = scenarios[selectedScenario];
  const propertyForecast = generatePropertyForecast(currentScenario, parseInt(timeframe));
  const personalForecast = generatePersonalForecast(parseInt(timeframe));
  const consolidatedForecast = generateConsolidatedForecast(currentScenario, parseInt(timeframe));

  const alertCount = storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  return (<>
    <Header 
      currentTab="proyeccion" 
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
    />

    <main className="container">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--accent)', margin:0}}>Proyección Financiera</h2>
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
          <HomeIcon size={16} style={{marginRight: '6px'}} />
          Inmuebles
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
          <BarChart3Icon size={16} style={{marginRight: '6px'}} />
          Consolidado
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
                <div className="font-semibold" style={{fontSize: '20px', color: 'var(--accent)'}}>
                  {formatCurrency(propertyForecast.reduce((sum, m) => sum + m.net, 0))}
                </div>
              </div>
            </div>
            
            {/* Predicted Items Note */}
            {predictedItems && predictedItems.length > 0 && (
              <div className="card mb-4" style={{background: '#F0F9FF', borderColor: 'var(--teal)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <span>🔮</span>
                  <span className="font-semibold">Incluye previstos</span>
                </div>
                <div className="text-sm text-gray">
                  La proyección incluye {predictedItems.filter(item => item.type === 'income').length} ingresos previstos 
                  y {predictedItems.filter(item => item.type === 'charge').length} cargos previstos 
                  de los próximos {timeframe} meses basados en contratos y préstamos.
                </div>
              </div>
            )}
            
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

            {/* Predicted Items Note for Consolidated */}
            {predictedItems && predictedItems.length > 0 && (
              <div className="card mb-4" style={{background: '#F0F9FF', borderColor: 'var(--teal)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <span>🔮</span>
                  <span className="font-semibold">Incluye previstos de cartera</span>
                </div>
                <div className="text-sm text-gray">
                  La proyección consolidada incluye {predictedItems.filter(item => item.type === 'income').length} ingresos 
                  y {predictedItems.filter(item => item.type === 'charge').length} cargos previstos, 
                  incluyendo cuotas de préstamos y revisiones de tipo automáticas.
                </div>
              </div>
            )}

            {/* DSCR and Investment Capacity */}
            <div className="grid-2 gap-4">
              <div className="card" style={{background: '#F9FAFB'}}>
                <div className="text-sm text-gray">DSCR (Debt Service Coverage)</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>
                  {calculateDSCR(consolidatedForecast[0]?.totalNet || 0).toFixed(2)}x
                </div>
                <div className={`chip ${calculateDSCR(consolidatedForecast[0]?.totalNet || 0) > 1.25 ? 'success' : 
                  calculateDSCR(consolidatedForecast[0]?.totalNet || 0) >= 1.0 ? 'warning' : 'attention'}`}>
                  {calculateDSCR(consolidatedForecast[0]?.totalNet || 0) > 1.25 ? 'Saludable' : 'Atención'}
                </div>
                
                {/* DSCR Legend */}
                <div className="text-xs text-gray mt-2" style={{fontStyle: 'italic'}}>
                  DSCR = Flujo neto / Cuotas
                </div>
                
                {/* Show improvement link if DSCR < 1.0 */}
                {calculateDSCR(consolidatedForecast[0]?.totalNet || 0) < 1.0 && (
                  <button
                    onClick={() => setShowDSCRModal(true)}
                    className="btn btn-outline btn-sm mt-2"
                    style={{width: '100%'}}
                  >
                    <AlertTriangleIcon size={16} style={{marginRight: '6px'}} />
                    Mejorar DSCR
                  </button>
                )}
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

    {/* DSCR Improvement Modal */}
    {showDSCRModal && (
      <div className="modal-overlay" onClick={() => setShowDSCRModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0, color: 'var(--navy)'}}>
              <AlertTriangleIcon size={20} style={{marginRight: '8px'}} />
              Sugerencias para mejorar DSCR
            </h3>
            <button
              onClick={() => setShowDSCRModal(false)}
              className="btn-close"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray mb-2">DSCR actual</div>
            <div className="font-semibold text-lg" style={{color: 'var(--error)'}}>
              {calculateDSCR(consolidatedForecast[0]?.totalNet || 0).toFixed(2)}x
              <span className="text-sm text-gray ml-2">(Objetivo: ≥ 1.25x)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="card" style={{background: '#F0FDF4', border: '1px solid var(--success)'}}>
              <h4 style={{margin: '0 0 8px 0', color: 'var(--success)'}}>
                📉 Reducir gastos 15%
              </h4>
              <div className="text-sm mb-2">
                Optimizar gastos operativos y mantenimiento
              </div>
              <div className="text-xs text-gray">
                Impacto estimado: +0.3 DSCR
              </div>
            </div>

            <div className="card" style={{background: '#FEF3C7', border: '1px solid var(--warning)'}}>
              <h4 style={{margin: '0 0 8px 0', color: 'var(--warning)'}}>
                📈 Subir rentas 8%
              </h4>
              <div className="text-sm mb-2">
                Actualizar precios al mercado actual
              </div>
              <div className="text-xs text-gray">
                Impacto estimado: +0.2 DSCR
              </div>
            </div>

            <div className="card" style={{background: '#EDE9FE', border: '1px solid var(--navy)'}}>
              <h4 style={{margin: '0 0 8px 0', color: 'var(--navy)'}}>
                💰 Amortizar 25.000€
              </h4>
              <div className="text-sm mb-2">
                Reducir carga financiera mensual
              </div>
              <div className="text-xs text-gray">
                Impacto estimado: +0.4 DSCR
              </div>
            </div>
          </div>

          <div className="mt-4 p-3" style={{background: 'var(--accent-subtle)', borderRadius: '8px'}}>
            <div className="text-sm font-medium" style={{color: 'var(--accent)', marginBottom: '4px'}}>
              <AlertTriangleIcon size={20} style={{marginRight: '8px'}} />
              Recomendación
            </div>
            <div className="text-sm" style={{color: 'var(--accent)'}}>
              Combinar amortización parcial con optimización de gastos para alcanzar el DSCR objetivo de 1.25x
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => setShowDSCRModal(false)}
              className="btn btn-secondary"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                if (window.showToast) {
                  window.showToast('Plan de mejora guardado en Proyección', 'info');
                }
                setShowDSCRModal(false);
              }}
              className="btn btn-primary"
            >
              📋 Guardar plan
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
}
