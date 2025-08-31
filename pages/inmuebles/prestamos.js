import { useState, useEffect } from 'react';
import store from '../../store/index';
import { mockData } from '../../data/mockData';
import Header from '../../components/Header';
import { RefreshCwIcon, PlusIcon } from '../../components/icons';
import { showToast } from '../../components/ToastSystem';

export default function PrestamosPage() {
  const [showAmortizeModal, setShowAmortizeModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [amortizeAmount, setAmortizeAmount] = useState('');
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [newLoanData, setNewLoanData] = useState({
    bank: '',
    product: '',
    type: 'hipoteca',
    principal: '',
    term: '',
    interestType: 'variable',
    interestRate: '',
    openingFee: '',
    appraisalFee: '',
    managementFee: '',
    brokerFee: '',
    propertyId: ''
  });
  
  const [storeState, setStoreState] = useState(() => {
    // More defensive initialization for deployment environments
    try {
      console.log('Prestamos: Starting initialization');
    return store.getState();
    } catch (error) {
      console.error('Prestamos: Error during initialization, using fallback data', error);
      return {
        accounts: mockData.accounts || [],
        properties: mockData.properties || [],
        loans: mockData.loans || [],
        documents: mockData.documents || []
      };
    }
  });

  // Subscribe to store changes with error handling
  useEffect(() => {
    try {
      console.log('Prestamos: Setting up store subscription');
      const unsubscribe = store.subscribe((newState) => {
        console.log('Prestamos: Store updated', newState);
        setStoreState(newState);
      });
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Prestamos: Error setting up store subscription', error);
    }
  }, []);

  // Use loans and properties from store state with fallback to mockData
  const loans = storeState?.loans || mockData.loans || [];
  const properties = storeState?.properties || mockData.properties || [];

  // Safety check: if no data, render loading state
  if (!loans && !properties) {
    console.log('Prestamos: No data found, showing fallback UI');
    return (
      <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Cargando préstamos...</h2>
        <p>Inicializando demo data...</p>
        <script dangerouslySetInnerHTML={{__html: `
          setTimeout(() => {
            console.log('Prestamos: Fallback timeout, forcing reload');
            window.location.reload();
          }, 3000);
        `}} />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '—';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const calculateFrenchAmortization = (principal, annualRate, termMonths) => {
    if (!principal || !annualRate || !termMonths) return null;
    
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const totalAmount = monthlyPayment * termMonths;
    const totalInterest = totalAmount - principal;
    const tae = ((totalAmount / principal) ** (1/termMonths) - 1) * 12 * 100;
    
    return {
      monthlyPayment,
      totalAmount,
      totalInterest,
      tae
    };
  };

  const handleCreateLoan = () => {
    const errors = [];
    
    if (!newLoanData.bank.trim()) errors.push('Banco es obligatorio');
    if (!newLoanData.principal || parseFloat(newLoanData.principal) <= 0) errors.push('Principal debe ser > 0');
    if (!newLoanData.term || parseInt(newLoanData.term) <= 0) errors.push('Plazo debe ser > 0');
    if (!newLoanData.interestRate || parseFloat(newLoanData.interestRate) <= 0) errors.push('Tipo de interés debe ser > 0');
    
    if (errors.length > 0) {
      if (window.showToast) {
        window.showToast(errors[0], 'error');
      }
      return;
    }
    
    const principal = parseFloat(newLoanData.principal);
    const termMonths = parseInt(newLoanData.term);
    const interestRate = parseFloat(newLoanData.interestRate);
    
    const calculation = calculateFrenchAmortization(principal, interestRate, termMonths);
    
    const totalCosts = (parseFloat(newLoanData.openingFee) || 0) +
                      (parseFloat(newLoanData.appraisalFee) || 0) +
                      (parseFloat(newLoanData.managementFee) || 0) +
                      (parseFloat(newLoanData.brokerFee) || 0);
    
    const newLoan = {
      id: Date.now(),
      bank: newLoanData.bank.trim(),
      product: newLoanData.product.trim() || 'Hipoteca estándar',
      type: newLoanData.type,
      propertyId: newLoanData.propertyId || null,
      originalPrincipal: principal,
      pendingCapital: principal,
      termMonths: termMonths,
      remainingMonths: termMonths,
      interestType: newLoanData.interestType,
      interestRate: interestRate,
      monthlyPayment: calculation.monthlyPayment,
      totalAmount: calculation.totalAmount,
      totalInterest: calculation.totalInterest,
      tae: calculation.tae,
      costs: {
        opening: parseFloat(newLoanData.openingFee) || 0,
        appraisal: parseFloat(newLoanData.appraisalFee) || 0,
        management: parseFloat(newLoanData.managementFee) || 0,
        broker: parseFloat(newLoanData.brokerFee) || 0,
        total: totalCosts
      },
      nextRevision: newLoanData.interestType === 'variable' ? 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      createdAt: new Date().toISOString()
    };
    
    store.updateState(state => ({
      ...state,
      loans: [...(state.loans || []), newLoan]
    }));
    
    if (window.showToast) {
      window.showToast(`Préstamo de ${newLoanData.bank} creado correctamente`, 'success');
    }
    
    setShowNewLoanModal(false);
    setNewLoanData({
      bank: '',
      product: '',
      type: 'hipoteca',
      principal: '',
      term: '',
      interestType: 'variable',
      interestRate: '',
      openingFee: '',
      appraisalFee: '',
      managementFee: '',
      brokerFee: '',
      propertyId: ''
    });
  };

  const handleAmortize = (loan) => {
    setSelectedLoan(loan);
    setAmortizeAmount('');
    setShowAmortizeModal(true);
  };

  const getPropertyName = (propertyId) => {
    const property = (properties || []).find(p => p.id === propertyId);
    return property ? property.name : 'Sin asignar';
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const getReviewStatus = (reviewDate) => {
    if (!reviewDate) return null;
    
    const today = new Date();
    const review = new Date(reviewDate);
    const daysUntil = Math.ceil((review - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { status: 'overdue', chip: 'error', text: 'Vencido' };
    } else if (daysUntil <= 30) {
      return { status: 'warning', chip: 'warning', text: `${daysUntil} días` };
    } else {
      return { status: 'ok', chip: 'success', text: `${daysUntil} días` };
    }
  };

  const handleLoadDemoData = () => {
    store.resetDemo();
    showToast('Datos demo cargados correctamente', 'success');
  };

  const handleLinkToProperty = () => {
    showToast('Funcionalidad de vinculación próximamente', 'info');
  };

  const handleEditLoan = (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      showToast(`Editando préstamo ${loan.bank}`, 'info');
      // TODO: Open edit modal
    }
  };

  const handleDeleteLoan = (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan && confirm(`¿Eliminar préstamo de ${loan.bank}?`)) {
      store.updateState(state => ({
        ...state,
        loans: state.loans.filter(l => l.id !== loanId)
      }));
      showToast('Préstamo eliminado correctamente', 'success');
    }
  };

  const calculateAmortizationSavings = (loan, amount) => {
    if (!loan || !amount || amount <= 0) return null;
    
    const currentCapital = loan.pendingCapital || 0;
    const monthlyRate = (loan.interestRate || 0) / 100 / 12;
    const remainingMonths = loan.remainingMonths || 0;
    
    if (remainingMonths <= 0 || monthlyRate <= 0) return null;
    
    // Current total interest
    const currentTotalInterest = (loan.monthlyPayment * remainingMonths) - currentCapital;
    
    // After amortization
    const newCapital = Math.max(0, currentCapital - amount);
    if (newCapital === 0) {
      return {
        newCapital: 0,
        newMonthlyPayment: 0,
        newRemainingMonths: 0,
        totalSavings: currentTotalInterest,
        monthlySavings: loan.monthlyPayment
      };
    }
    
    // Recalculate payment for same term
    const newMonthlyPayment = (newCapital * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
                              (Math.pow(1 + monthlyRate, remainingMonths) - 1);
    
    const newTotalInterest = (newMonthlyPayment * remainingMonths) - newCapital;
    const totalSavings = currentTotalInterest - newTotalInterest;
    const monthlySavings = loan.monthlyPayment - newMonthlyPayment;
    
    return {
      newCapital,
      newMonthlyPayment,
      newRemainingMonths: remainingMonths,
      totalSavings,
      monthlySavings
    };
  };

  // Sort loans to show overdue reviews first  
  const sortedLoans = [...(loans || [])].sort((a, b) => {
    const aOverdue = isOverdue(a.nextRevision);
    const bOverdue = isOverdue(b.nextRevision);
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return 0;
  });

  const executeAmortization = () => {
    if (!selectedLoan || !amortizeAmount) return;
    
    const amount = parseFloat(amortizeAmount);
    if (amount <= 0 || amount > selectedLoan.pendingCapital) {
      if (window.showToast) {
        window.showToast('Cantidad inválida para amortización', 'error');
      }
      return;
    }
    
    // Update loan in store
    store.amortizeLoan(selectedLoan.id, amount);
    
    if (window.showToast) {
      window.showToast(`Amortización de ${formatCurrency(amount)} aplicada`, 'success');
    }
    
    setShowAmortizeModal(false);
    setSelectedLoan(null);
    setAmortizeAmount('');
  };

  const currentAmortizationSavings = selectedLoan && amortizeAmount ? 
    calculateAmortizationSavings(selectedLoan, parseFloat(amortizeAmount) || 0) : null;

  // Calculate KPIs with safety checks
  const totalLoans = (loans || []).length;
  const totalDebt = (loans || []).reduce((sum, loan) => sum + (loan.pendingCapital || 0), 0);
  const totalMonthlyPayment = (loans || []).reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0);

  const alertCount = storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  return (<>
    <Header 
      currentTab="inmuebles" 
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
      showInmueblesSubTabs={true}
      currentInmueblesTab="prestamos"
    />

    <main className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{margin: 0}}>Préstamos</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewLoanModal(true)}
            >
              + Nuevo préstamo
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
              onClick={handleLinkToProperty}
            >
              🔗 Vincular a inmueble
            </button>
          </div>

          {(loans || []).length > 0 ? (
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
                {sortedLoans.map(loan => {
                  const reviewStatus = getReviewStatus(loan.nextRevision);
                  return (
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
                        {formatCurrency(loan.pendingCapital || 0)}
                      </td>
                      <td>
                        <span className={`chip ${loan.interestType === 'fijo' ? 'success' : 'warning'}`}>
                          {loan.interestType === 'fijo' ? 'Fijo' : 'Variable'}
                        </span>
                        <div className="text-sm text-gray">{loan.interestRate || 0}%</div>
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(loan.monthlyPayment || 0)}
                      </td>
                      <td className="text-right">
                        {loan.remainingMonths || '—'}
                      </td>
                      <td>
                        {loan.nextRevision ? (
                          <div>
                            <div className="text-sm">{new Date(loan.nextRevision).toLocaleDateString('es-ES')}</div>
                            {reviewStatus && (
                              <span className={`chip ${reviewStatus.chip}`}>
                                {reviewStatus.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray">—</span>
                        )}
                      </td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAmortize(loan)}
                          title="Calcular amortización con ahorro inmediato"
                        >
                          💰 Amortizar
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditLoan(loan.id)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn-error btn-sm"
                          onClick={() => handleDeleteLoan(loan.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{textAlign: 'center', padding: '64px 32px'}}>
              <div style={{fontSize: '64px', marginBottom: '16px', opacity: 0.3}}>🏦</div>
              <h3 style={{margin: '0 0 8px 0'}}>No hay préstamos registrados</h3>
              <p style={{margin: '0 0 24px 0', color: 'var(--text-2)'}}>Añade tu primer préstamo para comenzar a gestionar tu financiación inmobiliaria.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewLoanModal(true)}
              >
                + Crear primer préstamo
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(loans || []).length > 0 && (
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
    </main>

    {/* Amortization Modal */}
    {showAmortizeModal && selectedLoan && (
      <div className="modal-overlay" onClick={() => setShowAmortizeModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0, color: 'var(--navy)'}}>
              Amortizar préstamo - {selectedLoan.bank}
            </h3>
            <button
              onClick={() => setShowAmortizeModal(false)}
              className="btn-close"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray mb-2">Capital pendiente actual</div>
            <div className="font-semibold text-lg" style={{color: 'var(--error)'}}>
              {formatCurrency(selectedLoan.pendingCapital)}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium">Cantidad a amortizar</label>
            <input
              type="number"
              className="input"
              style={{width: '100%', marginTop: '4px'}}
              placeholder="Ej: 10000"
              value={amortizeAmount}
              onChange={(e) => setAmortizeAmount(e.target.value)}
              max={selectedLoan.pendingCapital}
            />
          </div>

          {currentAmortizationSavings && (
            <div className="card mb-4" style={{background: '#F0FDF4', border: '1px solid var(--success)'}}>
              <h4 style={{margin: '0 0 12px 0', color: 'var(--success)'}}>
                💰 Ahorro calculado
              </h4>
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <div className="text-sm text-gray">Nuevo capital pendiente</div>
                  <div className="font-semibold">{formatCurrency(currentAmortizationSavings.newCapital)}</div>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm text-gray">Nueva cuota mensual</div>
                  <div className="font-semibold">{formatCurrency(currentAmortizationSavings.newMonthlyPayment)}</div>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm text-gray">Ahorro mensual</div>
                  <div className="font-semibold" style={{color: 'var(--success)'}}>
                    {formatCurrency(currentAmortizationSavings.monthlySavings)}
                  </div>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm text-gray">Ahorro total en intereses</div>
                  <div className="font-bold text-lg" style={{color: 'var(--success)'}}>
                    {formatCurrency(currentAmortizationSavings.totalSavings)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAmortizeModal(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={executeAmortization}
              className="btn btn-primary"
              disabled={!amortizeAmount || parseFloat(amortizeAmount) <= 0}
            >
              ✅ Aplicar amortización
            </button>
          </div>
        </div>
      </div>
    )}

    {/* New Loan Modal */}
    {showNewLoanModal && (
      <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowNewLoanModal(false)}>
        <div className="modal" style={{maxWidth: '700px', maxHeight: '90vh', overflow: 'auto'}} onMouseDown={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0}}>Nuevo préstamo</h3>
            <button className="btn-close" onClick={() => setShowNewLoanModal(false)}>×</button>
          </div>
          
          <div className="mb-6">
            <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Datos básicos</h4>
            
            <div className="grid-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Banco *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newLoanData.bank}
                  onChange={(e) => setNewLoanData(prev => ({...prev, bank: e.target.value}))}
                  placeholder="Ej: Banco Santander"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Producto</label>
                <input
                  type="text"
                  className="form-control"
                  value={newLoanData.product}
                  onChange={(e) => setNewLoanData(prev => ({...prev, product: e.target.value}))}
                  placeholder="Ej: Hipoteca Joven"
                />
              </div>
            </div>

            <div className="grid-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Tipo *</label>
                <select
                  className="form-control"
                  value={newLoanData.type}
                  onChange={(e) => setNewLoanData(prev => ({...prev, type: e.target.value}))}
                >
                  <option value="hipoteca">Hipoteca</option>
                  <option value="personal">Préstamo personal</option>
                  <option value="credito">Línea de crédito</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Inmueble vinculado</label>
                <select
                  className="form-control"
                  value={newLoanData.propertyId}
                  onChange={(e) => setNewLoanData(prev => ({...prev, propertyId: e.target.value}))}
                >
                  <option value="">Sin vincular</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.address || property.alias}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Principal *</label>
                <input
                  type="number"
                  className="form-control"
                  value={newLoanData.principal}
                  onChange={(e) => setNewLoanData(prev => ({...prev, principal: e.target.value}))}
                  placeholder="200000"
                  min="0"
                  step="100"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Plazo (meses) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={newLoanData.term}
                  onChange={(e) => setNewLoanData(prev => ({...prev, term: e.target.value}))}
                  placeholder="300"
                  min="1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Tipo interés *</label>
                <select
                  className="form-control"
                  value={newLoanData.interestType}
                  onChange={(e) => setNewLoanData(prev => ({...prev, interestType: e.target.value}))}
                >
                  <option value="variable">Variable</option>
                  <option value="fijo">Fijo</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Tipo de interés (%) *</label>
              <input
                type="number"
                className="form-control"
                value={newLoanData.interestRate}
                onChange={(e) => setNewLoanData(prev => ({...prev, interestRate: e.target.value}))}
                placeholder="3.5"
                min="0"
                step="0.01"
                style={{width: '200px'}}
              />
            </div>
          </div>

          <div className="mb-6">
            <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Costes iniciales</h4>
            
            <div className="grid-2 gap-4">
              <div>
                <label className="text-sm font-medium">Apertura</label>
                <input
                  type="number"
                  className="form-control"
                  value={newLoanData.openingFee}
                  onChange={(e) => setNewLoanData(prev => ({...prev, openingFee: e.target.value}))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Tasación</label>
                <input
                  type="number"
                  className="form-control"
                  value={newLoanData.appraisalFee}
                  onChange={(e) => setNewLoanData(prev => ({...prev, appraisalFee: e.target.value}))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Gestoría</label>
                <input
                  type="number"
                  className="form-control"
                  value={newLoanData.managementFee}
                  onChange={(e) => setNewLoanData(prev => ({...prev, managementFee: e.target.value}))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bróker</label>
                <input
                  type="number"
                  className="form-control"
                  value={newLoanData.brokerFee}
                  onChange={(e) => setNewLoanData(prev => ({...prev, brokerFee: e.target.value}))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Calculation Preview */}
          {newLoanData.principal && newLoanData.term && newLoanData.interestRate && (
            <div className="mb-6">
              <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Cuadro francés y TAE</h4>
              {(() => {
                const calculation = calculateFrenchAmortization(
                  parseFloat(newLoanData.principal), 
                  parseFloat(newLoanData.interestRate), 
                  parseInt(newLoanData.term)
                );
                
                if (!calculation) return null;
                
                return (
                  <div className="card" style={{background: '#F0F9FF', border: '1px solid #0EA5E9'}}>
                    <div className="grid-2 gap-4">
                      <div>
                        <div className="text-sm text-gray">Cuota mensual</div>
                        <div className="font-bold text-lg" style={{color: 'var(--accent)'}}>
                          {formatCurrency(calculation.monthlyPayment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray">TAE</div>
                        <div className="font-bold text-lg" style={{color: 'var(--warning)'}}>
                          {calculation.tae.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray">Total a pagar</div>
                        <div className="font-semibold">{formatCurrency(calculation.totalAmount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray">Total intereses</div>
                        <div className="font-semibold" style={{color: 'var(--error)'}}>
                          {formatCurrency(calculation.totalInterest)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowNewLoanModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCreateLoan}
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
}