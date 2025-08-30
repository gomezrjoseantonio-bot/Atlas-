import { useState, useEffect } from 'react';
import store from '../../store/index';
import { mockData } from '../../data/mockData';

export default function ContratosPage() {
  const [storeState, setStoreState] = useState(() => {
    // More defensive initialization for deployment environments
    try {
      console.log('Contratos: Starting initialization');
    return store.getState();
    } catch (error) {
      console.error('Contratos: Error during initialization, using fallback data', error);
      return {
        accounts: mockData.accounts || [],
        properties: mockData.properties || [],
        contracts: mockData.contracts || [],
        documents: mockData.documents || []
      };
    }
  });

  // Subscribe to store changes with error handling
  useEffect(() => {
    try {
      console.log('Contratos: Setting up store subscription');
      const unsubscribe = store.subscribe((newState) => {
        console.log('Contratos: Store updated', newState);
        setStoreState(newState);
      });
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Contratos: Error setting up store subscription', error);
    }
  }, []);

  // Use contracts and properties from store state with fallback to mockData
  const contracts = storeState?.contracts || mockData.contracts || [];
  const properties = storeState?.properties || mockData.properties || [];

  // Safety check: if no data, render loading state
  if (!contracts && !properties) {
    console.log('Contratos: No data found, showing fallback UI');
    return (
      <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Cargando contratos...</h2>
        <p>Inicializando demo data...</p>
        <script dangerouslySetInnerHTML={{__html: `
          setTimeout(() => {
            console.log('Contratos: Fallback timeout, forcing reload');
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

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Sin asignar';
  };

  const getPropertyAddress = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.address : 'Sin asignar';
  };

  // Calculate KPIs
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'Activo').length;
  const totalMonthlyIncome = contracts
    .filter(c => c.type === 'Alquiler' && c.status === 'Activo')
    .reduce((sum, contract) => sum + contract.monthlyAmount, 0);

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
          <h1 style={{margin: 0}}>Contratos</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary"
              data-action="demo:load"
            >
              🔄 Cargar Datos Demo
            </button>
            <button 
              className="btn btn-primary"
              data-action="contract:create"
            >
              ➕ Nuevo contrato
            </button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex gap-4 mb-6">
          <a href="/inmuebles" className="tab">Cartera</a>
          <a href="/inmuebles/contratos" className="tab active">Contratos</a>
          <a href="/inmuebles/prestamos" className="tab">Préstamos</a>
          <a href="/inmuebles/analisis" className="tab">Análisis</a>
        </div>

        {/* KPIs */}
        <div className="grid-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Total contratos</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--navy)'}}>
                  {totalContracts}
                </div>
              </div>
              <div style={{fontSize: '32px', opacity: 0.2}}>📋</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Contratos activos</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--success)'}}>
                  {activeContracts}
                </div>
              </div>
              <div style={{fontSize: '32px', opacity: 0.2}}>✅</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Ingresos mensuales</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--teal)', textAlign: 'right'}}>
                  {formatCurrency(totalMonthlyIncome)}
                </div>
              </div>
              <div style={{fontSize: '32px', opacity: 0.2}}>💰</div>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: 0}}>Lista de Contratos</h3>
            <div className="flex gap-2">
              <select className="form-control" style={{width: 'auto', marginBottom: 0}}>
                <option value="all">Todos los tipos</option>
                <option value="alquiler">Alquiler</option>
                <option value="seguro">Seguro</option>
              </select>
              <select className="form-control" style={{width: 'auto', marginBottom: 0}}>
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="vencido">Vencido</option>
                <option value="proximo">Próximo vencimiento</option>
              </select>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Inmueble</th>
                  <th>Tipo</th>
                  <th>Inquilino/Aseguradora</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th style={{textAlign: 'right'}}>Importe mensual</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(contract => {
                    const property = properties.find(p => p.id === contract.propertyId);
                    return (
                      <tr key={contract.id}>
                        <td>
                          <div className="font-semibold">{property?.address || 'Sin asignar'}</div>
                          <div className="text-sm text-gray">{property?.city || ''}</div>
                        </td>
                        <td>
                          <span className="chip secondary">{contract.type}</span>
                        </td>
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
                        <td>
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-secondary btn-sm"
                              data-action="contract:edit"
                              data-id={contract.id}
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              data-action="contract:view"
                              data-id={contract.id}
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              data-action="contract:renew"
                              data-id={contract.id}
                            >
                              🔄
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          {contracts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray mb-4">No hay contratos registrados</div>
              <button 
                className="btn btn-primary"
                data-action="contract:create"
              >
                ➕ Crear primer contrato
              </button>
            </div>
          )}
        </div>

        {/* Contract Renewals Alert */}
        <div className="card mt-4">
          <h3 style={{margin: '0 0 16px 0'}}>🔔 Próximos vencimientos</h3>
          <div className="text-sm text-gray mb-4">
            Contratos que requieren atención en los próximos 60 días
          </div>
          
          {contracts
            .filter(c => c.status === 'Próximo vencimiento')
            .slice(0, 3)
            .map(contract => {
              const property = properties.find(p => p.id === contract.propertyId);
              return (
                <div key={contract.id} className="flex items-center justify-between p-3 mb-2" style={{background: '#FEF3C7', borderRadius: '8px'}}>
                  <div>
                    <div className="font-semibold">{contract.type} - {property?.address}</div>
                    <div className="text-sm text-gray">Vence: {contract.endDate}</div>
                  </div>
                  <button 
                    className="btn btn-warning btn-sm"
                    data-action="contract:renew"
                    data-id={contract.id}
                  >
                    Renovar
                  </button>
                </div>
              );
            })}
          
          {contracts.filter(c => c.status === 'Próximo vencimiento').length === 0 && (
            <div className="text-sm text-gray">No hay contratos próximos a vencer</div>
          )}
        </div>
      </div>
    </main>
  </>);
}