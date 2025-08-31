import { useState, useEffect } from 'react';
import store from '../store/index';
import Header from '../components/Header';

export default function Page() {
  const [storeState, setStoreState] = useState(() => {
    return store.getState();
  });

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => {
      unsubscribe();
    };
  }, []);

  const { properties = [], accounts = [], documents = [], alerts = [], loans = [], movements = [] } = storeState;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const safeNumber = (value, fallback = 0) => {
    return (value === null || value === undefined || isNaN(value)) ? fallback : value;
  };

  // Calculate Cash Today (bank balances)
  const cashToday = accounts.reduce((sum, acc) => sum + safeNumber(acc.balance || acc.balanceToday), 0);

  // Calculate Ingresos vs Gastos 30d (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentMovements = movements.filter(m => {
    const movDate = new Date(m.date || m.executionDate);
    return movDate >= thirtyDaysAgo;
  });

  const ingresos30d = recentMovements
    .filter(m => (m.amount || 0) > 0)
    .reduce((sum, m) => sum + safeNumber(m.amount), 0);
  
  const gastos30d = Math.abs(recentMovements
    .filter(m => (m.amount || 0) < 0)
    .reduce((sum, m) => sum + safeNumber(m.amount), 0));

  // Calculate DSCR Cartera (Debt Service Coverage Ratio)
  const monthlyPropertyIncome = properties.reduce((sum, p) => sum + safeNumber(p.monthlyRent), 0);
  const monthlyLoanPayments = loans.reduce((sum, l) => sum + safeNumber(l.monthlyPayment), 0);
  const dscr = monthlyLoanPayments > 0 ? monthlyPropertyIncome / monthlyLoanPayments : 0;

  // Count active alerts
  const activeAlerts = alerts.filter(alert => !alert.dismissed && 
    (alert.severity === 'critical' || alert.severity === 'high' || alert.severity === 'medium')
  ).length;

  return (<>
    <Header 
      currentTab="panel" 
      alertCount={activeAlerts}
    />

    <main className="container">
      <div className="mb-6">
        <h1 style={{margin: '0 0 8px 0', color: 'var(--accent)'}}>Tu plataforma de gestión inmobiliaria</h1>
        <p style={{margin: 0, color: 'var(--text-2)'}}>
          Gestiona tu cartera de inmuebles, controla ingresos y gastos, y 
          optimiza la rentabilidad de tus inversiones desde una sola plataforma.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid-2 gap-6 mb-8">
        {/* Cash Today */}
        <div className="card" style={{padding: '24px'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '16px'}}>💰 Cash hoy</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Saldo total en cuentas bancarias
              </p>
            </div>
            <a href="/tesoreria" className="btn btn-outline btn-sm">Ver tesorería</a>
          </div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)'}}>
            {formatCurrency(cashToday)}
          </div>
        </div>

        {/* Ingresos vs Gastos 30d */}
        <div className="card" style={{padding: '24px'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '16px'}}>📊 Ingresos vs Gastos 30d</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Flujo neto últimos 30 días
              </p>
            </div>
            <a href="/tesoreria" className="btn btn-outline btn-sm">Ver movimientos</a>
          </div>
          <div style={{display: 'flex', gap: '16px', alignItems: 'end'}}>
            <div>
              <div style={{fontSize: '14px', color: 'var(--success)'}}>Ingresos</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--success)'}}>
                {formatCurrency(ingresos30d)}
              </div>
            </div>
            <div>
              <div style={{fontSize: '14px', color: 'var(--error)'}}>Gastos</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--error)'}}>
                {formatCurrency(gastos30d)}
              </div>
            </div>
            <div>
              <div style={{fontSize: '14px', color: 'var(--text-2)'}}>Neto</div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: ingresos30d - gastos30d >= 0 ? 'var(--success)' : 'var(--error)'}}>
                {formatCurrency(ingresos30d - gastos30d)}
              </div>
            </div>
          </div>
        </div>

        {/* DSCR Cartera */}
        <div className="card" style={{padding: '24px'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '16px'}}>🏠 DSCR cartera</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Cobertura de deuda (Debt Service Coverage Ratio)
              </p>
            </div>
            <a href="/inmuebles/analisis" className="btn btn-outline btn-sm">Ver análisis</a>
          </div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: dscr >= 1.2 ? 'var(--success)' : dscr >= 1.0 ? 'var(--warning)' : 'var(--error)'}}>
            {dscr > 0 ? `${dscr.toFixed(2)}x` : '—'}
          </div>
          {dscr > 0 && (
            <div style={{fontSize: '12px', color: 'var(--text-2)', marginTop: '4px'}}>
              {formatCurrency(monthlyPropertyIncome)} / {formatCurrency(monthlyLoanPayments)}
            </div>
          )}
        </div>

        {/* Alertas Activas */}
        <div className="card" style={{padding: '24px'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '16px'}}>🔔 Alertas activas</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Notificaciones que requieren atención
              </p>
            </div>
            <a href="/tesoreria" className="btn btn-outline btn-sm">Ver alertas</a>
          </div>
          <div style={{fontSize: '32px', fontWeight: 'bold', color: activeAlerts > 0 ? 'var(--warning)' : 'var(--success)'}}>
            {activeAlerts}
          </div>
          {activeAlerts > 0 && (
            <div style={{fontSize: '12px', color: 'var(--warning)', marginTop: '4px'}}>
              Revisa las alertas pendientes
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Sections */}
      <div className="grid-2 gap-6">
        {/* Portfolio Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span style={{fontSize: '24px'}}>🏠</span>
            <div>
              <h3 style={{margin: 0}}>Portfolio Inmuebles</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Gestión completa de propiedades con ocupación, rentabilidad y seguimiento de inquilinos.
              </p>
            </div>
          </div>
          <a href="/inmuebles" className="btn btn-primary" style={{width: '100%'}}>
            Acceder al Panel
          </a>
        </div>

        {/* Treasury Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span style={{fontSize: '24px'}}>💰</span>
            <div>
              <h3 style={{margin: 0}}>Tesorería</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Radar de cuentas con estado de salud, seguimiento de flujos de caja y alertas de saldos bajos.
              </p>
            </div>
          </div>
          <a href="/tesoreria" className="btn btn-primary" style={{width: '100%'}}>
            Acceder al Panel
          </a>
        </div>

        {/* Documents Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span style={{fontSize: '24px'}}>📄</span>
            <div>
              <h3 style={{margin: 0}}>Documentos (HITO 2)</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                Inbox inteligente, gestión de facturas con OCR, y "Cierre rápido", y cumplimiento total del brand book ATLAS.
              </p>
            </div>
          </div>
          <a href="/inbox" className="btn btn-primary" style={{width: '100%'}}>
            Ver Documentos
          </a>
        </div>

        {/* Projection Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span style={{fontSize: '24px'}}>📈</span>
            <div>
              <h3 style={{margin: 0}}>Proyección</h3>
              <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
                3 escenarios de forecast (Base/Optimista/Pesimista) con proyecciones a 12-24 meses.
              </p>
            </div>
          </div>
          <a href="/proyeccion" className="btn btn-primary" style={{width: '100%'}}>
            Acceder al Panel
          </a>
        </div>
      </div>

      {/* Implementation Notice */}
      <div className="card mt-6" style={{background: '#F0F9FF', border: '1px solid #0EA5E9'}}>
        <div className="flex items-center gap-3">
          <span style={{fontSize: '24px'}}>🚀</span>
          <div>
            <h4 style={{margin: '0 0 4px 0', color: 'var(--accent)'}}>Implementación HITO 2 Completada</h4>
            <p style={{margin: 0, fontSize: '14px', color: 'var(--text-2)'}}>
              Sistema completo de gestión documental con Inbox, tabla de facturas, Cierre rápido, y 
              cumplimiento total del brand book ATLAS.
            </p>
          </div>
        </div>
      </div>
    </main>
  </>);
}