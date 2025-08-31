import { useState, useEffect } from 'react';
import store from '../store/index';
import { mockData } from '../data/mockData';
import Header from '../components/Header';

export default function TreasuryRulesPage() {
  const [storeState, setStoreState] = useState(() => {
    // Initialize with store state immediately
    return store.getState();
  });const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    providerContains: '',
    category: 'Suministros',
    propertyId: null,
    deductible: true
  });

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return () => {
      unsubscribe();
    };
  }, []);

  const { providerRules, sweepConfig, accounts, properties } = storeState;

  const handleAddRule = () => {
    store.addProviderRule({
      ...newRule,
      active: true
    });
    setNewRule({
      providerContains: '',
      category: 'Suministros',
      propertyId: null,
      deductible: true
    });
    setShowAddRuleModal(false);
    
    // Show toast notification
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`Regla añadida: ${newRule.providerContains} → ${newRule.category}`, 'success');
    }
  };

  const handleDeleteRule = (ruleId) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
      store.deleteProviderRule(ruleId);
      
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Regla eliminada', 'success');
      }
    }
  };

  const resetDefaultRules = () => {
    if (confirm('¿Restablecer reglas por defecto? Se perderán las reglas personalizadas.')) {
      store.setState({ 
        providerRules: [...mockData.providerRules]
      });
      
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Reglas restablecidas a valores por defecto', 'success');
      }
    }
  };

  const categories = [
    'Suministros',
    'Gastos comunidad', 
    'Seguros',
    'Mantenimiento',
    'Servicios',
    'Impuestos',
    'Otros'
  ];

  return (
    <div data-theme="atlas">
      <Header 
        currentTab="tesoreria"
        alertCount={5}
        onDemoReset={() => store.resetDemo()}
      />

      <main className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{color:'var(--navy)', margin:'0 0 8px 0'}}>Reglas & Sweeps</h2>
            <p style={{margin: '0', color: 'var(--gray)'}}>
              Configuración de automatismos para clasificación y movimientos de tesorería
            </p>
          </div>
          <a href="/tesoreria" className="btn btn-ghost">
            ← Volver a Tesorería
          </a>
        </div>

        {/* Provider Classification Rules */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{margin: '0'}}>Reglas por Proveedor</h3>
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={resetDefaultRules}
              >
                Restablecer por defecto
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddRuleModal(true)}
              >
                ➕ Añadir regla
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray mb-4">
            Las reglas se evalúan de arriba a abajo. La primera que coincida se aplicará.
          </p>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Si proveedor contiene...</th>
                  <th>Categoría</th>
                  <th>Inmueble</th>
                  <th>Deducible</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {providerRules && providerRules
                  .sort((a, b) => a.order - b.order)
                  .map(rule => (
                    <tr key={rule.id}>
                      <td>
                        <span className="font-mono" style={{background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px'}}>
                          {rule.order}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold">"{rule.providerContains}"</span>
                      </td>
                      <td>
                        <span className="chip">{rule.category}</span>
                      </td>
                      <td>
                        {rule.propertyId === 'auto' ? (
                          <span className="chip secondary">Auto-asignar</span>
                        ) : rule.propertyId ? (
                          <span className="text-sm">
                            {properties.find(p => p.id === rule.propertyId)?.address || 'Inmueble no encontrado'}
                          </span>
                        ) : (
                          <span className="text-gray">Sin asignar</span>
                        )}
                      </td>
                      <td>
                        <span className={`chip ${rule.deductible ? 'success' : 'secondary'}`}>
                          {rule.deductible ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={rule.active}
                            onChange={(e) => store.updateProviderRule(rule.id, { active: e.target.checked })}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingRule(rule)}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            style={{color: 'var(--error)'}}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {(!providerRules || providerRules.length === 0) && (
                  <tr>
                    <td colSpan="7" className="text-center text-gray py-4">
                      No hay reglas configuradas. Haz clic en "Añadir regla" para crear una.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sweep Configuration */}
        <div className="card mb-6">
          <h3 style={{margin: '0 0 16px 0'}}>Configuración de Sweeps</h3>
          
          <div className="grid-2 gap-6">
            <div>
              <label className="form-label">Cuenta Hub</label>
              <select 
                className="form-control"
                value={sweepConfig.hubAccountId || ''}
                onChange={(e) => store.updateSweepConfig({ 
                  hubAccountId: parseInt(e.target.value) 
                })}
              >
                <option value="">Seleccionar cuenta...</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.bank})
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray mt-1">
                Cuenta desde la que se sugerirán los movimientos automáticos
              </div>
            </div>

            <div>
              <label className="form-label">Ventana de emparejamiento</label>
              <select 
                className="form-control"
                value={sweepConfig.movementMatchingDays || 3}
                onChange={(e) => store.updateSweepConfig({ 
                  movementMatchingDays: parseInt(e.target.value) 
                })}
              >
                <option value={1}>±1 día</option>
                <option value={3}>±3 días</option>
                <option value={7}>±7 días</option>
              </select>
              <div className="text-sm text-gray mt-1">
                Margen para vincular movimientos con facturas automáticamente
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={sweepConfig.autoSweepEnabled || false}
                onChange={(e) => store.updateSweepConfig({ 
                  autoSweepEnabled: e.target.checked 
                })}
              />
              <span className="form-label" style={{margin: 0}}>Auto-sweep</span>
            </label>
            <div className="text-sm text-gray mt-1">
              Cuando está activado, se sugerirán movimientos automáticamente al abrir la app (sin ejecutar)
            </div>
          </div>

          {/* Account Target Balances */}
          <div className="mt-6">
            <h4 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Saldos Objetivo por Cuenta</h4>
            <div className="grid gap-3">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3" style={{background: '#F9FAFB', borderRadius: '8px'}}>
                  <div className="flex-1">
                    <div className="font-semibold">{account.name}</div>
                    <div className="text-sm text-gray">{account.bank}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray">Actual</div>
                      <div className="font-semibold">
                        €{account.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Objetivo:</label>
                      <input 
                        type="number"
                        className="form-control"
                        style={{width: '120px'}}
                        value={account.targetBalance}
                        onChange={(e) => {
                          const updatedAccounts = storeState.accounts.map(acc => 
                            acc.id === account.id 
                              ? { ...acc, targetBalance: parseFloat(e.target.value) || 0 }
                              : acc
                          );
                          store.setState({ accounts: updatedAccounts });
                        }}
                      />
                      <span className="text-sm text-gray">€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Rules Button */}
        <div className="card">
          <h3 style={{margin: '0 0 16px 0'}}>Probar Reglas</h3>
          <p className="text-sm text-gray mb-4">
            Ejecuta el motor de reglas manualmente para ver qué cambios se aplicarían.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              const changes = store.runRulesEngine();
              if (typeof window !== 'undefined' && window.showToast) {
                window.showToast(`Motor de reglas ejecutado: ${changes.length} cambios aplicados`, 'success');
              }
            }}
          >
            ⚙️ Ejecutar motor de reglas ahora
          </button>
        </div>
      </main>

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="modal-overlay" onClick={() => setShowAddRuleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Añadir Nueva Regla</h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAddRuleModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="grid gap-4">
                <div>
                  <label className="form-label">Si proveedor contiene...</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="ej: Endesa, Iberdrola, Comunidad..."
                    value={newRule.providerContains}
                    onChange={(e) => setNewRule({ ...newRule, providerContains: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="form-label">Categoría</label>
                  <select 
                    className="form-control"
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Inmueble (opcional)</label>
                  <select 
                    className="form-control"
                    value={newRule.propertyId || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      propertyId: e.target.value === 'auto' ? 'auto' : (e.target.value ? parseInt(e.target.value) : null)
                    })}
                  >
                    <option value="">Sin asignar</option>
                    <option value="auto">Auto-asignar por contratos</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.address}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={newRule.deductible}
                      onChange={(e) => setNewRule({ ...newRule, deductible: e.target.checked })}
                    />
                    <span className="form-label" style={{margin: 0}}>Gasto deducible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowAddRuleModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddRule}
                disabled={!newRule.providerContains.trim()}
              >
                Añadir Regla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}