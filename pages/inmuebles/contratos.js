import { useState, useEffect } from 'react';
import store from '../../store/index';
import { mockData } from '../../data/mockData';
import Header from '../../components/Header';
import ContractWizard from '../../components/ContractWizard';
import ContractDetailModal from '../../components/ContractDetailModal';

export default function ContratosPage() {
  const [storeState, setStoreState] = useState(() => {
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

  const [showContractWizard, setShowContractWizard] = useState(false);
  const [showContractDetail, setShowContractDetail] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
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
      return '—';
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

  const getProperty = (propertyId) => {
    return properties.find(p => p.id === propertyId);
  };

  // Handle contract operations
  const handleCreateContract = () => {
    setEditingContract(null);
    setShowContractWizard(true);
  };

  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setShowContractWizard(true);
  };

  const handleDeleteContract = (contractId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contrato?')) {
      store.deleteContract(contractId);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Contrato eliminado correctamente', 'success');
      }
    }
  };

  const handleSaveContract = (contractData) => {
    if (editingContract) {
      store.updateContract(contractData);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Contrato actualizado correctamente', 'success');
      }
    } else {
      store.addContract(contractData);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Contrato creado correctamente', 'success');
      }
    }
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowContractDetail(true);
  };

  const handleDemoReset = () => {
    store.loadDemoData();
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('Datos demo cargados', 'success');
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const typeMatch = filters.type === 'all' || 
      (filters.type === 'alquiler' && (contract.type === 'Alquiler' || contract.type === 'Alquiler Habitación' || contract.tipo === 'Vivienda_completa' || contract.tipo === 'Habitacion')) ||
      (filters.type === 'seguro' && contract.type === 'Seguro Hogar');
    
    const statusMatch = filters.status === 'all' || contract.status === filters.status;
    
    return typeMatch && statusMatch;
  });

  // Calculate KPIs
  const totalContracts = filteredContracts.length;
  const activeContracts = filteredContracts.filter(c => c.status === 'Activo').length;
  const totalMonthlyIncome = filteredContracts
    .filter(c => (c.type === 'Alquiler' || c.type === 'Alquiler Habitación' || c.tipo === 'Vivienda_completa' || c.tipo === 'Habitacion') && c.status === 'Activo')
    .reduce((sum, contract) => sum + (contract.monthlyAmount || contract.renta?.importe_base_mes || 0), 0);

  const alertCount = storeState?.alerts?.filter(alert => !alert.dismissed && (alert.severity === 'critical' || alert.severity === 'high')).length || 0;

  // Sub-tabs for navigation
  const subTabs = [
    { key: 'cartera', label: 'Cartera', icon: '🏠' },
    { key: 'contratos', label: 'Contratos', icon: '📋' },
    { key: 'prestamos', label: 'Préstamos', icon: '🏦' },
    { key: 'gastos', label: 'Gastos', icon: '📄' },
    { key: 'analisis', label: 'Análisis', icon: '📊' }
  ];

  const handleSubTabChange = (tabKey) => {
    switch (tabKey) {
      case 'cartera':
        window.location.href = '/inmuebles';
        break;
      case 'contratos':
        // Already here
        break;
      case 'prestamos':
        window.location.href = '/inmuebles/prestamos';
        break;
      case 'gastos':
        window.location.href = '/inmuebles/gastos';
        break;
      case 'analisis':
        window.location.href = '/inmuebles/analisis';
        break;
    }
  };

  return (<>
    <Header 
      currentTab="inmuebles"
      alertCount={alertCount}
      onDemoReset={() => store.resetDemo()}
      showInmueblesSubTabs={true}
      currentInmueblesTab="contratos"
    />

    <main className="main">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{margin: 0}}>Contratos de Alquiler</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={handleCreateContract}
            >
              + Nuevo contrato
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray">Total contratos</div>
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--accent)'}}>
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
                <div className="font-semibold" style={{fontSize: '24px', color: 'var(--accent)', textAlign: 'right'}}>
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
              <select 
                className="form-control" 
                style={{width: 'auto', marginBottom: 0}}
                value={filters.type}
                onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
              >
                <option value="all">Todos los tipos</option>
                <option value="alquiler">Alquiler</option>
                <option value="seguro">Seguro</option>
              </select>
              <select 
                className="form-control" 
                style={{width: 'auto', marginBottom: 0}}
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
              >
                <option value="all">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Vencido">Vencido</option>
                <option value="Próximo vencimiento">Próximo vencimiento</option>
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
                {filteredContracts.map(contract => {
                  const property = getProperty(contract.propertyId || contract.inmuebleId);
                  const displayType = contract.tipo === 'Habitacion' ? 'Alquiler Habitación' : 
                                    contract.tipo === 'Vivienda_completa' ? 'Alquiler' :
                                    contract.type;
                  const tenantName = contract.arrendatarios?.[0]?.nombre || contract.tenant || contract.company;
                  
                  return (
                    <tr key={contract.id}>
                      <td>
                        <div className="font-semibold">{property?.address || 'Sin asignar'}</div>
                        <div className="text-sm text-gray">
                          {property?.city || ''}
                          {contract.unidadId && ` • ${contract.unidadId}`}
                        </div>
                      </td>
                      <td>
                        <span className="chip secondary">{displayType}</span>
                      </td>
                      <td>{tenantName}</td>
                      <td>{contract.fechas?.fecha_inicio || contract.startDate}</td>
                      <td>{contract.fechas?.fecha_fin_prevista || contract.endDate || '—'}</td>
                      <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                        {formatCurrency(contract.renta?.importe_base_mes || contract.monthlyAmount)}
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
                            onClick={() => handleViewContract(contract)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEditContract(contract)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteContract(contract.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredContracts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray mb-4">No hay contratos registrados</div>
              <button 
                className="btn btn-primary"
                onClick={handleCreateContract}
              >
                + Crear primer contrato
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
          
          {filteredContracts
            .filter(c => c.status === 'Próximo vencimiento')
            .slice(0, 3)
            .map(contract => {
              const property = getProperty(contract.propertyId || contract.inmuebleId);
              return (
                <div key={contract.id} className="flex items-center justify-between p-3 mb-2" style={{background: '#FEF3C7', borderRadius: '8px'}}>
                  <div>
                    <div className="font-semibold">{contract.type} - {property?.address}</div>
                    <div className="text-sm text-gray">Vence: {contract.fechas?.fecha_fin_prevista || contract.endDate}</div>
                  </div>
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.showToast) {
                        window.showToast('Función de renovación próximamente disponible', 'info');
                      }
                    }}
                  >
                    🔄 Renovar
                  </button>
                </div>
              );
            })}
          
          {filteredContracts.filter(c => c.status === 'Próximo vencimiento').length === 0 && (
            <div className="text-sm text-gray">No hay contratos próximos a vencer</div>
          )}
        </div>
      </div>
    </main>

    {/* Modals */}
    {showContractWizard && (
      <ContractWizard
        isOpen={showContractWizard}
        onClose={() => setShowContractWizard(false)}
        onSave={handleSaveContract}
        properties={properties}
        editingContract={editingContract}
      />
    )}

    {showContractDetail && selectedContract && (
      <ContractDetailModal
        isOpen={showContractDetail}
        onClose={() => setShowContractDetail(false)}
        contract={selectedContract}
        property={getProperty(selectedContract.propertyId || selectedContract.inmuebleId)}
        onEdit={handleEditContract}
        onDelete={handleDeleteContract}
      />
    )}
  </>);
}