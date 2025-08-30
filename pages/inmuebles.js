import { useState } from 'react';
import { mockData, getTotalPortfolioValue, getTotalMonthlyRent, getPortfolioRentability, getOccupancyRate } from '../data/mockData';

export default function Page() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterYear, setFilterYear] = useState('2024');
  const [filterMonth, setFilterMonth] = useState('all');

  const { properties, contracts, loans } = mockData;

  const formatCurrency = (amount) => {
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getContractsByProperty = (propertyId) => {
    return contracts.filter(c => c.propertyId === propertyId);
  };

  const getLoansByProperty = (propertyId) => {
    return loans.filter(l => l.propertyId === propertyId);
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

      {/* Sub-navigation */}
      <div className="flex gap-4 mb-6">
        <a href="/inmuebles" className="tab active">Cartera</a>
        <a href="/inmuebles/contratos" className="tab">Contratos</a>
        <a href="/inmuebles/prestamos" className="tab">Préstamos</a>
        <a href="/inmuebles/analisis" className="tab">Análisis</a>
      </div>

      {/* Portfolio KPIs */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>KPIs Cartera</h3>
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
      </div>

      {/* Properties Portfolio */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Cartera de Inmuebles</h3>
        
        {viewMode === 'grid' ? (
          <div className="grid gap-4">
            {properties.map(property => (
              <div key={property.id} className="card" style={{background: '#F9FAFB'}}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{property.address}</div>
                    <div className="text-sm text-gray">{property.city} · {property.type}</div>
                  </div>
                  <span className={`chip ${property.status === 'Ocupado' ? 'success' : 'warning'}`}>
                    {property.status}
                  </span>
                </div>
                
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

                {property.tenant && (
                  <div className="mb-3">
                    <div className="text-sm text-gray">Inquilino</div>
                    <div className="font-semibold">{property.tenant}</div>
                  </div>
                )}

                <button 
                  className="btn btn-secondary btn-sm"
                  data-action="property:view-detail"
                  data-id={property.id}
                >
                  Ver detalle
                </button>
              </div>
            ))}
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
                {properties.map(property => (
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
                      <span className={`chip ${property.status === 'Ocupado' ? 'success' : 'warning'}`}>
                        {property.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedProperty(property)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contracts Table */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Contratos</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Inmueble</th>
                <th>Tipo</th>
                <th>Inquilino/Aseguradora</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th style={{textAlign: 'right'}}>Importe</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => {
                const property = properties.find(p => p.id === contract.propertyId);
                return (
                  <tr key={contract.id}>
                    <td>
                      <div className="font-semibold">{property?.address}</div>
                      <div className="text-sm text-gray">{property?.city}</div>
                    </td>
                    <td>{contract.type}</td>
                    <td>{contract.tenant || contract.company}</td>
                    <td>{contract.startDate}</td>
                    <td>{contract.endDate}</td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      {formatCurrency(contract.monthlyAmount)}
                    </td>
                    <td>
                      <span className={`chip ${contract.status === 'Activo' ? 'success' : 'warning'}`}>
                        {contract.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loans/Mortgages */}
      <div className="card mb-4">
        <h3 style={{margin: '0 0 16px 0'}}>Préstamos</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Inmueble</th>
                <th>Banco</th>
                <th style={{textAlign: 'right'}}>Saldo Pendiente</th>
                <th style={{textAlign: 'right'}}>Cuota Mensual</th>
                <th style={{textAlign: 'right'}}>Tipo Interés</th>
                <th>Meses Restantes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => {
                const property = properties.find(p => p.id === loan.propertyId);
                return (
                  <tr key={loan.id}>
                    <td>
                      <div className="font-semibold">{property?.address}</div>
                      <div className="text-sm text-gray">{property?.city}</div>
                    </td>
                    <td>{loan.bank}</td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      {formatCurrency(loan.currentBalance)}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      {formatCurrency(loan.monthlyPayment)}
                    </td>
                    <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                      {loan.interestRate}%
                    </td>
                    <td>{loan.remainingMonths} meses</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowAmortizationModal(true);
                        }}
                      >
                        Amortizar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
    </main>
  </>);
}
