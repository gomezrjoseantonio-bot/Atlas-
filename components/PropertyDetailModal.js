import { useState } from 'react';
import CapexCard from './CapexCard';
import store from '../store/index';

const PropertyDetailModal = ({ property, onClose }) => {
  const [showEditCostsModal, setShowEditCostsModal] = useState(false);

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
            <span className="font-bold text-lg" style={{color: 'var(--navy)'}}>
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{margin: 0}}>Detalle del inmueble</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="mb-4">
          <div className="font-bold text-xl">{property.address}</div>
          <div className="text-sm text-gray">{property.city} · {property.type || 'Inmueble'}</div>
        </div>

        {/* Four cards as specified: Identity, Structure, Acquisition Costs, and CAPEX */}
        {renderPropertyInfo()}
        {renderStructure()}
        {renderAcquisitionCosts()}
        
        {/* H9B: CAPEX Card */}
        <CapexCard
          property={property}
          capexProjects={store.getState().capexProjects || []}
          capexItems={store.getState().capexItems || []}
          documents={store.getState().documents || []}
          fiscalConfig={store.getState().fiscalConfig || {}}
          onViewProject={(projectId) => {
            // TODO: Implement project detail view
            console.log('View project:', projectId);
          }}
          onEditProject={(projectId) => {
            // TODO: Implement project editing
            console.log('Edit project:', projectId);
          }}
        />

        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Edit Costs Modal */}
      {showEditCostsModal && (
        <div className="modal-overlay" onClick={() => setShowEditCostsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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