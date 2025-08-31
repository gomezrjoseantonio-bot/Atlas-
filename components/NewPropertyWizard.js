import { useState } from 'react';
import store from '../store/index';

const NewPropertyWizard = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Data section
    alias: '',
    address: '',
    purchaseDate: '',
    totalSqm: '',
    numRooms: '',
    numBathrooms: '',
    cadastralRef: '',
    
    // Acquisition costs section
    purchasePrice: '',
    itpIva: '',
    notary: '',
    registry: '',
    management: '',
    psiIntermediation: '',
    realEstate: '',
    otherCosts: [{ concept: '', amount: '' }]
  });

  const [errors, setErrors] = useState({});

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount) || amount === '') {
      return '—';
    }
    const num = parseFloat(amount);
    if (isNaN(num)) return '—';
    return `€${num.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    const cleaned = value.replace(/[€.,\s]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const validateCadastralRef = (ref) => {
    if (!ref) return true; // Optional field
    const normalized = ref.replace(/[\s-]/g, '').toUpperCase();
    return /^[0-9A-Z]{20}$/.test(normalized);
  };

  const normalizeCadastralRef = (ref) => {
    if (!ref) return '';
    return ref.replace(/[\s-]/g, '').toUpperCase();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleOtherCostChange = (index, field, value) => {
    const newOtherCosts = [...formData.otherCosts];
    newOtherCosts[index] = { ...newOtherCosts[index], [field]: value };
    setFormData(prev => ({ ...prev, otherCosts: newOtherCosts }));
  };

  const addOtherCost = () => {
    setFormData(prev => ({
      ...prev,
      otherCosts: [...prev.otherCosts, { concept: '', amount: '' }]
    }));
  };

  const removeOtherCost = (index) => {
    const newOtherCosts = formData.otherCosts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, otherCosts: newOtherCosts }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Data validation
    if (!formData.alias.trim()) newErrors.alias = 'El alias es obligatorio';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'La fecha de compra es obligatoria';
    
    const totalSqm = parseFloat(formData.totalSqm);
    if (!formData.totalSqm || isNaN(totalSqm) || totalSqm < 0) {
      newErrors.totalSqm = 'Los m² totales deben ser un número ≥ 0';
    }
    
    const numRooms = parseInt(formData.numRooms);
    if (!formData.numRooms || isNaN(numRooms) || numRooms < 1) {
      newErrors.numRooms = 'El número de habitaciones es obligatorio y debe ser ≥ 1';
    }
    
    if (formData.numBathrooms && (isNaN(parseInt(formData.numBathrooms)) || parseInt(formData.numBathrooms) < 0)) {
      newErrors.numBathrooms = 'El número de baños debe ser ≥ 0';
    }
    
    if (formData.cadastralRef && !validateCadastralRef(formData.cadastralRef)) {
      newErrors.cadastralRef = 'La referencia catastral debe tener 20 caracteres alfanuméricos';
    }
    
    // Acquisition costs validation
    if (!formData.purchasePrice || isNaN(parseFloat(formData.purchasePrice)) || parseFloat(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = 'El precio de compra es obligatorio';
    }
    if (!formData.itpIva || isNaN(parseFloat(formData.itpIva)) || parseFloat(formData.itpIva) < 0) {
      newErrors.itpIva = 'ITP / IVA es obligatorio';
    }
    if (!formData.notary || isNaN(parseFloat(formData.notary)) || parseFloat(formData.notary) < 0) {
      newErrors.notary = 'Notaría es obligatoria';
    }
    if (!formData.registry || isNaN(parseFloat(formData.registry)) || parseFloat(formData.registry) < 0) {
      newErrors.registry = 'Registro es obligatorio';
    }
    if (!formData.management || isNaN(parseFloat(formData.management)) || parseFloat(formData.management) < 0) {
      newErrors.management = 'Gestoría es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Create the new property object
    const newProperty = {
      id: Date.now(), // Generate unique ID
      alias: formData.alias.trim(),
      address: formData.address.trim(),
      totalSqm: parseFloat(formData.totalSqm),
      numRooms: parseInt(formData.numRooms),
      numBathrooms: formData.numBathrooms ? parseInt(formData.numBathrooms) : 0,
      cadastralRef: formData.cadastralRef ? normalizeCadastralRef(formData.cadastralRef) : null,
      
      // Acquisition costs
      acquisitionCosts: {
        purchasePrice: parseFloat(formData.purchasePrice),
        itpIva: parseFloat(formData.itpIva),
        notary: parseFloat(formData.notary),
        management: parseFloat(formData.management),
        registry: parseFloat(formData.registry),
        purchaseDate: formData.purchaseDate,
        psiIntermediation: formData.psiIntermediation ? parseFloat(formData.psiIntermediation) : 0,
        realEstate: formData.realEstate ? parseFloat(formData.realEstate) : 0,
        otherCosts: formData.otherCosts.filter(cost => cost.concept.trim() && cost.amount),
        total: calculateTotalAcquisitionCost()
      },
      
      // Default values for existing property fields
      type: 'Piso',
      purchaseDate: formData.purchaseDate,
      purchasePrice: parseFloat(formData.purchasePrice),
      currentValue: parseFloat(formData.purchasePrice), // Start with purchase price
      monthlyRent: 0,
      monthlyExpenses: 0,
      netProfit: 0,
      rentability: 0,
      tenant: null,
      status: 'Libre'
    };
    
    // Add to store
    store.addProperty(newProperty);
    
    // Show success message
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`Inmueble "${newProperty.alias}" creado correctamente`, 'success');
    }
    
    // Close wizard and notify success
    onSuccess(newProperty);
  };

  const calculateTotalAcquisitionCost = () => {
    const costs = [
      parseFloat(formData.purchasePrice) || 0,
      parseFloat(formData.itpIva) || 0,
      parseFloat(formData.notary) || 0,
      parseFloat(formData.management) || 0,
      parseFloat(formData.registry) || 0,
      parseFloat(formData.psiIntermediation) || 0,
      parseFloat(formData.realEstate) || 0
    ];
    
    const otherCostsTotal = formData.otherCosts.reduce((sum, cost) => {
      return sum + (parseFloat(cost.amount) || 0);
    }, 0);
    
    return costs.reduce((sum, cost) => sum + cost, 0) + otherCostsTotal;
  };

  const renderForm = () => (
    <div>
      {/* Data Section */}
      <div className="mb-6">
        <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Datos</h4>
        
        <div className="grid-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Alias *</label>
            <input 
              type="text"
              className="form-control"
              value={formData.alias}
              onChange={(e) => handleInputChange('alias', e.target.value)}
              placeholder="Ej: Madrid Centro 1"
            />
            {errors.alias && <div className="text-sm text-error mt-1">{errors.alias}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Fecha de compra *</label>
            <input 
              type="date"
              className="form-control"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
            />
            {errors.purchaseDate && <div className="text-sm text-error mt-1">{errors.purchaseDate}</div>}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium">Dirección *</label>
          <input 
            type="text"
            className="form-control"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Calle Gran Vía 12, 3ºB"
          />
          {errors.address && <div className="text-sm text-error mt-1">{errors.address}</div>}
        </div>

        <div className="grid-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">m² *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.totalSqm}
              onChange={(e) => handleInputChange('totalSqm', e.target.value)}
              placeholder="85"
              min="0"
              step="0.01"
            />
            {errors.totalSqm && <div className="text-sm text-error mt-1">{errors.totalSqm}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Habitaciones (requerido) *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.numRooms}
              onChange={(e) => handleInputChange('numRooms', e.target.value)}
              placeholder="3"
              min="1"
            />
            {errors.numRooms && <div className="text-sm text-error mt-1">{errors.numRooms}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Baños</label>
            <input 
              type="number"
              className="form-control"
              value={formData.numBathrooms}
              onChange={(e) => handleInputChange('numBathrooms', e.target.value)}
              placeholder="2"
              min="0"
            />
            {errors.numBathrooms && <div className="text-sm text-error mt-1">{errors.numBathrooms}</div>}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium">Ref. catastral (regex)</label>
          <input 
            type="text"
            className="form-control"
            value={formData.cadastralRef}
            onChange={(e) => handleInputChange('cadastralRef', e.target.value)}
            placeholder="0654104TP7005S0003YY"
            maxLength="20"
          />
          <div className="text-xs text-gray mt-1">20 caracteres alfanuméricos</div>
          {errors.cadastralRef && <div className="text-sm text-error mt-1">{errors.cadastralRef}</div>}
        </div>
      </div>

      {/* Acquisition Costs Section */}
      <div className="mb-6">
        <h4 style={{margin: '0 0 16px 0', color: 'var(--accent)'}}>Costes de adquisición</h4>
        
        <div className="grid-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Precio *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              placeholder="180000"
              min="0"
              step="0.01"
            />
            {errors.purchasePrice && <div className="text-sm text-error mt-1">{errors.purchasePrice}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">ITP/IVA *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.itpIva}
              onChange={(e) => handleInputChange('itpIva', e.target.value)}
              placeholder="10800"
              min="0"
              step="0.01"
            />
            {errors.itpIva && <div className="text-sm text-error mt-1">{errors.itpIva}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Notaría *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.notary}
              onChange={(e) => handleInputChange('notary', e.target.value)}
              placeholder="1200"
              min="0"
              step="0.01"
            />
            {errors.notary && <div className="text-sm text-error mt-1">{errors.notary}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Registro *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.registry}
              onChange={(e) => handleInputChange('registry', e.target.value)}
              placeholder="400"
              min="0"
              step="0.01"
            />
            {errors.registry && <div className="text-sm text-error mt-1">{errors.registry}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Gestoría *</label>
            <input 
              type="number"
              className="form-control"
              value={formData.management}
              onChange={(e) => handleInputChange('management', e.target.value)}
              placeholder="600"
              min="0"
              step="0.01"
            />
            {errors.management && <div className="text-sm text-error mt-1">{errors.management}</div>}
          </div>
          
          <div>
            <label className="text-sm font-medium">PSI</label>
            <input 
              type="number"
              className="form-control"
              value={formData.psiIntermediation}
              onChange={(e) => handleInputChange('psiIntermediation', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Inmobiliaria</label>
            <input 
              type="number"
              className="form-control"
              value={formData.realEstate}
              onChange={(e) => handleInputChange('realEstate', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        {/* Other costs */}
        <div className="mb-4">
          <label className="text-sm font-medium">Otros</label>
          {formData.otherCosts.map((cost, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input 
                type="text"
                className="form-control flex-1"
                value={cost.concept}
                onChange={(e) => handleOtherCostChange(index, 'concept', e.target.value)}
                placeholder="Concepto"
              />
              <input 
                type="number"
                className="form-control"
                style={{width: '150px'}}
                value={cost.amount}
                onChange={(e) => handleOtherCostChange(index, 'amount', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {formData.otherCosts.length > 1 && (
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => removeOtherCost(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={addOtherCost}
          >
            + Añadir otro gasto
          </button>
        </div>
        
        {/* Total */}
        <div className="card" style={{background: '#F0F9FF', border: '1px solid #0EA5E9'}}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">Total coste de adquisición</div>
            <div className="font-bold text-lg" style={{color: 'var(--navy)'}}>
              {formatCurrency(calculateTotalAcquisitionCost())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth: '800px', maxHeight: '90vh', overflow: 'auto'}} onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{margin: 0}}>Nuevo inmueble</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        {/* Single screen form */}
        {renderForm()}
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPropertyWizard;