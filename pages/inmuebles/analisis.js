import { useState, useEffect } from 'react';
import store from '../../store/index';
import { mockData } from '../../data/mockData';

export default function AnalisisPage() {
  const [storeState, setStoreState] = useState(() => {
    // More defensive initialization for deployment environments
    try {
      console.log('Analisis: Starting initialization');
    return store.getState();
    } catch (error) {
      console.error('Analisis: Error during initialization, using fallback data', error);
      return {
        accounts: mockData.accounts || [],
        properties: mockData.properties || [],
        contracts: mockData.contracts || [],
        loans: mockData.loans || [],
        movements: mockData.movements || []
      };
    }
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [analysisType, setAnalysisType] = useState('profitability');
  const [timeRange, setTimeRange] = useState('12m');

  // Subscribe to store changes with error handling
  useEffect(() => {
    try {
      console.log('Analisis: Setting up store subscription');
      const unsubscribe = store.subscribe((newState) => {
        console.log('Analisis: Store updated', newState);
        setStoreState(newState);
      });
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Analisis: Error setting up store subscription', error);
    }
  }, []);

  // Use data from store state with fallback to mockData
  const properties = storeState?.properties || mockData.properties || [];
  const contracts = storeState?.contracts || mockData.contracts || [];
  const loans = storeState?.loans || mockData.loans || [];
  const movements = storeState?.movements || mockData.movements || [];

  // Safety check: if no data, render loading state
  if (!properties || properties.length === 0) {
    console.log('Analisis: No properties found, showing fallback UI');
    return (
      <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Cargando análisis...</h2>
        <p>Inicializando demo data...</p>
        <script dangerouslySetInnerHTML={{__html: `
          setTimeout(() => {
            console.log('Analisis: Fallback timeout, forcing reload');
            window.location.reload();
          }, 3000);
        `}} />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getPropertyAnalysis = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return null;

    const propertyContracts = contracts.filter(c => c.propertyId === propertyId && c.type === 'Alquiler');
    const propertyLoans = loans.filter(l => l.propertyId === propertyId);
    
    const monthlyIncome = propertyContracts.reduce((sum, c) => sum + (c.status === 'Activo' ? c.monthlyAmount : 0), 0);
    const monthlyLoanPayments = propertyLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);
    const netMonthlyProfit = monthlyIncome - property.monthlyExpenses - monthlyLoanPayments;
    
    return {
      property,
      monthlyIncome,
      monthlyExpenses: property.monthlyExpenses,
      monthlyLoanPayments,
      netMonthlyProfit,
      annualProfit: netMonthlyProfit * 12,
      roi: property.purchasePrice > 0 ? ((netMonthlyProfit * 12) / property.purchasePrice * 100) : 0,
      currentValue: property.currentValue,
      capitalGain: property.currentValue - property.purchasePrice,
      occupancyRate: propertyContracts.some(c => c.status === 'Activo') ? 100 : 0
    };
  };

  const portfolioAnalysis = properties.map(p => getPropertyAnalysis(p.id)).filter(Boolean);
  const totalPortfolioValue = portfolioAnalysis.reduce((sum, a) => sum + a.currentValue, 0);
  const totalMonthlyProfit = portfolioAnalysis.reduce((sum, a) => sum + a.netMonthlyProfit, 0);
  const totalAnnualProfit = totalMonthlyProfit * 12;
  const averageROI = portfolioAnalysis.length > 0 ? portfolioAnalysis.reduce((sum, a) => sum + a.roi, 0) / portfolioAnalysis.length : 0;

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

    <main className="main">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{margin: 0}}>Análisis por Activo</h1>
          <div className="flex gap-2">
            <select 
              className="form-control" 
              style={{width: 'auto', marginBottom: 0}}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="6m">Últimos 6 meses</option>
              <option value="12m">Últimos 12 meses</option>
              <option value="24m">Últimos 24 meses</option>
            </select>
            <select 
              className="form-control" 
              style={{width: 'auto', marginBottom: 0}}
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              <option value="profitability">Rentabilidad</option>
              <option value="valuation">Valoración</option>
              <option value="forecast">Proyección</option>
            </select>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex gap-4 mb-6">
          <a href="/inmuebles" className="tab">Cartera</a>
          <a href="/inmuebles/contratos" className="tab">Contratos</a>
          <a href="/inmuebles/prestamos" className="tab">Préstamos</a>
          <a href="/inmuebles/analisis" className="tab active">Análisis</a>
        </div>

        {/* Portfolio Summary KPIs */}
        <div className="card mb-6">
          <h3 style={{margin: '0 0 16px 0'}}>📊 Resumen Cartera</h3>
          <div className="grid-4 gap-4">
            <div>
              <div className="text-sm text-gray">Valor total cartera</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--navy)'}}>
                {formatCurrency(totalPortfolioValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Beneficio mensual</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                {formatCurrency(totalMonthlyProfit)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Beneficio anual</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--teal)'}}>
                {formatCurrency(totalAnnualProfit)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">ROI promedio</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--warning)'}}>
                {averageROI.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Type Content */}
        {analysisType === 'profitability' && (
          <div className="card mb-6">
            <h3 style={{margin: '0 0 16px 0'}}>💰 Análisis de Rentabilidad</h3>
            {portfolioAnalysis.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Inmueble</th>
                      <th style={{textAlign: 'right'}}>Ingresos/mes</th>
                      <th style={{textAlign: 'right'}}>Gastos/mes</th>
                      <th style={{textAlign: 'right'}}>Préstamos/mes</th>
                      <th style={{textAlign: 'right'}}>Beneficio neto/mes</th>
                      <th style={{textAlign: 'right'}}>Beneficio anual</th>
                      <th style={{textAlign: 'right'}}>ROI</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioAnalysis.map(analysis => (
                      <tr key={analysis.property.id}>
                        <td>
                          <div className="font-semibold">{analysis.property.address}</div>
                          <div className="text-sm text-gray">{analysis.property.city}</div>
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold', color: 'var(--success)'}}>
                          {formatCurrency(analysis.monthlyIncome)}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold', color: 'var(--error)'}}>
                          {formatCurrency(analysis.monthlyExpenses)}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold', color: 'var(--warning)'}}>
                          {formatCurrency(analysis.monthlyLoanPayments)}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold', color: analysis.netMonthlyProfit >= 0 ? 'var(--success)' : 'var(--error)'}}>
                          {formatCurrency(analysis.netMonthlyProfit)}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold', color: analysis.annualProfit >= 0 ? 'var(--success)' : 'var(--error)'}}>
                          {formatCurrency(analysis.annualProfit)}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold', color: analysis.roi >= 0 ? 'var(--success)' : 'var(--error)'}}>
                          {analysis.roi.toFixed(2)}%
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedProperty(analysis)}
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray mb-4">No hay datos suficientes para el análisis de rentabilidad</div>
                <button 
                  className="btn btn-secondary"
                  data-action="demo:load"
                >
                  🔄 Cargar datos demo
                </button>
              </div>
            )}
          </div>
        )}

        {analysisType === 'valuation' && (
          <div className="card mb-6">
            <h3 style={{margin: '0 0 16px 0'}}>📈 Análisis de Valoración</h3>
            {portfolioAnalysis.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Inmueble</th>
                      <th style={{textAlign: 'right'}}>Precio compra</th>
                      <th style={{textAlign: 'right'}}>Valor actual</th>
                      <th style={{textAlign: 'right'}}>Ganancia capital</th>
                      <th style={{textAlign: 'right'}}>% Revalorización</th>
                      <th style={{textAlign: 'right'}}>Ratio P/B</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioAnalysis.map(analysis => {
                      const revalorization = analysis.property.purchasePrice > 0 ? 
                        ((analysis.currentValue - analysis.property.purchasePrice) / analysis.property.purchasePrice * 100) : 0;
                      const priceToBook = analysis.property.purchasePrice > 0 ? 
                        (analysis.currentValue / analysis.property.purchasePrice) : 0;
                      
                      return (
                        <tr key={analysis.property.id}>
                          <td>
                            <div className="font-semibold">{analysis.property.address}</div>
                            <div className="text-sm text-gray">{analysis.property.city}</div>
                          </td>
                          <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                            {formatCurrency(analysis.property.purchasePrice)}
                          </td>
                          <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                            {formatCurrency(analysis.currentValue)}
                          </td>
                          <td style={{textAlign: 'right', fontWeight: 'semibold', color: analysis.capitalGain >= 0 ? 'var(--success)' : 'var(--error)'}}>
                            {formatCurrency(analysis.capitalGain)}
                          </td>
                          <td style={{textAlign: 'right', fontWeight: 'semibold', color: revalorization >= 0 ? 'var(--success)' : 'var(--error)'}}>
                            {revalorization.toFixed(2)}%
                          </td>
                          <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                            {priceToBook.toFixed(2)}x
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary btn-sm"
                              data-action="property:revalue"
                              data-id={analysis.property.id}
                            >
                              Revalorizar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray mb-4">No hay datos suficientes para el análisis de valoración</div>
                <button 
                  className="btn btn-secondary"
                  data-action="demo:load"
                >
                  🔄 Cargar datos demo
                </button>
              </div>
            )}
          </div>
        )}

        {analysisType === 'forecast' && (
          <div className="card mb-6">
            <h3 style={{margin: '0 0 16px 0'}}>🔮 Proyección de Rentabilidad</h3>
            <div className="grid-2 gap-6">
              <div>
                <h4 style={{margin: '0 0 12px 0'}}>Escenario Conservador</h4>
                <div className="text-sm text-gray mb-3">
                  Incremento anual renta: +2% | Gastos: +3% | Valoración: +1%
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Beneficio año 1:</span>
                    <span className="font-semibold">{formatCurrency(totalAnnualProfit * 1.02)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficio año 2:</span>
                    <span className="font-semibold">{formatCurrency(totalAnnualProfit * 1.04)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficio año 3:</span>
                    <span className="font-semibold">{formatCurrency(totalAnnualProfit * 1.06)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 style={{margin: '0 0 12px 0'}}>Escenario Optimista</h4>
                <div className="text-sm text-gray mb-3">
                  Incremento anual renta: +4% | Gastos: +2% | Valoración: +3%
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Beneficio año 1:</span>
                    <span className="font-semibold">{formatCurrency(totalAnnualProfit * 1.08)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficio año 2:</span>
                    <span className="font-semibold">{formatCurrency(totalAnnualProfit * 1.16)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficio año 3:</span>
                    <span className="font-semibold">{formatCurrency(totalAnnualProfit * 1.25)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Detail Modal */}
        {selectedProperty && (
          <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{margin: 0}}>Análisis Detallado - {selectedProperty.property.address}</h3>
                <button 
                  className="btn-close"
                  onClick={() => setSelectedProperty(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="grid-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray">Valor de compra</div>
                  <div className="font-semibold">{formatCurrency(selectedProperty.property.purchasePrice)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray">Valor actual</div>
                  <div className="font-semibold">{formatCurrency(selectedProperty.currentValue)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray">Ingresos mensuales</div>
                  <div className="font-semibold" style={{color: 'var(--success)'}}>{formatCurrency(selectedProperty.monthlyIncome)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray">Gastos mensuales</div>
                  <div className="font-semibold" style={{color: 'var(--error)'}}>{formatCurrency(selectedProperty.monthlyExpenses)}</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 style={{margin: '0 0 12px 0'}}>P&L Detallado (Mensual)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>+ Ingresos por alquiler:</span>
                    <span style={{color: 'var(--success)'}}>{formatCurrency(selectedProperty.monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Gastos operativos:</span>
                    <span style={{color: 'var(--error)'}}>{formatCurrency(selectedProperty.monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Pagos préstamos:</span>
                    <span style={{color: 'var(--error)'}}>{formatCurrency(selectedProperty.monthlyLoanPayments)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>= Beneficio neto mensual:</span>
                    <span style={{color: selectedProperty.netMonthlyProfit >= 0 ? 'var(--success)' : 'var(--error)'}}>
                      {formatCurrency(selectedProperty.netMonthlyProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>= Beneficio neto anual:</span>
                    <span style={{color: selectedProperty.annualProfit >= 0 ? 'var(--success)' : 'var(--error)'}}>
                      {formatCurrency(selectedProperty.annualProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>= ROI sobre inversión:</span>
                    <span style={{color: selectedProperty.roi >= 0 ? 'var(--success)' : 'var(--error)'}}>
                      {selectedProperty.roi.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => setSelectedProperty(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  </>);
}