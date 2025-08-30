import { useState } from 'react';
import store from '../store/index';

const NewPropertyWizard = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Identity
    alias: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    totalSqm: '',
    numRooms: '',
    numBathrooms: '',
    cadastralRef: '',
    notes: '',
    
    // Step 2: Structure (auto-generated)
    units: [],
    
    // Step 2: Acquisition costs
    purchasePrice: '',
    itpIva: '',
    notary: '',
    management: '',
    registry: '',
    purchaseDate: '',
    psiIntermediation: '',
    realEstate: '',
    otherCosts: [{ concept: '', amount: '' }]
  });

  const [errors, setErrors] = useState({});

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount) || amount === '') {
      return '€0,00';
    }
    const num = parseFloat(amount);
    if (isNaN(num)) return '€0,00';
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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.alias.trim()) newErrors.alias = 'El alias es obligatorio';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es obligatoria';
    if (!formData.province.trim()) newErrors.province = 'La provincia es obligatoria';
    
    const totalSqm = parseFloat(formData.totalSqm);
    if (!formData.totalSqm || isNaN(totalSqm) || totalSqm < 0) {
      newErrors.totalSqm = 'Los m² totales deben ser un número ≥ 0';
    }
    
    const numRooms = parseInt(formData.numRooms);
    if (!formData.numRooms || isNaN(numRooms) || numRooms < 1) {
      newErrors.numRooms = 'El número de habitaciones debe ser ≥ 1';
    }
    
    if (formData.numBathrooms && (isNaN(parseInt(formData.numBathrooms)) || parseInt(formData.numBathrooms) < 0)) {
      newErrors.numBathrooms = 'El número de baños debe ser ≥ 0';
    }
    
    if (formData.cadastralRef && !validateCadastralRef(formData.cadastralRef)) {
      newErrors.cadastralRef = 'La referencia catastral debe tener 20 caracteres alfanuméricos (ej.: 0654104TP7005S0003YY)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Validate required acquisition costs
    if (!formData.purchasePrice || isNaN(parseFloat(formData.purchasePrice)) || parseFloat(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = 'El precio de compra es obligatorio';
    }
    if (!formData.itpIva || isNaN(parseFloat(formData.itpIva)) || parseFloat(formData.itpIva) < 0) {
      newErrors.itpIva = 'ITP / IVA es obligatorio';
    }
    if (!formData.notary || isNaN(parseFloat(formData.notary)) || parseFloat(formData.notary) < 0) {
      newErrors.notary = 'Notaría es obligatoria';
    }
    if (!formData.management || isNaN(parseFloat(formData.management)) || parseFloat(formData.management) < 0) {
      newErrors.management = 'Gestoría es obligatoria';
    }
    if (!formData.registry || isNaN(parseFloat(formData.registry)) || parseFloat(formData.registry) < 0) {
      newErrors.registry = 'Registro es obligatorio';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'La fecha de compra es obligatoria';
    }
    
    // Validate optional costs (if provided, must be valid)
    if (formData.psiIntermediation && (isNaN(parseFloat(formData.psiIntermediation)) || parseFloat(formData.psiIntermediation) < 0)) {
      newErrors.psiIntermediation = 'PSI / Intermediación debe ser ≥ 0';
    }
    if (formData.realEstate && (isNaN(parseFloat(formData.realEstate)) || parseFloat(formData.realEstate) < 0)) {
      newErrors.realEstate = 'Inmobiliaria debe ser ≥ 0';
    }
    
    // Validate other costs
    formData.otherCosts.forEach((cost, index) => {
      if (cost.concept && (!cost.amount || isNaN(parseFloat(cost.amount)) || parseFloat(cost.amount) < 0)) {
        newErrors[`otherCost_${index}_amount`] = 'El importe debe ser ≥ 0';
      }
      if (cost.amount && !cost.concept.trim()) {
        newErrors[`otherCost_${index}_concept`] = 'El concepto es obligatorio';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUnits = () => {
    const numRooms = parseInt(formData.numRooms);
    if (isNaN(numRooms) || numRooms < 1) return [];
    
    const units = [];
    for (let i = 1; i <= numRooms; i++) {
      units.push({
        id: Date.now() + i, // Temporary ID
        name: `H${i}`,
        sqm: ''
      });
    }
    return units;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      // Generate units based on number of rooms
      const units = generateUnits();
      setFormData(prev => ({ ...prev, units }));
      setCurrentStep(2);
    }
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

  const handleSubmit = () => {
    if (!validateStep2()) return;
    
    // Create the new property object
    const newProperty = {
      id: Date.now(), // Generate unique ID
      alias: formData.alias.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      province: formData.province.trim(),
      postalCode: formData.postalCode.trim() || null,
      totalSqm: parseFloat(formData.totalSqm),
      numRooms: parseInt(formData.numRooms),
      numBathrooms: formData.numBathrooms ? parseInt(formData.numBathrooms) : null,
      cadastralRef: formData.cadastralRef ? normalizeCadastralRef(formData.cadastralRef) : null,
      notes: formData.notes.trim() || null,
      
      // Structure
      estructura_definida: true,
      multiUnit: true,
      totalUnits: parseInt(formData.numRooms),
      occupiedUnits: 0,
      units: formData.units.map(unit => ({
        ...unit,
        propertyId: Date.now(), // Will be updated when property is saved
        sqm: unit.sqm ? parseFloat(unit.sqm) : null,
        monthlyRent: 0,
        status: 'Libre'
      })),
      
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
      occupancy: 0,
      tenant: null,
      contractStart: null,
      contractEnd: null,
      status: 'Disponible'
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

  const renderStep1 = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0'}}>Paso 1: Identidad del inmueble</h3>
      
      <div className="grid-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">Alias *</label>
          <input 
            type="text"
            className="form-control"
            value={formData.alias}
            onChange={(e) => handleInputChange('alias', e.target.value)}
            placeholder="AT-GranVía-12"
          />
          {errors.alias && <div className="text-sm text-error mt-1">{errors.alias}</div>}
        </div>
        
        <div>
          <label className="text-sm font-medium">Código postal</label>
          <input 
            type="text"
            className="form-control"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="28001"
          />
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
      
      <div className="grid-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">Ciudad *</label>
          <input 
            type="text"
            className="form-control"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Madrid"
          />
          {errors.city && <div className="text-sm text-error mt-1">{errors.city}</div>}
        </div>
        
        <div>
          <label className="text-sm font-medium">Provincia *</label>
          <input 
            type="text"
            className="form-control"
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            placeholder="Madrid"
          />
          {errors.province && <div className="text-sm text-error mt-1">{errors.province}</div>}
        </div>
      </div>
      
      <div className="grid-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">m² totales *</label>
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
          <label className="text-sm font-medium">Nº de habitaciones *</label>
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
          <label className="text-sm font-medium">Nº de baños</label>
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
        <label className="text-sm font-medium">Referencia catastral</label>
        <input 
          type="text"
          className="form-control"
          value={formData.cadastralRef}
          onChange={(e) => handleInputChange('cadastralRef', e.target.value)}
          placeholder="0654104TP7005S0003YY"
          maxLength="20"
        />
        <div className="text-xs text-gray mt-1">Ejemplo: 0654104TP7005S0003YY (20 caracteres alfanuméricos)</div>
        {errors.cadastralRef && <div className="text-sm text-error mt-1">{errors.cadastralRef}</div>}
      </div>
      
      <div className="mb-6">
        <label className="text-sm font-medium">Notas</label>
        <textarea 
          className="form-control"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Observaciones adicionales..."
          rows="3"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0'}}>Paso 2: Estructura y costes de adquisición</h3>
      
      {/* Room Structure */}
      <div className="mb-6">
        <h4 style={{margin: '0 0 16px 0'}}>Estructura de habitaciones</h4>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>m² (opcional)</th>
              </tr>
            </thead>
            <tbody>
              {formData.units.map((unit, index) => (
                <tr key={unit.id}>
                  <td>
                    <input 
                      type="text"
                      className="form-control"
                      value={unit.name}
                      onChange={(e) => {
                        const newUnits = [...formData.units];
                        newUnits[index] = { ...newUnits[index], name: e.target.value };
                        setFormData(prev => ({ ...prev, units: newUnits }));
                      }}
                    />
                  </td>
                  <td>
                    <input 
                      type="number"
                      className="form-control"
                      value={unit.sqm}
                      onChange={(e) => {
                        const newUnits = [...formData.units];
                        newUnits[index] = { ...newUnits[index], sqm: e.target.value };
                        setFormData(prev => ({ ...prev, units: newUnits }));
                      }}
                      placeholder="15"
                      min="0"
                      step="0.01"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Acquisition Costs */}
      <div className="mb-6">
        <h4 style={{margin: '0 0 8px 0'}}>Costes de adquisición</h4>
        <div className="text-sm text-gray mb-4">
          Incluye gastos iniciales de compra. No incluye reformas (CAPEX), ni financiación.
        </div>
        
        {/* Required costs */}
        <div className="grid-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">Precio de compra *</label>
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
            <label className="text-sm font-medium">ITP / IVA *</label>
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
        
        {/* Optional costs */}
        <div className="grid-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium">PSI / Intermediación</label>
            <input 
              type="number"
              className="form-control"
              value={formData.psiIntermediation}
              onChange={(e) => handleInputChange('psiIntermediation', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.psiIntermediation && <div className="text-sm text-error mt-1">{errors.psiIntermediation}</div>}
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
            {errors.realEstate && <div className="text-sm text-error mt-1">{errors.realEstate}</div>}
          </div>
        </div>
        
        {/* Other costs */}
        <div className="mb-4">
          <label className="text-sm font-medium">Otros gastos</label>
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

  const renderSummary = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0'}}>Resumen</h3>
      
      {/* Identity summary */}
      <div className="card mb-4">
        <h4 style={{margin: '0 0 16px 0'}}>Identidad del inmueble</h4>
        <div className="grid-2 gap-4">
          <div>
            <div className="text-sm text-gray">Alias</div>
            <div className="font-semibold">{formData.alias}</div>
          </div>
          <div>
            <div className="text-sm text-gray">Dirección</div>
            <div className="font-semibold">{formData.address}</div>
          </div>
          <div>
            <div className="text-sm text-gray">Ciudad / Provincia</div>
            <div className="font-semibold">{formData.city}, {formData.province}</div>
          </div>
          <div>
            <div className="text-sm text-gray">m² totales</div>
            <div className="font-semibold">{formData.totalSqm} m²</div>
          </div>
          <div>
            <div className="text-sm text-gray">Habitaciones</div>
            <div className="font-semibold">{formData.numRooms}</div>
          </div>
          {formData.numBathrooms && (
            <div>
              <div className="text-sm text-gray">Baños</div>
              <div className="font-semibold">{formData.numBathrooms}</div>
            </div>
          )}
          {formData.cadastralRef && (
            <div>
              <div className="text-sm text-gray">Referencia catastral</div>
              <div className="font-semibold">{normalizeCadastralRef(formData.cadastralRef)}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Structure summary */}
      <div className="card mb-4">
        <h4 style={{margin: '0 0 16px 0'}}>Estructura ({formData.units.length} habitaciones)</h4>
        <div className="grid gap-2">
          {formData.units.map((unit, index) => (
            <div key={unit.id} className="flex items-center justify-between p-2" style={{background: '#F9FAFB', borderRadius: '4px'}}>
              <span className="font-semibold">{unit.name}</span>
              {unit.sqm && <span className="text-sm text-gray">{unit.sqm} m²</span>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Acquisition costs summary */}
      <div className="card mb-4">
        <h4 style={{margin: '0 0 16px 0'}}>Costes de adquisición</h4>
        <div className="grid gap-2 mb-4">
          <div className="flex items-center justify-between">
            <span>Precio de compra</span>
            <span className="font-semibold">{formatCurrency(formData.purchasePrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ITP / IVA</span>
            <span className="font-semibold">{formatCurrency(formData.itpIva)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Notaría</span>
            <span className="font-semibold">{formatCurrency(formData.notary)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Gestoría</span>
            <span className="font-semibold">{formatCurrency(formData.management)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Registro</span>
            <span className="font-semibold">{formatCurrency(formData.registry)}</span>
          </div>
          {formData.psiIntermediation > 0 && (
            <div className="flex items-center justify-between">
              <span>PSI / Intermediación</span>
              <span className="font-semibold">{formatCurrency(formData.psiIntermediation)}</span>
            </div>
          )}
          {formData.realEstate > 0 && (
            <div className="flex items-center justify-between">
              <span>Inmobiliaria</span>
              <span className="font-semibold">{formatCurrency(formData.realEstate)}</span>
            </div>
          )}
          {formData.otherCosts.filter(cost => cost.concept.trim() && cost.amount).map((cost, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{cost.concept}</span>
              <span className="font-semibold">{formatCurrency(cost.amount)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3" style={{borderTop: '1px solid #E5E7EB'}}>
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg" style={{color: 'var(--navy)'}}>
            {formatCurrency(calculateTotalAcquisitionCost())}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth: '800px', maxHeight: '90vh', overflow: 'auto'}} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{margin: 0}}>Nuevo inmueble</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center mb-6">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray'
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className={`w-12 h-1 ${step < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        
        {/* Step content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderSummary()}
        
        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Anterior
            </button>
          )}
          
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          
          {currentStep < 3 ? (
            <button 
              className="btn btn-primary"
              onClick={currentStep === 1 ? handleStep1Next : () => {
                if (validateStep2()) setCurrentStep(3);
              }}
            >
              Siguiente
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Crear inmueble
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPropertyWizard;