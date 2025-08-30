import { useState, useEffect } from 'react';
import store from '../store/index';
import { getTotalPortfolioValue, getTotalMonthlyRent, getOccupancyRate } from '../data/mockData';

export default function Page() {
  const [personalMode, setPersonalMode] = useState(false);
  const [storeState, setStoreState] = useState(store.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return unsubscribe;
  }, []);

  const { missingInvoices, accounts, documents, properties } = storeState;
  
  // Calculate live data
  const unprocessedInboxEntries = storeState.inboxEntries.filter(entry => 
    entry.status === 'Pendiente de procesamiento' || entry.status === 'Error lectura'
  );
  const pendingDocuments = documents.filter(doc => doc.status === 'Pendiente');
  const totalMissingInvoices = unprocessedInboxEntries.length + pendingDocuments.length;
  
  // Personal finances mock data for now
  const personalFinances = {
    monthlyNetSalary: 3200,
    monthlyExpenses: 2450,
    irpfProvision: 850,
    ivaProvision: 0,
    estimatedAnnualNet: 38400,
    estimatedAnnualExpenses: 29400
  };

  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  // Calculate consolidated KPIs when PERSONAL is ON
  const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balanceToday, 0);
  const totalPatrimony = getTotalPortfolioValue() + totalAccountBalance;
  const monthlyPropertyIncome = getTotalMonthlyRent();
  const monthlyPersonalIncome = personalFinances.monthlyNetSalary;
  const totalMonthlyIncome = monthlyPropertyIncome + (personalMode ? monthlyPersonalIncome : 0);
  const totalMonthlyExpenses = 445 + (personalMode ? personalFinances.monthlyExpenses : 0); // Mock property expenses

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
              <div className="font-semibold" style={{fontSize: '20px'}}>{formatCurrency(totalPatrimony)}</div>
            </div>
            <div>
              <div className="text-sm" style={{opacity: 0.8}}>Ingresos Mes</div>
              <div className="font-semibold" style={{fontSize: '20px'}}>{formatCurrency(totalMonthlyIncome)}</div>
            </div>
            <div>
              <div className="text-sm" style={{opacity: 0.8}}>Gastos Mes</div>
              <div className="font-semibold" style={{fontSize: '20px'}}>{formatCurrency(totalMonthlyExpenses)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Notification - Pending Invoices */}
      <div className="card mb-4" style={{borderColor: 'var(--warning)', background: '#FFFBEB'}}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium" style={{color: 'var(--warning)'}}>{totalMissingInvoices} gastos sin factura</span>
            <span className="text-gray"> · Recupera deducciones (5 min)</span>
          </div>
          <a href="/documentos" className="btn btn-primary btn-sm">Resolver</a>
        </div>
      </div>

      {/* KPI Mini - Deductible perdido */}
      <div className="card mb-4" style={{borderColor: 'var(--error)', background: '#FEF2F2'}}>
        <div>
          <span className="font-medium" style={{color: 'var(--error)'}}>Deducible perdido ahora mismo: </span>
          <span className="font-semibold" style={{color: 'var(--error)'}}>
            {formatCurrency(pendingDocuments.reduce((sum, doc) => sum + (doc.amount || 0), 0))}
          </span>
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
              <div className="font-semibold" style={{fontSize: '18px'}}>{storeState.properties.length} propiedades</div>
            </div>
            <div>
              <div className="text-sm text-gray">Ocupación media</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>{getOccupancyRate().toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray">Rentabilidad bruta</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>6.8%</div>
            </div>
          </div>
        </div>

        {personalMode && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0, color: 'var(--teal)'}}>PERSONAL · Finanzas</h3>
              <span className="chip success">OK</span>
            </div>
            <div className="grid gap-4">
              <div>
                <div className="text-sm text-gray">Nómina neta mensual</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>{formatCurrency(personalFinances.monthlyNetSalary)}</div>
              </div>
              <div>
                <div className="text-sm text-gray">Gastos personales</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>{formatCurrency(personalFinances.monthlyExpenses)}</div>
              </div>
              <div>
                <div className="text-sm text-gray">Ahorro mensual</div>
                <div className="font-semibold" style={{fontSize: '18px'}}>
                  {formatCurrency(personalFinances.monthlyNetSalary - personalFinances.monthlyExpenses)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  </>);
}
