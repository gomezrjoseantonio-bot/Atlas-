import { useState, useEffect } from 'react';
import store from '../store/index';
import { getTotalPortfolioValue, getTotalMonthlyRent, getOccupancyRate, getTotalMonthlyExpenses } from '../data/mockData';
import Modal from '../components/Modal';

export default function Page() {
  const [personalMode, setPersonalMode] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atlas.personalMode') === 'true';
    }
    return false;
  });
  
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state immediately
    return store.getState();
  });
  
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Persist personal mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atlas.personalMode', personalMode.toString());
    }
  }, [personalMode]);

  const missingInvoices = storeState?.missingInvoices || [];
  const accounts = storeState?.accounts || [];
  const documents = storeState?.documents || [];
  const properties = storeState?.properties || [];
  const inboxEntries = storeState?.inboxEntries || [];
  const movements = storeState?.movements || [];
  const alerts = storeState?.alerts || [];
  
  // Calculate live data
  const unprocessedInboxEntries = inboxEntries.filter(entry => 
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
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const safeNumber = (value, fallback = 0) => {
    return (value === null || value === undefined || isNaN(value)) ? fallback : value;
  };

  // Calculate consolidated KPIs
  const totalAccountBalance = accounts.reduce((sum, acc) => sum + safeNumber(acc.balanceToday), 0);
  const portfolioValue = safeNumber(getTotalPortfolioValue());
  const totalPatrimony = portfolioValue + totalAccountBalance;
  
  const monthlyPropertyIncome = safeNumber(getTotalMonthlyRent());
  const monthlyPersonalIncome = personalMode ? personalFinances.monthlyNetSalary : 0;
  const totalMonthlyIncome = monthlyPropertyIncome + monthlyPersonalIncome;
  
  const monthlyPropertyExpenses = safeNumber(getTotalMonthlyExpenses());
  const monthlyPersonalExpenses = personalMode ? personalFinances.monthlyExpenses : 0;
  const totalMonthlyExpenses = monthlyPropertyExpenses + monthlyPersonalExpenses;
  
  // Calculate monthly flow
  const monthlyFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const flowIsPositive = monthlyFlow >= 0;
  
  // Active alerts by severity
  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const lowBalanceAlerts = activeAlerts.filter(alert => alert.type === 'low_balance');
  const missingInvoiceAlerts = activeAlerts.filter(alert => alert.type === 'missing_invoice');
  const reviewAlerts = activeAlerts.filter(alert => alert.type === 'review_required');
  
  // Recent movements (last 4)
  const recentMovements = movements
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Mock 90-day chart data (placeholder)
  const last90Days = Array.from({length: 90}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    return {
      date: date.toISOString().split('T')[0],
      income: Math.random() * 200 + 50,
      expenses: Math.random() * 150 + 30
    };
  });

  const handleQuickAction = (action) => {
    setIsLoading(true);
    // Simulate async action
    setTimeout(() => {
      switch(action) {
        case 'income':
          window.showToast && window.showToast('Registro de ingreso iniciado', 'info');
          break;
        case 'expense':
          window.showToast && window.showToast('Registro de gasto iniciado', 'info');
          break;
        case 'connect':
          window.showToast && window.showToast('Conexión bancaria en proceso', 'info');
          break;
        case 'report':
          window.showToast && window.showToast('Generando informe PDF...', 'info');
          break;
      }
      setIsLoading(false);
    }, 500);
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
          <a className="tab active" href="/panel">Panel</a>
          <a className="tab" href="/inmuebles">Inmuebles</a>
          <a className="tab" href="/tesoreria">Tesorería</a>
          <a className="tab" href="/proyeccion">Proyección</a>
          <a className="tab" href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <a href="/inbox" className="btn btn-secondary btn-sm" style={{fontSize: '12px', marginRight: '8px'}}>
            📄 Subir documentos
          </a>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => store.resetDemo()}
            style={{marginRight: '12px'}}
          >
            🔄 Demo
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Búsqueda próximamente disponible', 'info');
              }
            }}
            style={{marginRight: '12px', background: 'none', border: 'none', fontSize: '18px'}}
          >
            🔍
          </button>
          <a href="/tesoreria" className="notification-badge">
            <span>🔔</span>
            {activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
              <span className="badge">
                {activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length}
              </span>
            )}
          </a>
          <span>⚙️</span>
        </div>
      </div>
    </header>

    <main className="container">
      {/* Header with PERSONAL Switch */}
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--accent)', margin:0}}>Vista Consolidada</h2>
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

      {/* Hero Section with KPIs */}
      <div className="card mb-4" style={{background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)', color: '#fff'}}>
        <div className="grid-3 gap-4 mb-4">
          <div>
            <div className="text-sm" style={{opacity: 0.8}}>Cash hoy</div>
            <div className="font-semibold" style={{fontSize: '24px'}}>{formatCurrency(totalAccountBalance)}</div>
            <a href="/tesoreria" className="text-xs" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'underline'}}>
              → Ir a Tesorería
            </a>
          </div>
          <div>
            <div className="text-sm" style={{opacity: 0.8}}>Ingresos vs Gastos (30d)</div>
            <div className="font-semibold" style={{fontSize: '24px'}}>{formatCurrency(monthlyFlow)}</div>
            <a href="/inmuebles" className="text-xs" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'underline'}}>
              → Ver gastos por activo
            </a>
          </div>
          <div>
            <div className="text-sm" style={{opacity: 0.8}}>DSCR cartera (12m)</div>
            <div className="font-semibold" style={{fontSize: '24px'}}>1.24</div>
            <a href="/inmuebles" className="text-xs" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'underline'}}>
              → Análisis
            </a>
          </div>
        </div>
        
        {/* Alertas section */}
        <div className="mb-4">
          <div className="text-sm mb-2" style={{opacity: 0.8}}>
            Alertas activas
          </div>
          <div style={{
            padding: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{fontSize: '18px', fontWeight: '600'}}>
              {activeAlerts.length}
            </span>
            <a 
              href="/tesoreria" 
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'underline'
              }}
            >
              → Ver alertas
            </a>
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex justify-end">
          <button 
            className="btn btn-secondary"
            style={{backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none'}}
            onClick={() => setShowPendingModal(true)}
          >
            Resolver pendientes
          </button>
        </div>
      </div>

      {/* Unified Alerts Ribbon */}
      <div className="card mb-4" style={{borderColor: 'var(--warning)', background: '#FFFBEB'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {lowBalanceAlerts.length > 0 && (
              <span 
                className="chip warning clickable"
                onClick={() => window.location.href = '/tesoreria?filter=low_balance'}
                style={{cursor: 'pointer'}}
              >
                Saldo bajo ({lowBalanceAlerts.length})
              </span>
            )}
            {totalMissingInvoices > 0 && (
              <span 
                className="chip warning clickable"
                onClick={() => window.location.href = '/documentos?filter=missing'}
                style={{cursor: 'pointer'}}
              >
                Gastos sin factura ({totalMissingInvoices})
              </span>
            )}
            {reviewAlerts.length > 0 && (
              <span 
                className="chip attention clickable"
                onClick={() => window.location.href = '/tesoreria?filter=review'}
                style={{cursor: 'pointer'}}
              >
                Revisión de tipo ({reviewAlerts.length})
              </span>
            )}
            {!lowBalanceAlerts.length && !totalMissingInvoices && !reviewAlerts.length && (
              <span className="chip success">Todo en orden</span>
            )}
          </div>
          <a href="/tesoreria" className="btn btn-primary btn-sm">Ver todas</a>
        </div>
      </div>

      {/* Two-Column Summary Cards */}
      <div className="grid gap-4 mb-4">
        {/* ATLAS Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0, color: 'var(--accent)'}}>ATLAS Horizon</h3>
            <span className="chip success">OK</span>
          </div>
          <div className="grid gap-4 mb-4">
            <div>
              <div className="text-sm text-gray">Inmuebles</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>{properties.length} propiedades</div>
            </div>
            <div>
              <div className="text-sm text-gray">Ocupación</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>{getOccupancyRate().toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray">Rentabilidad</div>
              <div className="font-semibold" style={{fontSize: '18px'}}>6.8%</div>
            </div>
          </div>
          <a href="/inmuebles" className="btn btn-outline btn-sm">Ir a Inmuebles</a>
        </div>

        {/* PERSONAL Section - Always visible but conditional content */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0, color: personalMode ? 'var(--accent)' : 'var(--text-2)'}}>
              ATLAS Pulse
            </h3>
            <span className={`chip ${personalMode ? 'success' : 'disabled'}`}>
              {personalMode ? 'OK' : 'OFF'}
            </span>
          </div>
          {personalMode ? (
            <>
              <div className="grid gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray">Nómina</div>
                  <div className="font-semibold" style={{fontSize: '18px'}}>
                    {formatCurrency(personalFinances.monthlyNetSalary)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray">Gastos personales</div>
                  <div className="font-semibold" style={{fontSize: '18px'}}>
                    {formatCurrency(personalFinances.monthlyExpenses)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray">Ahorro</div>
                  <div className="font-semibold" style={{fontSize: '18px'}}>
                    {formatCurrency(personalFinances.monthlyNetSalary - personalFinances.monthlyExpenses)}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => window.showToast && window.showToast('Edición de finanzas personales próximamente', 'info')}
              >
                Editar personales
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-gray">
              <div className="mb-2">💰</div>
              <div className="text-sm">Activar modo PERSONAL para ver finanzas consolidadas</div>
            </div>
          )}
        </div>
      </div>

      {/* Pulse Chart */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0, color: 'var(--accent)'}}>Pulso 90 días</h3>
          <span className="text-sm text-gray">Ingresos vs Egresos</span>
        </div>
        {last90Days.length > 0 ? (
          <div style={{
            height: '200px',
            background: 'linear-gradient(to bottom, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0.05) 50%, rgba(239, 68, 68, 0.05) 50%, rgba(239, 68, 68, 0.1) 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--border)'
          }}>
            <div className="text-center text-gray">
              <div style={{fontSize: '24px', marginBottom: '8px'}}>📊</div>
              <div className="text-sm">Gráfico de flujos (placeholder)</div>
              <div className="text-xs" style={{opacity: 0.7}}>
                Últimos 90 días de movimientos
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray">
            <div className="mb-2">📈</div>
            <div className="text-sm">Sin datos suficientes para mostrar tendencias</div>
          </div>
        )}
      </div>

      {/* Recent Movements */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0, color: 'var(--accent)'}}>Movimientos recientes</h3>
          <a href="/tesoreria" className="text-sm" style={{color: 'var(--accent)'}}>Ver todos</a>
        </div>
        {recentMovements.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Cuenta</th>
                  <th>Importe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((movement, index) => {
                  const account = accounts.find(acc => acc.id === movement.accountId);
                  return (
                    <tr key={movement.id || index}>
                      <td>{new Date(movement.date).toLocaleDateString('es-ES')}</td>
                      <td>
                        <div>{movement.description || movement.concept}</div>
                        {movement.missingDocument && (
                          <a 
                            href="/documentos" 
                            className="text-xs" 
                            style={{color: 'var(--warning)'}}
                          >
                            Asignar doc
                          </a>
                        )}
                      </td>
                      <td>{account?.name || '—'}</td>
                      <td style={{
                        color: movement.amount >= 0 ? 'var(--success)' : 'var(--error)',
                        fontWeight: '600'
                      }}>
                        {formatCurrency(movement.amount)}
                      </td>
                      <td>
                        <span className={`chip ${
                          movement.status === 'Procesado' ? 'success' :
                          movement.status === 'Pendiente' ? 'warning' :
                          movement.status === 'Error' ? 'error' : 'info'
                        }`}>
                          {movement.status || 'Procesado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray">
            <div className="mb-2">💸</div>
            <div className="text-sm">No hay movimientos recientes</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Acciones rápidas</h3>
        <div className="grid-4 gap-2">
          <button 
            className="btn btn-outline"
            onClick={() => handleQuickAction('income')}
            disabled={isLoading}
          >
            + Registrar ingreso
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => handleQuickAction('expense')}
            disabled={isLoading}
          >
            + Registrar gasto
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => handleQuickAction('connect')}
            disabled={isLoading}
          >
            Conectar cuenta
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => handleQuickAction('report')}
            disabled={isLoading}
          >
            Generar informe PDF
          </button>
        </div>
      </div>
    </main>

    {/* Pending Actions Modal */}
    {showPendingModal && (
      <Modal onClose={() => setShowPendingModal(false)}>
        <h3 style={{margin: '0 0 16px 0', color: 'var(--navy)'}}>Pendientes del mes</h3>
        <div className="space-y-3">
          {lowBalanceAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-red-800">Saldo bajo</div>
                <div className="text-sm text-red-600">{alert.message}</div>
              </div>
              <a href="/tesoreria" className="btn btn-sm btn-primary">Ver</a>
            </div>
          ))}
          {totalMissingInvoices > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium text-yellow-800">Gastos sin factura</div>
                <div className="text-sm text-yellow-600">{totalMissingInvoices} documentos pendientes</div>
              </div>
              <a href="/documentos" className="btn btn-sm btn-primary">Resolver</a>
            </div>
          )}
          {reviewAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <div className="font-medium text-orange-800">Revisión requerida</div>
                <div className="text-sm text-orange-600">{alert.message}</div>
              </div>
              <a href="/tesoreria" className="btn btn-sm btn-primary">Revisar</a>
            </div>
          ))}
          {!lowBalanceAlerts.length && !totalMissingInvoices && !reviewAlerts.length && (
            <div className="text-center py-8 text-gray">
              <div className="mb-2">✅</div>
              <div>No hay pendientes este mes</div>
            </div>
          )}
        </div>
      </Modal>
    )}
  </>);
}
