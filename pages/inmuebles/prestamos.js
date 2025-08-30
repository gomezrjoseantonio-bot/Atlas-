import { useState, useEffect } from 'react';
import store from '../../store/index';

export default function PrestamosPage() {
  const [storeState, setStoreState] = useState(store.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return unsubscribe;
  }, []);

  const { loans, properties } = storeState;

  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Sin asignar';
  };

  // Calculate KPIs
  const totalLoans = loans.length;
  const totalDebt = loans.reduce((sum, loan) => sum + loan.pendingCapital, 0);
  const totalMonthlyPayment = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

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

    <main className="main">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{margin: 0}}>Préstamos</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary"
              data-action="demo:load"
            >
              🔄 Cargar Datos Demo
            </button>
            <button 
              className="btn btn-primary"
              data-action="loan:create"
            >
              ➕ Nuevo préstamo
            </button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex gap-4 mb-6">
          <a href="/inmuebles" className="tab">Cartera</a>
          <a href="/inmuebles/contratos" className="tab">Contratos</a>
          <a href="/inmuebles/prestamos" className="tab active">Préstamos</a>
          <a href="/inmuebles/analisis" className="tab">Análisis</a>
        </div>

        {/* KPIs */}
        <div className="grid-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Nº préstamos</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--navy)'}}>
                  {totalLoans}
                </div>
              </div>
              <div style={{fontSize: '32px', opacity: 0.2}}>🏦</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Deuda pendiente total</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--error)', textAlign: 'right'}}>
                  {formatCurrency(totalDebt)}
                </div>
              </div>
              <div style={{fontSize: '32px', opacity: 0.2}}>💰</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Cuota mensual total</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--warning)', textAlign: 'right'}}>
                  {formatCurrency(totalMonthlyPayment)}
                </div>
              </div>
              <div style={{fontSize: '32px', opacity: 0.2}}>📅</div>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0}}>Mis préstamos</h3>
            <button 
              className="btn btn-secondary btn-sm"
              data-action="loan:link-property"
            >
              🔗 Vincular a inmueble
            </button>
          </div>

          {loans.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Banco</th>
                  <th>Inmueble</th>
                  <th className="text-right">Capital pendiente</th>
                  <th>Tipo</th>
                  <th className="text-right">Cuota</th>
                  <th className="text-right">Meses restantes</th>
                  <th>Próxima revisión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id}>
                    <td>
                      <div className="font-semibold">{loan.bank}</div>
                      <div className="text-sm text-gray">{loan.product || 'Hipoteca estándar'}</div>
                    </td>
                    <td>
                      <div className="font-medium">{getPropertyName(loan.propertyId)}</div>
                      {!loan.propertyId && (
                        <div className="text-sm" style={{color: 'var(--warning)'}}>Sin vincular</div>
                      )}
                    </td>
                    <td className="text-right font-semibold" style={{color: 'var(--error)'}}>
                      {formatCurrency(loan.pendingCapital)}
                    </td>
                    <td>
                      <span className={`chip ${loan.interestType === 'fijo' ? 'success' : 'warning'}`}>
                        {loan.interestType === 'fijo' ? 'Fijo' : 'Variable'}
                      </span>
                      <div className="text-sm text-gray">{loan.interestRate}%</div>
                    </td>
                    <td className="text-right font-semibold">
                      {formatCurrency(loan.monthlyPayment)}
                    </td>
                    <td className="text-right">
                      {loan.remainingMonths || '—'}
                    </td>
                    <td>
                      {loan.nextRevision ? (
                        <div>
                          <div className="text-sm">{new Date(loan.nextRevision).toLocaleDateString('es-ES')}</div>
                          <div className="text-xs text-gray">Revisión tipo</div>
                        </div>
                      ) : (
                        <span className="text-gray">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-primary btn-sm"
                          data-action="loan:amortize"
                          data-id={loan.id}
                          title="Reducir capital pendiente (simulado)"
                        >
                          💰 Amortizar
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          data-action="loan:edit"
                          data-id={loan.id}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn-error btn-sm"
                          data-action="loan:delete"
                          data-id={loan.id}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{textAlign: 'center', padding: '64px 32px', color: 'var(--gray)'}}>
              <div style={{fontSize: '64px', marginBottom: '16px', opacity: 0.3}}>🏦</div>
              <h3 style={{margin: '0 0 8px 0', color: 'var(--gray)'}}>No hay préstamos registrados</h3>
              <p style={{margin: '0 0 24px 0'}}>Añade tu primer préstamo para comenzar a gestionar tu financiación inmobiliaria.</p>
              <button 
                className="btn btn-primary"
                data-action="loan:create"
              >
                ➕ Crear primer préstamo
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {loans.length > 0 && (
          <div className="card mt-4" style={{background: '#F8F9FA'}}>
            <h4 style={{margin: '0 0 12px 0', color: 'var(--navy)'}}>💡 Información útil</h4>
            <div className="grid gap-3" style={{gridTemplateColumns: '1fr 1fr'}}>
              <div>
                <div className="text-sm font-semibold">Amortización</div>
                <div className="text-sm text-gray">
                  Reduce el capital pendiente anticipadamente para ahorrar en intereses
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold">Próxima revisión</div>
                <div className="text-sm text-gray">
                  Fecha en la que se revisará el tipo de interés (solo préstamos variables)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  </>);
}