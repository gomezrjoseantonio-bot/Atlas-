import { useState, useEffect } from 'react';
import store from '../store/index';
import { mockData } from '../data/mockData';
import Header from '../components/Header';
import { TargetIcon, CreditCardIcon, AlertTriangleIcon, CheckIcon, EuroIcon, ClipboardListIcon, BellIcon, RefreshCwIcon } from '../components/icons';

export default function Page() {
  const [activeSubTab, setActiveSubTab] = useState('radar');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [alertFilter, setAlertFilter] = useState('all');
  
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state if available, otherwise use mockData
    if (typeof window !== 'undefined') {
      return store.getState();
    }
    return {
      accounts: mockData.accounts || [],
      movements: mockData.movements || [],
      alerts: mockData.alerts || [],
      treasuryRules: mockData.treasuryRules || [],
      scheduledPayments: mockData.scheduledPayments || [],
      ...mockData
    };
  });

  // Check URL parameters for filter presets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter');
      
      if (filter === 'low_balance') {
        setAlertFilter('low_balance');
      } else if (filter === 'review') {
        setAlertFilter('review');
      } else if (filter === 'critical') {
        setAlertFilter('critical');
      }
    }
  }, []);

  // Subscribe to store changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unsubscribe = store.subscribe(setStoreState);
      return () => {
        unsubscribe();
      };
    }
  }, []);

  // Ensure we have valid data with fallbacks
  const accounts = storeState?.accounts || mockData.accounts || [];
  const movements = storeState?.movements || mockData.movements || [];
  const alerts = storeState?.alerts || mockData.alerts || [];
  const treasuryRules = storeState?.treasuryRules || mockData.treasuryRules || [];
  const scheduledPayments = storeState?.scheduledPayments || mockData.scheduledPayments || [];

  const getHealthStatus = (health) => {
    const healthMap = {
      'excellent': { chip: 'success', text: 'Excelente', icon: '💚' },
      'good': { chip: 'success', text: 'Bueno', icon: <CheckIcon size={16} /> },
      'warning': { chip: 'warning', text: 'Atención', icon: <AlertTriangleIcon size={16} /> },
      'error': { chip: 'error', text: 'Problema', icon: <AlertTriangleIcon size={16} /> }
    };
    return healthMap[health] || healthMap.good;
  };

  const safeNumber = (value, fallback = 0) => {
    return (value === null || value === undefined || isNaN(value)) ? fallback : value;
  };

  const formatCurrency = (amount) => {
    const safe = safeNumber(amount);
    if (safe === 0 && (amount === null || amount === undefined || isNaN(amount))) {
      return '—';
    }
    return `€${safe.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getBalanceVariation = (today, previous) => {
    const safeTdoay = safeNumber(today);
    const safePrevious = safeNumber(previous, 1); // Avoid division by zero
    
    if (safePrevious === 0) return { percentage: '0.0', isPositive: true };
    
    const variation = ((safeTdoay - safePrevious) / safePrevious) * 100;
    return {
      percentage: Math.abs(variation).toFixed(1),
      isPositive: variation >= 0
    };
  };

  const getProgressPercentage = (current, target) => {
    const safeCurrent = safeNumber(current);
    const safeTarget = safeNumber(target, 1); // Avoid division by zero
    return Math.min((safeCurrent / safeTarget) * 100, 100);
  };

  // Calculate total balances with safe math
  const totalBalance = accounts.reduce((sum, acc) => sum + safeNumber(acc.balanceToday), 0);
  const availableAccounts = accounts.filter(acc => acc.balanceToday !== null && acc.balanceToday !== undefined && !isNaN(acc.balanceToday));
  const hasPartialData = availableAccounts.length > 0 && availableAccounts.length < accounts.length;

  // Filter alerts based on current filter
  const getFilteredAlerts = () => {
    const activeAlerts = alerts.filter(alert => !alert.dismissed);
    
    switch(alertFilter) {
      case 'low_balance':
        return activeAlerts.filter(alert => alert.type === 'low_balance');
      case 'contracts':
        return activeAlerts.filter(alert => 
          alert.type === 'contract_expiry' || 
          alert.type === 'rent_payment_due' || 
          alert.type === 'rent_indexation'
        );
      case 'review':
        return activeAlerts.filter(alert => alert.type === 'review_required');
      case 'critical':
        return activeAlerts.filter(alert => alert.severity === 'critical');
      case 'next_7_days':
        return activeAlerts.filter(alert => {
          if (!alert.dueDate) return false;
          const dueDate = new Date(alert.dueDate);
          const today = new Date();
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0;
        });
      default:
        return activeAlerts;
    }
  };

  const filteredAlerts = getFilteredAlerts();

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Regla aplicada': return 'success';
      case 'Pendiente': return 'warning';
      case 'Excepción': return 'error';
      default: return 'warning';
    }
  };

  const getDaysLeftBadge = (daysLeft) => {
    if (daysLeft <= 1) return { class: 'error', text: 'Hoy' };
    if (daysLeft <= 7) return { class: 'warning', text: '7 días' };
    if (daysLeft <= 30) return { class: 'success', text: '30 días' };
    return { class: 'success', text: '30+ días' };
  };

  const alertCount = alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  // Define sub-tabs for tesoreria
  const subTabs = [
    { key: 'radar', icon: <TargetIcon size={16} />, label: 'Radar de cuentas' },
    { key: 'movimientos', icon: <CreditCardIcon size={16} />, label: 'Movimientos' },
    { key: 'alertas', icon: <AlertTriangleIcon size={16} />, label: 'Alertas' },
    { key: 'proyeccion', icon: '📊', label: 'Previsión' }
  ];

  // Calculate totals for header query
  const monthlyIncome = 8450.00; // This could come from calculations
  const monthlyExpenses = 3240.50; // This could come from calculations

  return (<>
    <Header 
      currentTab="tesoreria" 
      subTabs={subTabs}
      activeSubTab={activeSubTab}
      onSubTabChange={setActiveSubTab}
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
    />

    <main className="container">
      <h2 style={{color:'var(--accent)', margin:'0 0 24px 0'}}>Tesorería</h2>

      {/* Query Summary - Above radar de cuentas */}
      <div className="card mb-4" style={{background: 'linear-gradient(135deg, var(--accent-subtle), #ffffff)'}}>
        <div className="grid-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray">Saldo Total</div>
            <div className="font-semibold" style={{fontSize: '24px', color: 'var(--accent)'}}>
              {formatCurrency(totalBalance)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray">Ingresos (30d)</div>
            <div className="font-semibold" style={{fontSize: '24px', color: 'var(--success)'}}>
              {formatCurrency(monthlyIncome)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray">Gastos (30d)</div>
            <div className="font-semibold" style={{fontSize: '24px', color: 'var(--error)'}}>
              {formatCurrency(monthlyExpenses)}
            </div>
          </div>
        </div>
      </div>

      {/* Radar de Cuentas Tab */}
      {activeSubTab === 'radar' && (
        <div className="card mb-4">
          <h3 style={{margin: '0 0 16px 0'}}>Radar de Cuentas</h3>
          <div className="grid gap-4">
            {accounts.map(account => {
              const status = getHealthStatus(account.health);
              const variationT7 = getBalanceVariation(account.balanceToday, account.balanceT7);
              const variationT30 = getBalanceVariation(account.balanceToday, account.balanceT30);
              const progressPercentage = getProgressPercentage(account.balanceToday, account.targetBalance);
              
              return (
                <div key={account.id} className="card" style={{background: '#F9FAFB'}}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold">{account.name}</div>
                      <div className="text-sm text-gray">{account.bank} · {account.iban}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{fontSize: '18px'}}>{status.icon}</span>
                      <span className={`chip ${status.chip}`}>{status.text}</span>
                    </div>
                  </div>
                  
                  <div className="grid-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray">Saldo Hoy</div>
                      <div className="font-semibold" style={{fontSize: '18px'}}>
                        {formatCurrency(account.balanceToday)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray">T-7</div>
                      <div className="font-semibold" style={{fontSize: '16px', color: variationT7.isPositive ? 'var(--success)' : 'var(--error)'}}>
                        {variationT7.isPositive ? '+' : '-'}{variationT7.percentage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray">T-30</div>
                      <div className="font-semibold" style={{fontSize: '16px', color: variationT30.isPositive ? 'var(--success)' : 'var(--error)'}}>
                        {variationT30.isPositive ? '+' : '-'}{variationT30.percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray">Objetivo: {formatCurrency(account.targetBalance)}</span>
                      <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${progressPercentage}%`,
                          background: `linear-gradient(90deg, var(--error), var(--warning), var(--success))`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div style={{marginTop: '12px'}}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowTransferModal(true);
                      }}
                    >
                      Realizar traspaso
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Movimientos Tab */}
      {activeSubTab === 'movimientos' && (
        <div className="card mb-4">
          <h3 style={{margin: '0 0 16px 0'}}>Movimientos (Inbox)</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th style={{textAlign: 'right'}}>Importe</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 10).map(movement => (
                  <tr key={movement.id}>
                    <td>{movement.date}</td>
                    <td>
                      <div>{movement.description}</div>
                      {movement.propertyId && (
                        <div className="text-sm text-gray">
                          {mockData.properties.find(p => p.id === movement.propertyId)?.address}
                        </div>
                      )}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      <span style={{color: movement.amount > 0 ? 'var(--success)' : 'var(--error)'}}>
                        €{Math.abs(movement.amount).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                      </span>
                    </td>
                    <td>
                      <span className="chip">{movement.category}</span>
                    </td>
                    <td>
                      <button 
                        className={`chip ${getStatusChipClass(movement.status)}`}
                        onClick={() => {
                          // Toggle status functionality
                          const newStatus = movement.status === 'Pendiente' ? 'Regla aplicada' : 'Pendiente';
                          console.log(`Toggling status for movement ${movement.id} to ${newStatus}`);
                        }}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        {movement.status}
                      </button>
                    </td>
                    <td>
                      {!movement.hasDocument && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedMovement(movement);
                            setShowDocumentModal(true);
                          }}
                        >
                          Asignar documento
                        </button>
                      )}
                      {movement.hasDocument && (
                        <span className="text-sm text-gray">✓ Documentado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alertas Tab */}
      {activeSubTab === 'alertas' && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: '0'}}>Centro de Alertas</h3>
            <div className="flex items-center gap-2">
              <select 
                className="form-control" 
                style={{minWidth: '150px'}}
                value={alertFilter}
                onChange={(e) => setAlertFilter(e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="critical">Críticas</option>
                <option value="low_balance">Saldo bajo</option>
                <option value="contracts">Contratos</option>
                <option value="review">Revisión requerida</option>
                <option value="next_7_days">Próximos 7 días</option>
              </select>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => store.runRulesEngine()}
              >
                ⚙️ Aplicar reglas ahora
              </button>
            </div>
          </div>
          
          {filteredAlerts && filteredAlerts.length > 0 ? (
            <div className="grid gap-3">
              {filteredAlerts.map(alert => {
                const getSeverityIcon = (severity) => {
                  switch(severity) {
                    case 'critical': return <AlertTriangleIcon size={16} color="var(--danger)" />;
                    case 'high': return <AlertTriangleIcon size={16} color="var(--warning)" />;
                    case 'medium': return <BellIcon size={16} color="var(--warning)" />;
                    case 'low': return <CheckIcon size={16} color="var(--text-2)" />;
                    default: return <ClipboardListIcon size={16} />;
                  }
                };
                
                const getSeverityChip = (severity) => {
                  switch(severity) {
                    case 'critical': return 'error';
                    case 'high': return 'warning';
                    case 'medium': return 'warning';
                    case 'low': return 'success';
                    default: return 'secondary';
                  }
                };
                
                return (
                  <div key={alert.id} className="card" style={{background: '#F9FAFB', border: alert.severity === 'critical' ? '2px solid var(--error)' : '1px solid #E5E7EB'}}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span style={{fontSize: '20px'}}>{getSeverityIcon(alert.severity)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{alert.title}</span>
                            <span className={`chip ${getSeverityChip(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <div className="text-sm text-gray mb-3">{alert.description}</div>
                          <div className="flex items-center gap-2">
                            {alert.actions && alert.actions.includes('move_money') && (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  // Handle move money action
                                  console.log('Move money action for alert:', alert.id);
                                }}
                              >
                                Mover ahora
                              </button>
                            )}
                            {alert.actions && alert.actions.includes('prepare_funds') && (
                              <button className="btn btn-secondary btn-sm">
                                Preparar fondos
                              </button>
                            )}
                            {alert.actions && alert.actions.includes('open_contract') && (
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  if (alert.contractId) {
                                    window.location.href = `/inmuebles/contratos?contract=${alert.contractId}`;
                                  } else {
                                    window.location.href = '/inmuebles/contratos';
                                  }
                                }}
                              >
                                <ClipboardListIcon size={14} style={{marginRight: '4px'}} />
                                Abrir contrato
                              </button>
                            )}
                            {alert.actions && alert.actions.includes('renew_contract') && (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  console.log('Renew contract action for alert:', alert.id);
                                  if (typeof window !== 'undefined' && window.showToast) {
                                    window.showToast('Iniciando renovación de contrato...', 'info');
                                  }
                                }}
                              >
                                <RefreshCwIcon size={14} style={{marginRight: '4px'}} />
                                Renovar
                              </button>
                            )}
                            {alert.actions && alert.actions.includes('mark_paid') && (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  console.log('Mark paid action for alert:', alert.id);
                                  if (typeof window !== 'undefined' && window.showToast) {
                                    window.showToast('Marcando pago como recibido...', 'success');
                                  }
                                }}
                              >
                                ✅ Marcar pagado
                              </button>
                            )}
                            {alert.actions && alert.actions.includes('send_reminder') && (
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  console.log('Send reminder action for alert:', alert.id);
                                  if (typeof window !== 'undefined' && window.showToast) {
                                    window.showToast('Enviando recordatorio al inquilino...', 'info');
                                  }
                                }}
                              >
                                📧 Recordatorio
                              </button>
                            )}
                            {alert.actions && alert.actions.includes('apply_indexation') && (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  console.log('Apply indexation action for alert:', alert.id);
                                  if (typeof window !== 'undefined' && window.showToast) {
                                    window.showToast(`Aplicando actualización IPC (+${alert.suggestedIncrease}%)...`, 'info');
                                  }
                                }}
                              >
                                📈 Aplicar IPC
                              </button>
                            )}
                            <button 
                              className="btn btn-ghost btn-sm"
                              onClick={() => store.updateAlert(alert.id, { dismissed: true })}
                            >
                              Descartar
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const postponedUntil = new Date();
                                postponedUntil.setDate(postponedUntil.getDate() + 7);
                                store.updateAlert(alert.id, { 
                                  postponedUntil: postponedUntil.toISOString() 
                                });
                              }}
                            >
                              Posponer 7 días
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray py-4">
              ✅ No hay alertas pendientes
            </div>
          )}
        </div>
      )}

      {/* Proyección Tab */}
      {activeSubTab === 'proyeccion' && (
        <div className="space-y-4">
          {/* Enhanced Alerts Calendar - Predicted Items */}
          <div className="card mb-4">
            <h3 style={{margin: '0 0 16px 0'}}>Cargos e Ingresos Previstos</h3>
            <div className="grid gap-3">
              {/* Show predicted items from next 90 days */}
              {storeState.predictedItems && storeState.predictedItems
                .filter(item => {
                  const dueDate = new Date(item.dueDate);
                  const now = new Date();
                  const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                  return diffDays >= 0 && diffDays <= 90;
                })
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 10)
                .map(item => {
                  const dueDate = new Date(item.dueDate);
                  const now = new Date();
                  const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                  const badge = getDaysLeftBadge(daysLeft);
                  const property = mockData.properties.find(p => p.id === item.propertyId);
                  
                  return (
                    <div key={item.id} className="card" style={{
                      background: '#F9FAFB',
                      borderLeft: `4px solid ${item.type === 'income' ? 'var(--success)' : 'var(--warning)'}`
                    }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span>
                            {item.type === 'income' ? <EuroIcon size={20} color="var(--success)" /> : <CreditCardIcon size={20} color="var(--accent)" />}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold">{item.description}</div>
                            {property && (
                              <div className="text-sm text-gray">{property.address}</div>
                            )}
                            <div className="text-sm text-gray">Vencimiento: {item.dueDate}</div>
                            <div className="text-xs text-gray">
                              {item.recurringType} · {item.source}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold" style={{
                            fontSize: '16px',
                            color: item.type === 'income' ? 'var(--success)' : 'var(--error)'
                          }}>
                            {item.type === 'income' ? '+' : ''}€{item.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                          </div>
                          <span className={`chip ${badge.class}`}>{badge.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
              
              {/* Legacy scheduled payments */}
              {scheduledPayments.map(payment => {
                const badge = getDaysLeftBadge(payment.daysLeft);
                const property = mockData.properties.find(p => p.id === payment.propertyId);
                
                return (
                  <div key={`legacy_${payment.id}`} className="card" style={{background: '#F9FAFB'}}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{payment.description}</div>
                        {property && (
                          <div className="text-sm text-gray">{property.address}</div>
                        )}
                        <div className="text-sm text-gray">Vencimiento: {payment.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold" style={{fontSize: '16px'}}>
                          €{payment.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                        </div>
                        <span className={`chip ${badge.class}`}>{badge.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Show on all tabs */}
      <div className="card">
        <h3 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Acciones Rápidas</h3>
        <div className="grid-4 gap-2">
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Registro de ingreso próximamente', 'info');
              }
            }}
          >
            <EuroIcon size={14} style={{marginRight: '4px'}} />
            Registrar ingreso
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Conexión de cuenta próximamente', 'info');
              }
            }}
          >
            🏦 Conectar nueva cuenta
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Generación de informe próximamente', 'info');
              }
            }}
          >
            📊 Generar informe
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (window.showToast) {
                window.showToast('Configurar alertas próximamente', 'info');
              }
            }}
          >
            ⚙️ Configurar alertas
          </button>
        </div>
      </div>

      {/* Transfer Money Modal */}
      {showTransferModal && selectedAccount && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Mover dinero</h3>
              <button 
                className="btn-close"
                onClick={() => setShowTransferModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray mb-2">Desde</div>
              <div className="font-semibold">{selectedAccount.name}</div>
              <div className="text-sm text-gray">
                Saldo: €{selectedAccount.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Hacia</label>
              <select className="form-control">
                {accounts.filter(a => a.id !== selectedAccount.id).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.bank}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Importe</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowTransferModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // Mock transfer functionality
                  alert('Transferencia simulada realizada');
                  setShowTransferModal(false);
                }}
              >
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Assignment Modal */}
      {showDocumentModal && selectedMovement && (
        <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Asignar documento</h3>
              <button 
                className="btn-close"
                onClick={() => setShowDocumentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray mb-2">Movimiento</div>
              <div className="font-semibold">{selectedMovement.description}</div>
              <div className="text-sm text-gray">
                €{Math.abs(selectedMovement.amount).toLocaleString('es-ES', {minimumFractionDigits: 2})} · {selectedMovement.date}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Documento disponible</label>
              <select className="form-control">
                <option value="">Seleccionar documento...</option>
                {mockData.documents.filter(d => d.status === 'Listo para asignar' || d.status === 'Pendiente').map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.provider} - {doc.concept} - €{doc.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowDocumentModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // Mock document assignment
                  alert('Documento asignado al movimiento');
                  setShowDocumentModal(false);
                }}
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  </>);
}
