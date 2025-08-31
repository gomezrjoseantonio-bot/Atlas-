import { useState } from 'react';
import CapexCard from './CapexCard';
import store from '../store/index';

const PropertyDetailModal = ({ property, onClose }) => {
  const [showEditCostsModal, setShowEditCostsModal] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState('cartera');

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '—';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const renderPropertyInfo = () => (
    <div className="card mb-4">
      <h4 style={{margin: '0 0 16px 0'}}>📋 Ficha del inmueble</h4>
      <div className="grid-2 gap-4">
        <div>
          <div className="text-sm text-gray">Alias</div>
          <div className="font-semibold">{property.alias || property.address}</div>
        </div>
        <div>
          <div className="text-sm text-gray">Dirección</div>
          <div className="font-semibold">{property.address}</div>
        </div>
        <div>
          <div className="text-sm text-gray">Ciudad / Provincia</div>
          <div className="font-semibold">{property.city}{property.province ? `, ${property.province}` : ''}</div>
        </div>
        <div>
          <div className="text-sm text-gray">m² totales</div>
          <div className="font-semibold">{property.totalSqm ? `${property.totalSqm} m²` : '—'}</div>
        </div>
        <div>
          <div className="text-sm text-gray">Nº habitaciones</div>
          <div className="font-semibold">{property.numRooms || property.totalUnits || '—'}</div>
        </div>
        {property.numBathrooms && (
          <div>
            <div className="text-sm text-gray">Nº baños</div>
            <div className="font-semibold">{property.numBathrooms}</div>
          </div>
        )}
        {property.cadastralRef && (
          <div className="grid-2-span">
            <div className="text-sm text-gray">Referencia catastral</div>
            <div className="font-semibold" style={{fontFamily: 'monospace'}}>{property.cadastralRef}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStructure = () => (
    <div className="card mb-4">
      <h4 style={{margin: '0 0 16px 0'}}>🏠 Estructura</h4>
      {property.units && property.units.length > 0 ? (
        <div className="grid gap-2">
          {property.units.map((unit, index) => (
            <div key={unit.id || index} className="flex items-center justify-between p-3" style={{background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB'}}>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{unit.name}</span>
                {unit.sqm && <span className="text-sm text-gray">{unit.sqm} m²</span>}
              </div>
              <span className={`chip ${unit.status === 'Ocupada' ? 'success' : 'warning'}`} style={{fontSize: '11px'}}>
                {unit.status || 'Libre'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray">
          {property.estructura_definida ? 
            `Estructura básica: ${property.numRooms || property.totalUnits || 1} habitaciones` :
            'Estructura no definida'
          }
        </div>
      )}
    </div>
  );

  const renderGastos = () => (
    <div>
      {/* Banner */}
      <div className="card mb-4" style={{borderColor: 'var(--warning)', background: '#FFFBEB'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{fontSize: '20px'}}>💡</span>
            <div>
              <div className="font-medium text-sm">
                Las mejoras (CAPEX) no se deducen completas en el año: se amortizan
              </div>
              <div className="text-xs text-gray">
                Mobiliario 10 años; resto según tipo
              </div>
            </div>
          </div>
          <button className="btn-close" style={{fontSize: '14px'}}>×</button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card mb-4">
        <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Subir Documentos</h4>
        <div style={{
          border: '2px dashed var(--border)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg)',
          marginBottom: '16px'
        }}>
          <div style={{fontSize: '32px', marginBottom: '8px'}}>📁</div>
          <div style={{marginBottom: '8px'}}>
            Arrastra archivos o 
            <button className="btn btn-primary btn-sm" style={{marginLeft: '8px'}}>
              Seleccionar archivos
            </button>
          </div>
          <div className="text-xs text-gray">
            PDF, JPG, PNG, ZIP (múltiples archivos)
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-primary">Procesar con OCR</button>
          <button className="btn btn-secondary">Limpiar</button>
        </div>
      </div>

      {/* Gastos Table */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 style={{margin: 0, color: 'var(--accent)'}}>Gastos del activo</h4>
          <div className="flex gap-2">
            <select className="input" style={{fontSize: '12px', padding: '4px 8px'}}>
              <option>Todos los tipos</option>
              <option>Corrientes (R/C)</option>
              <option>CAPEX</option>
              <option>Mobiliario</option>
            </select>
            <select className="input" style={{fontSize: '12px', padding: '4px 8px'}}>
              <option>Todos los estados</option>
              <option>Validada</option>
              <option>Pendiente</option>
              <option>Error</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Concepto</th>
                <th>Importe</th>
                <th>Categoría</th>
                <th>Tratamiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray">
                  <div className="mb-2">📄</div>
                  <div className="text-sm">No hay gastos registrados para este activo</div>
                  <div className="text-xs" style={{opacity: 0.7}}>
                    Los documentos aparecerán aquí al ser asignados desde el Inbox
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen Fiscal */}
      <div className="card">
        <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Resumen Fiscal</h4>
        <div className="grid-3 gap-4 mb-4">
          <div className="text-center p-3" style={{background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px'}}>
            <div className="text-sm text-gray">Deducible año</div>
            <div className="font-semibold" style={{color: 'var(--success)'}}>€0,00</div>
          </div>
          <div className="text-center p-3" style={{background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px'}}>
            <div className="text-sm text-gray">Amortizable (CAPEX)</div>
            <div className="font-semibold" style={{color: 'var(--warning)'}}>€0,00</div>
          </div>
          <div className="text-center p-3" style={{background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: '6px'}}>
            <div className="text-sm text-gray">Pendiente</div>
            <div className="font-semibold" style={{color: '#2563EB'}}>€0,00</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">📄 Export PDF</button>
          <button className="btn btn-outline btn-sm">📊 Export Excel</button>
        </div>
      </div>
    </div>
  );

  const renderSubtabs = () => {
    const subtabs = [
      { id: 'cartera', label: 'Cartera', icon: '📊' },
      { id: 'contratos', label: 'Contratos', icon: '📝' },
      { id: 'prestamos', label: 'Préstamos', icon: '🏦' },
      { id: 'gastos', label: 'Gastos', icon: '💰' },
      { id: 'analisis', label: 'Análisis', icon: '📈' }
    ];

    return (
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {subtabs.map(subtab => (
          <button
            key={subtab.id}
            className={`tab ${activeSubtab === subtab.id ? 'active' : ''}`}
            onClick={() => setActiveSubtab(subtab.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: '2px solid transparent',
              color: activeSubtab === subtab.id ? 'var(--accent)' : 'var(--text-2)',
              borderColor: activeSubtab === subtab.id ? 'var(--accent)' : 'transparent',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{subtab.icon}</span>
            {subtab.label}
          </button>
        ))}
      </div>
    );
  };

  const renderSubtabContent = () => {
    switch (activeSubtab) {
      case 'gastos':
        return renderGastos();
      case 'contratos':
        return (
          <div className="text-center py-8 text-gray">
            <div className="mb-2">📝</div>
            <div>Contratos próximamente</div>
          </div>
        );
      case 'prestamos':
        return (
          <div className="text-center py-8 text-gray">
            <div className="mb-2">🏦</div>
            <div>Préstamos próximamente</div>
          </div>
        );
      case 'analisis':
        return (
          <div className="text-center py-8 text-gray">
            <div className="mb-2">📈</div>
            <div>Análisis próximamente</div>
          </div>
        );
      default: // cartera
        return (
          <div>
            {renderPropertyInfo()}
            {renderStructure()}
            {renderAcquisitionCosts()}
          </div>
        );
    }
  };

  const renderAcquisitionCosts = () => (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 style={{margin: 0}}>💰 Costes de adquisición</h4>
        {property.acquisitionCosts && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEditCostsModal(true)}
          >
            Editar costes
          </button>
        )}
      </div>
      
      {property.acquisitionCosts ? (
        <div>
          <div className="grid gap-2 mb-4">
            <div className="flex items-center justify-between">
              <span>Precio de compra</span>
              <span className="font-semibold">{formatCurrency(property.acquisitionCosts.purchasePrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ITP / IVA</span>
              <span className="font-semibold">{formatCurrency(property.acquisitionCosts.itpIva)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Notaría</span>
              <span className="font-semibold">{formatCurrency(property.acquisitionCosts.notary)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gestoría</span>
              <span className="font-semibold">{formatCurrency(property.acquisitionCosts.management)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Registro</span>
              <span className="font-semibold">{formatCurrency(property.acquisitionCosts.registry)}</span>
            </div>
            {property.acquisitionCosts.psiIntermediation > 0 && (
              <div className="flex items-center justify-between">
                <span>PSI / Intermediación</span>
                <span className="font-semibold">{formatCurrency(property.acquisitionCosts.psiIntermediation)}</span>
              </div>
            )}
            {property.acquisitionCosts.realEstate > 0 && (
              <div className="flex items-center justify-between">
                <span>Inmobiliaria</span>
                <span className="font-semibold">{formatCurrency(property.acquisitionCosts.realEstate)}</span>
              </div>
            )}
            {property.acquisitionCosts.otherCosts && property.acquisitionCosts.otherCosts.map((cost, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{cost.concept}</span>
                <span className="font-semibold">{formatCurrency(cost.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3" style={{borderTop: '1px solid #E5E7EB'}}>
            <span className="font-bold text-lg">Total coste de adquisición</span>
            <span className="font-bold text-lg" style={{color: 'var(--accent)'}}>
              {formatCurrency(property.acquisitionCosts.total)}
            </span>
          </div>
          {property.acquisitionCosts.purchaseDate && (
            <div className="text-sm text-gray mt-2">
              Fecha de compra: {new Date(property.acquisitionCosts.purchaseDate).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3" style={{background: '#FEF3C7', borderRadius: '6px', border: '1px solid #F59E0B'}}>
          <div>
            <div className="font-semibold">Costes pendientes de registro</div>
            <div className="text-sm text-gray">Los costes de adquisición no han sido registrados</div>
          </div>
          <span className="chip warning">Pendiente</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}} onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{margin: 0}}>Detalle del inmueble</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="mb-4">
          <div className="font-bold text-xl">{property.address}</div>
          <div className="text-sm text-gray">{property.city} · {property.type || 'Inmueble'}</div>
        </div>

        {/* Subtabs Navigation */}
        {renderSubtabs()}

        {/* Subtab Content */}
        {renderSubtabContent()}

        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('Edición de inmuebles próximamente disponible', 'info');
                }
              }}
            >
              ✏️ Editar
            </button>
            <button 
              className="btn btn-secondary"
              style={{color: 'var(--danger)'}}
              onClick={() => {
                if (window.confirm(`¿Estás seguro de que quieres eliminar "${property.address}"?`)) {
                  if (window.showToast) {
                    window.showToast('Eliminación de inmuebles próximamente disponible', 'info');
                  }
                }
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Edit Costs Modal */}
      {showEditCostsModal && (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowEditCostsModal(false)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{margin: 0}}>Editar costes de adquisición</h3>
              <button className="btn-close" onClick={() => setShowEditCostsModal(false)}>×</button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray">Esta funcionalidad estará disponible próximamente.</div>
              <div className="text-sm text-gray">Por ahora, los costes solo se pueden registrar durante la creación del inmueble.</div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => setShowEditCostsModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailModal;