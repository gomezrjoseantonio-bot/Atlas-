import { useState, useEffect } from 'react';
import store from '../store/index';
import { getTotalPortfolioValue, getTotalMonthlyRent, getPortfolioRentability, getOccupancyRate } from '../data/mockData';
import NewPropertyWizard from '../components/NewPropertyWizard';
import PropertyDetailModal from '../components/PropertyDetailModal';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { HomeIcon } from '../components/icons';
import { showToast } from '../components/ToastSystem';

export default function Page() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterYear, setFilterYear] = useState('2024');
  const [filterMonth, setFilterMonth] = useState('all');
  const [showNewPropertyWizard, setShowNewPropertyWizard] = useState(false);
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state immediately - don't automatically reset to demo
    let currentState = store.getState();
    return currentState;
  });

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    
    // Simulate loading delay for demo
    setTimeout(() => setIsLoading(false), 800);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const { properties, loans } = storeState;
  // Get contracts from mockData for now since they're not in store
  const contracts = [];

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '—';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getContractsByProperty = (propertyId) => {
    return contracts.filter(c => c.propertyId === propertyId);
  };

  const handleToggleMultiUnit = (propertyId) => {
    store.updateState(state => ({
      ...state,
      properties: state.properties.map(p => 
        p.id === propertyId 
          ? { ...p, multiUnit: !p.multiUnit }
          : p
      )
    }));
    showToast('Configuración multi-unidad actualizada', 'success');
  };

  const handleManageUnits = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      showToast(`Gestión de unidades para ${property.address}`, 'info');
      // TODO: Open units management modal
    }
  };

  const handleToggleStatus = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      const newStatus = property.status === 'Ocupado' ? 'Libre' : 'Ocupado';
      store.updateState(state => ({
        ...state,
        properties: state.properties.map(p => 
          p.id === propertyId 
            ? { ...p, status: newStatus }
            : p
        )
      }));
      showToast(`Estado cambiado a ${newStatus}`, 'success');
    }
  };

  const handleAddExpense = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      window.location.href = `/inmuebles/gastos?property=${propertyId}`;
    }
  };

  const alertCount = storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  return (<>
    <Header 
      currentTab="inmuebles" 
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
      showInmueblesSubTabs={true}
      currentInmueblesTab="cartera"
    />

    <main className="container">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{color:'var(--navy)', margin:0}}>Inmuebles</h2>
        <div className="flex items-center gap-3">
          <select 
            className="form-control" 
            style={{width: 'auto', marginBottom: 0}}
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <select 
            className="form-control" 
            style={{width: 'auto', marginBottom: 0}}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
          </select>
          <div className="flex items-center gap-2">
            <button 
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio KPIs */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>KPIs Cartera</h3>
        {isLoading ? (
          <div className="grid-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <LoadingSkeleton lines={1} height="14px" style={{ marginBottom: '8px' }} />
                <LoadingSkeleton lines={1} height="24px" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid-4 gap-4">
            <div>
              <div className="text-sm text-gray">Valor Total Cartera</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--navy)'}}>
                {formatCurrency(getTotalPortfolioValue())}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Ingresos Mensuales</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--success)'}}>
                {formatCurrency(getTotalMonthlyRent())}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Ocupación</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--teal)'}}>
                {getOccupancyRate().toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray">Rentabilidad</div>
              <div className="font-semibold" style={{fontSize: '20px', color: 'var(--warning)'}}>
                {getPortfolioRentability().toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Properties Portfolio */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{margin: 0}}>Cartera de Inmuebles</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewPropertyWizard(true)}
          >
            + Nuevo inmueble
          </button>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid gap-4">
            {properties.length === 0 ? (
              <div className="card text-center py-8">
                <div className="mb-4"><HomeIcon size={48} /></div>
                <h3 style={{margin: '0 0 8px 0'}}>No tienes inmuebles registrados</h3>
                <p className="text-gray mb-4">Crea tu primer inmueble para empezar a gestionar tu cartera</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewPropertyWizard(true)}
                >
                  + Crear primer inmueble
                </button>
              </div>
            ) : (
              properties.map(property => (
              <div key={property.id} className="card" style={{background: '#F9FAFB'}}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{property.address}</div>
                    <div className="text-sm text-gray">{property.city} · {property.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`chip ${property.status === 'Ocupado' || property.status === 'Parcialmente ocupado' ? 'success' : 'warning'}`}>
                      {property.status}
                    </span>
                  </div>
                </div>

                {/* H9A: New property features chips */}
                <div className="flex items-center gap-2 mb-3">
                  {property.estructura_definida && (
                    <span className="chip success" style={{fontSize: '11px'}}>
                      Estructura creada ({property.numRooms || property.totalUnits} hab.)
                    </span>
                  )}
                  {property.acquisitionCosts ? (
                    <span className="chip success" style={{fontSize: '11px'}}>
                      Coste adquisición registrado
                    </span>
                  ) : (
                    <span className="chip warning" style={{fontSize: '11px'}}>
                      Coste pendiente
                    </span>
                  )}
                </div>

                {/* HITO 7: Multi-unit switch */}
                <div className="flex items-center justify-between mb-3 p-2" style={{background: '#fff', borderRadius: '6px', border: '1px solid #E5E7EB'}}>
                  <div>
                    <div className="text-sm font-semibold">Multi-unidad</div>
                    <div className="text-xs text-gray">Gestionar por habitaciones</div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={property.multiUnit || false}
                      onChange={() => handleToggleMultiUnit(property.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Show units info if multi-unit is enabled */}
                {property.multiUnit && property.units && (
                  <div className="mb-3 p-2" style={{background: '#F0F9FF', borderRadius: '6px'}}>
                    <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <HomeIcon size={16} />
                      Unidades ({property.occupiedUnits || 0}/{property.totalUnits || property.units.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {property.units.map(unit => (
                        <span 
                          key={unit.id} 
                          className={`chip btn-sm ${unit.status === 'Ocupada' ? 'success' : 'warning'}`}
                          style={{fontSize: '11px', padding: '2px 6px'}}
                        >
                          {unit.name}
                        </span>
                      ))}
                    </div>
                    <button 
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => handleManageUnits(property.id)}
                      style={{fontSize: '11px', padding: '4px 8px'}}
                    >
                      Gestionar unidades
                    </button>
                  </div>
                )}
                
                <div className="grid-3 gap-3 mb-3">
                  <div>
                    <div className="text-sm text-gray">Renta Mensual</div>
                    <div className="font-semibold">{formatCurrency(property.monthlyRent)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray">Gastos</div>
                    <div className="font-semibold" style={{color: 'var(--error)'}}>
                      {formatCurrency(property.monthlyExpenses)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray">Rentabilidad</div>
                    <div className="font-semibold" style={{color: 'var(--success)'}}>
                      {property.rentability}%
                    </div>
                  </div>
                </div>

                {property.tenant && !property.multiUnit && (
                  <div className="mb-3">
                    <div className="text-sm text-gray">Inquilino</div>
                    <div className="font-semibold">{property.tenant}</div>
                  </div>
                )}

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedPropertyDetail(property)}
                >
                  Ver detalle
                </button>
              </div>
            )))}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Dirección</th>
                  <th>Tipo</th>
                  <th style={{textAlign: 'right'}}>Renta Mensual</th>
                  <th style={{textAlign: 'right'}}>Gastos</th>
                  <th style={{textAlign: 'right'}}>Beneficio Neto</th>
                  <th style={{textAlign: 'right'}}>Rentabilidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="mb-4"><HomeIcon size={48} /></div>
                      <h3 style={{margin: '0 0 8px 0'}}>No tienes inmuebles registrados</h3>
                      <p className="text-gray mb-4">Crea tu primer inmueble para empezar a gestionar tu cartera</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowNewPropertyWizard(true)}
                      >
                        + Crear primer inmueble
                      </button>
                    </td>
                  </tr>
                ) : (
                  properties.map(property => (
                  <tr key={property.id}>
                    <td>
                      <div className="font-semibold">{property.address}</div>
                      <div className="text-sm text-gray">{property.city}</div>
                    </td>
                    <td>{property.type}</td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      {formatCurrency(property.monthlyRent)}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold', color: 'var(--error)'}}>
                      {formatCurrency(property.monthlyExpenses)}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold', color: 'var(--success)'}}>
                      {formatCurrency(property.netProfit)}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      {property.rentability}%
                    </td>
                    <td>
                      <button 
                        className={`chip ${property.status === 'Ocupado' ? 'success' : 'warning'}`}
                        onClick={() => handleToggleStatus(property.id)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        {property.status}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedPropertyDetail(property)}
                        >
                          Ver detalle
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddExpense(property.id)}
                        >
                          Añadir gasto
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* Amortization Modal */}
      {showAmortizationModal && selectedLoan && (
        <div className="modal-overlay" onClick={() => setShowAmortizationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Amortizar préstamo</h3>
              <button 
                className="btn-close"
                onClick={() => setShowAmortizationModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray mb-2">Préstamo</div>
              <div className="font-semibold">{selectedLoan.bank}</div>
              <div className="text-sm text-gray">
                Saldo actual: {formatCurrency(selectedLoan.currentBalance)}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Importe a amortizar</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0.00"
                step="0.01"
                max={selectedLoan.currentBalance}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Tipo de amortización</label>
              <select className="form-control">
                <option value="cuota">Reducir cuota mensual</option>
                <option value="plazo">Reducir plazo</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowAmortizationModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // Mock amortization calculation
                  alert('Amortización simulada calculada');
                  setShowAmortizationModal(false);
                }}
              >
                Calcular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Análisis por Activo</h3>
              <button 
                className="btn-close"
                onClick={() => setSelectedProperty(null)}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="font-semibold" style={{fontSize: '18px'}}>{selectedProperty.address}</div>
              <div className="text-sm text-gray">{selectedProperty.city} · {selectedProperty.type}</div>
            </div>

            <div className="grid-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray">Valor de compra</div>
                <div className="font-semibold">{formatCurrency(selectedProperty.purchasePrice)}</div>
              </div>
              <div>
                <div className="text-sm text-gray">Valor actual</div>
                <div className="font-semibold">{formatCurrency(selectedProperty.currentValue)}</div>
              </div>
              <div>
                <div className="text-sm text-gray">Renta mensual</div>
                <div className="font-semibold">{formatCurrency(selectedProperty.monthlyRent)}</div>
              </div>
              <div>
                <div className="text-sm text-gray">Gastos mensuales</div>
                <div className="font-semibold">{formatCurrency(selectedProperty.monthlyExpenses)}</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 style={{margin: '0 0 12px 0'}}>P&L Mensual (Últimos 12 meses)</h4>
              <div className="text-sm text-gray">
                Ingresos: {formatCurrency(selectedProperty.monthlyRent * 12)}<br/>
                Gastos: {formatCurrency(selectedProperty.monthlyExpenses * 12)}<br/>
                <strong>Beneficio neto: {formatCurrency((selectedProperty.monthlyRent - selectedProperty.monthlyExpenses) * 12)}</strong>
              </div>
            </div>

            <div className="mb-4">
              <h4 style={{margin: '0 0 12px 0'}}>Forecast 12-24 meses</h4>
              <div className="text-sm text-gray">
                Proyección conservadora basada en datos históricos y tendencias del mercado.
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

      {/* New Property Wizard */}
      {showNewPropertyWizard && (
        <NewPropertyWizard 
          onClose={() => setShowNewPropertyWizard(false)}
          onSuccess={(newProperty) => {
            setShowNewPropertyWizard(false);
            // Property will be automatically added to store by the wizard
            // TODO: Optionally show success message
          }}
        />
      )}

      {/* Property Detail Modal - H9A */}
      {selectedPropertyDetail && (
        <PropertyDetailModal 
          property={selectedPropertyDetail}
          onClose={() => setSelectedPropertyDetail(null)}
        />
      )}
    </main>
  </>);
}
