import { useState, useEffect } from 'react';

export default function ContractWizard({ 
  isOpen, 
  onClose, 
  onSave,
  properties = [],
  editingContract = null 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info
    inmuebleId: '',
    unidadId: null,
    tipo: 'Vivienda_completa',
    
    // Parties
    arrendador: {
      nombre: 'José Antonio Gómez',
      dni: '12345678A',
      telefono: '+34 600 123 456',
      email: 'jose@example.com'
    },
    arrendatarios: [{
      nombre: '',
      dni: '',
      telefono: '',
      email: '',
      tipo_responsabilidad: 'Solidaria'
    }],
    
    // Dates
    fechas: {
      fecha_inicio: '',
      fecha_fin_prevista: '',
      prorroga_auto: true
    },
    
    // Rent
    renta: {
      importe_base_mes: '',
      moneda: 'EUR',
      dia_vencimiento: 1,
      prorrateo_entrada: true,
      prorrateo_salida: true
    },
    
    // Indexation
    actualizacion: {
      metodo: 'Ninguno',
      indice_label: 'IPC',
      periodicidad_meses: 12,
      porcentaje_anual: 3.0
    },
    
    // Deposit
    fianza: {
      importe: '',
      tipo: 'Legal',
      deposito_cuenta: 'Depósito Legal',
      interes_aplicable: false
    },
    
    garantias: []
  });

  // Initialize form data when editing
  useEffect(() => {
    if (editingContract) {
      setFormData({
        inmuebleId: editingContract.inmuebleId || editingContract.propertyId,
        unidadId: editingContract.unidadId || null,
        tipo: editingContract.tipo || 'Vivienda_completa',
        arrendador: editingContract.arrendador || {
          nombre: 'José Antonio Gómez',
          dni: '12345678A',
          telefono: '+34 600 123 456',
          email: 'jose@example.com'
        },
        arrendatarios: editingContract.arrendatarios || [{
          nombre: editingContract.tenant || '',
          dni: '',
          telefono: '',
          email: '',
          tipo_responsabilidad: 'Solidaria'
        }],
        fechas: editingContract.fechas || {
          fecha_inicio: editingContract.startDate || '',
          fecha_fin_prevista: editingContract.endDate || '',
          prorroga_auto: true
        },
        renta: editingContract.renta || {
          importe_base_mes: editingContract.monthlyAmount || '',
          moneda: 'EUR',
          dia_vencimiento: 1,
          prorrateo_entrada: true,
          prorrateo_salida: true
        },
        actualizacion: editingContract.actualizacion || {
          metodo: 'Ninguno',
          indice_label: 'IPC',
          periodicidad_meses: 12
        },
        fianza: editingContract.fianza || {
          importe: editingContract.deposit || '',
          tipo: 'Legal',
          deposito_cuenta: 'Depósito Legal',
          interes_aplicable: false
        },
        garantias: editingContract.garantias || []
      });
    }
  }, [editingContract]);

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrendatario = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      arrendatarios: prev.arrendatarios.map((arr, i) => 
        i === index ? { ...arr, [field]: value } : arr
      )
    }));
  };

  const addArrendatario = () => {
    setFormData(prev => ({
      ...prev,
      arrendatarios: [...prev.arrendatarios, {
        nombre: '',
        dni: '',
        telefono: '',
        email: '',
        tipo_responsabilidad: 'Solidaria'
      }]
    }));
  };

  const removeArrendatario = (index) => {
    if (formData.arrendatarios.length > 1) {
      setFormData(prev => ({
        ...prev,
        arrendatarios: prev.arrendatarios.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = () => {
    // Calculate deposit if not set and rent amount exists
    if (!formData.fianza.importe && formData.renta.importe_base_mes) {
      const rentAmount = parseFloat(formData.renta.importe_base_mes);
      if (formData.fianza.tipo === 'Legal') {
        formData.fianza.importe = rentAmount * 2; // Two months legal deposit
      }
    }

    const contractData = {
      ...formData,
      id: editingContract?.id || Date.now(),
      status: 'Activo',
      // Legacy fields for backward compatibility
      propertyId: formData.inmuebleId,
      type: formData.tipo === 'Habitacion' ? 'Alquiler Habitación' : 'Alquiler',
      tenant: formData.arrendatarios[0]?.nombre,
      startDate: formData.fechas.fecha_inicio,
      endDate: formData.fechas.fecha_fin_prevista,
      monthlyAmount: parseFloat(formData.renta.importe_base_mes),
      deposit: parseFloat(formData.fianza.importe)
    };

    onSave(contractData);
    onClose();
    setCurrentStep(1);
  };

  const steps = [
    { 
      number: 1, 
      title: 'Inmueble y Tipo', 
      icon: '🏠',
      description: 'Selecciona el inmueble y tipo de contrato'
    },
    { 
      number: 2, 
      title: 'Partes del Contrato', 
      icon: '👥',
      description: 'Arrendador y arrendatarios'
    },
    { 
      number: 3, 
      title: 'Fechas y Duración', 
      icon: '📅',
      description: 'Vigencia y renovación automática'
    },
    { 
      number: 4, 
      title: 'Renta y Actualización', 
      icon: '💶',
      description: 'Importe, vencimiento e indexación'
    },
    { 
      number: 5, 
      title: 'Fianza y Garantías', 
      icon: '📋',
      description: 'Depósitos y garantías adicionales'
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.inmuebleId && formData.tipo;
      case 2:
        return formData.arrendatarios.every(arr => arr.nombre && arr.dni);
      case 3:
        return formData.fechas.fecha_inicio;
      case 4:
        return formData.renta.importe_base_mes && formData.renta.dia_vencimiento;
      case 5:
        return true; // Fianza is optional in step 5
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal contract-wizard-modal">
        <div className="modal-header">
          <h2>{editingContract ? 'Editar Contrato' : 'Nuevo Contrato de Alquiler'}</h2>
          <button className="modal-close" onMouseDown={onClose}>
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div className="wizard-progress">
          {steps.map((step) => {
            return (
              <div 
                key={step.number}
                className={`progress-step ${currentStep >= step.number ? 'completed' : ''} ${currentStep === step.number ? 'active' : ''}`}
              >
                <div className="step-icon">
                  {step.icon}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-body">
          {/* Step 1: Property and Type */}
          {currentStep === 1 && (
            <div className="wizard-step">
              <h3>Inmueble y Tipo de Contrato</h3>
              
              <div className="form-group">
                <label>Inmueble *</label>
                <select 
                  className="form-control"
                  value={formData.inmuebleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, inmuebleId: e.target.value }))}
                >
                  <option value="">Seleccionar inmueble...</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.address} - {property.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Contrato *</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="tipo" 
                      value="Vivienda_completa"
                      checked={formData.tipo === 'Vivienda_completa'}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value, unidadId: null }))}
                    />
                    <span>Vivienda completa</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="tipo" 
                      value="Habitacion"
                      checked={formData.tipo === 'Habitacion'}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    />
                    <span>Por habitaciones</span>
                  </label>
                </div>
              </div>

              {formData.tipo === 'Habitacion' && (
                <div className="form-group">
                  <label>Unidad/Habitación</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="ej: Habitación 1, Dormitorio principal..."
                    value={formData.unidadId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, unidadId: e.target.value }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Parties */}
          {currentStep === 2 && (
            <div className="wizard-step">
              <h3>Partes del Contrato</h3>
              
              <div className="form-section">
                <h4>Arrendador</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre completo *</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.arrendador.nombre}
                      onChange={(e) => updateFormData('arrendador', 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>DNI/NIE *</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.arrendador.dni}
                      onChange={(e) => updateFormData('arrendador', 'dni', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input 
                      type="tel"
                      className="form-control"
                      value={formData.arrendador.telefono}
                      onChange={(e) => updateFormData('arrendador', 'telefono', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email"
                      className="form-control"
                      value={formData.arrendador.email}
                      onChange={(e) => updateFormData('arrendador', 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="flex items-center justify-between mb-4">
                  <h4>Arrendatarios</h4>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addArrendatario}
                  >
                    + Añadir arrendatario
                  </button>
                </div>
                
                {formData.arrendatarios.map((arrendatario, index) => (
                  <div key={index} className="arrendatario-card">
                    <div className="flex items-center justify-between mb-3">
                      <h5>Arrendatario {index + 1}</h5>
                      {formData.arrendatarios.length > 1 && (
                        <button 
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeArrendatario(index)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre completo *</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={arrendatario.nombre}
                          onChange={(e) => updateArrendatario(index, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>DNI/NIE *</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={arrendatario.dni}
                          onChange={(e) => updateArrendatario(index, 'dni', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input 
                          type="tel"
                          className="form-control"
                          value={arrendatario.telefono}
                          onChange={(e) => updateArrendatario(index, 'telefono', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input 
                          type="email"
                          className="form-control"
                          value={arrendatario.email}
                          onChange={(e) => updateArrendatario(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Tipo de responsabilidad</label>
                      <select 
                        className="form-control"
                        value={arrendatario.tipo_responsabilidad}
                        onChange={(e) => updateArrendatario(index, 'tipo_responsabilidad', e.target.value)}
                      >
                        <option value="Solidaria">Solidaria</option>
                        <option value="Mancomunada">Mancomunada</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Dates */}
          {currentStep === 3 && (
            <div className="wizard-step">
              <h3>Fechas y Duración</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de inicio *</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={formData.fechas.fecha_inicio}
                    onChange={(e) => updateFormData('fechas', 'fecha_inicio', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de fin prevista</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={formData.fechas.fecha_fin_prevista}
                    onChange={(e) => updateFormData('fechas', 'fecha_fin_prevista', e.target.value)}
                  />
                  <small className="form-help">Opcional para contratos indefinidos</small>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-option">
                  <input 
                    type="checkbox"
                    checked={formData.fechas.prorroga_auto}
                    onChange={(e) => updateFormData('fechas', 'prorroga_auto', e.target.checked)}
                  />
                  <span>Prórroga automática</span>
                </label>
                <small className="form-help">El contrato se renovará automáticamente si no se comunica lo contrario</small>
              </div>
            </div>
          )}

          {/* Step 4: Rent and Indexation */}
          {currentStep === 4 && (
            <div className="wizard-step">
              <h3>Renta y Actualización</h3>
              
              <div className="form-section">
                <h4>Renta mensual</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Importe base mensual *</label>
                    <div className="input-group">
                      <input 
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.renta.importe_base_mes}
                        onChange={(e) => updateFormData('renta', 'importe_base_mes', e.target.value)}
                      />
                      <span className="input-suffix">€</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Día de vencimiento *</label>
                    <select 
                      className="form-control"
                      value={formData.renta.dia_vencimiento}
                      onChange={(e) => updateFormData('renta', 'dia_vencimiento', parseInt(e.target.value))}
                    >
                      {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>Día {day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-option">
                      <input 
                        type="checkbox"
                        checked={formData.renta.prorrateo_entrada}
                        onChange={(e) => updateFormData('renta', 'prorrateo_entrada', e.target.checked)}
                      />
                      <span>Prorrateo en entrada</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-option">
                      <input 
                        type="checkbox"
                        checked={formData.renta.prorrateo_salida}
                        onChange={(e) => updateFormData('renta', 'prorrateo_salida', e.target.checked)}
                      />
                      <span>Prorrateo en salida</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Actualización de renta</h4>
                <div className="form-group">
                  <label>Método de actualización</label>
                  <select 
                    className="form-control"
                    value={formData.actualizacion.metodo}
                    onChange={(e) => updateFormData('actualizacion', 'metodo', e.target.value)}
                  >
                    <option value="Ninguno">Sin actualización</option>
                    <option value="Indice">Por índice (IPC, etc.)</option>
                    <option value="Fijo_pct">Porcentaje fijo anual</option>
                  </select>
                </div>

                {formData.actualizacion.metodo === 'Indice' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Índice de referencia</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={formData.actualizacion.indice_label}
                        onChange={(e) => updateFormData('actualizacion', 'indice_label', e.target.value)}
                        placeholder="ej: IPC, IPREM..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Periodicidad (meses)</label>
                      <select 
                        className="form-control"
                        value={formData.actualizacion.periodicidad_meses}
                        onChange={(e) => updateFormData('actualizacion', 'periodicidad_meses', parseInt(e.target.value))}
                      >
                        <option value={12}>Anual (12 meses)</option>
                        <option value={6}>Semestral (6 meses)</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.actualizacion.metodo === 'Fijo_pct' && (
                  <div className="form-group">
                    <label>Porcentaje anual (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formData.actualizacion.porcentaje_anual || ''}
                      onChange={(e) => updateFormData('actualizacion', 'porcentaje_anual', parseFloat(e.target.value))}
                      placeholder="ej: 2.5"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Deposit and Guarantees */}
          {currentStep === 5 && (
            <div className="wizard-step">
              <h3>Fianza y Garantías</h3>
              
              <div className="form-section">
                <h4>Fianza</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de fianza</label>
                    <select 
                      className="form-control"
                      value={formData.fianza.tipo}
                      onChange={(e) => updateFormData('fianza', 'tipo', e.target.value)}
                    >
                      <option value="Legal">Legal (2 mensualidades)</option>
                      <option value="Adicional">Adicional</option>
                      <option value="Sin_fianza">Sin fianza</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Importe</label>
                    <div className="input-group">
                      <input 
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.fianza.importe}
                        onChange={(e) => updateFormData('fianza', 'importe', e.target.value)}
                        placeholder={formData.fianza.tipo === 'Legal' && formData.renta.importe_base_mes ? 
                          (parseFloat(formData.renta.importe_base_mes) * 2).toFixed(2) : ''}
                      />
                      <span className="input-suffix">€</span>
                    </div>
                    {formData.fianza.tipo === 'Legal' && formData.renta.importe_base_mes && (
                      <small className="form-help">
                        Calculado: {(parseFloat(formData.renta.importe_base_mes) * 2).toFixed(2)}€
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Depósito en cuenta</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.fianza.deposito_cuenta}
                    onChange={(e) => updateFormData('fianza', 'deposito_cuenta', e.target.value)}
                    placeholder="ej: Depósito Legal, Cuenta específica..."
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-option">
                    <input 
                      type="checkbox"
                      checked={formData.fianza.interes_aplicable}
                      onChange={(e) => updateFormData('fianza', 'interes_aplicable', e.target.checked)}
                    />
                    <span>Interés aplicable sobre la fianza</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h4>Garantías adicionales</h4>
                <div className="text-sm text-gray mb-4">
                  Las garantías adicionales se pueden gestionar después de crear el contrato
                </div>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled
                >
                  + Añadir garantía (próximamente)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="flex items-center justify-between">
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              ← Anterior
            </button>
            
            <div className="step-indicator">
              Paso {currentStep} de {steps.length}
            </div>
            
            {currentStep < steps.length ? (
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
              >
                Siguiente →
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!canProceed()}
              >
                {editingContract ? 'Actualizar' : 'Crear'} Contrato
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}