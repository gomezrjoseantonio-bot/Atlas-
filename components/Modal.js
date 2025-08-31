// ATLAS Modal Component - Reusable modal for all actions
// HITO 4 - Connect buttons functionality

import { useState, useEffect } from 'react';
import store from '../store/index.js';

export default function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    const handleModalEvent = (event) => {
      const { modalId, data } = event.detail;
      setModalType(modalId);
      setModalData(data || {});
      setIsOpen(true);
    };

    document.addEventListener('atlas:modal', handleModalEvent);
    return () => document.removeEventListener('atlas:modal', handleModalEvent);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalType('');
      setModalData({});
    }, 150);
  };

  const showToast = (type, message) => {
    const event = new CustomEvent('atlas:toast', {
      detail: { type, message }
    });
    document.dispatchEvent(event);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{getModalTitle(modalType)}</h3>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          {renderModalContent(modalType, modalData, closeModal, showToast)}
        </div>
      </div>
    </div>
  );
}

function getModalTitle(modalType) {
  const titles = {
    editInvoice: 'Editar Factura',
    viewInvoice: 'Ver Factura',
    assignProperty: 'Asignar Inmueble',
    treasuryTransfer: 'Mover Dinero',
    registerIncome: 'Registrar Ingreso',
    assignMovementDocument: 'Asignar Documento a Movimiento',
    amortizeLoan: 'Amortizar Préstamo',
    editLoan: 'Editar Préstamo',
    createLoan: 'Crear Nuevo Préstamo',
    linkLoanProperty: 'Vincular Préstamo a Inmueble',
    propertyPL: 'Análisis P&L - Inmueble',
    propertyDetail: 'Detalle del Inmueble',
    addPropertyExpense: 'Añadir Gasto de Explotación',
    // HITO 7: Multi-unit modals
    'multi-unit-setup': 'Configurar Multi-unidad',
    'manage-units': 'Gestionar Unidades',
    'document-allocation': 'Prorratear Gasto',
    // H11: Enhanced loan modals
    'createLoanWizard': 'Crear Nuevo Préstamo',
    'loanDetail': 'Detalle del Préstamo',
    'editLoanVinculaciones': 'Gestionar Vinculaciones',
    'editLoanCostes': 'Gestionar Costes y Comisiones',
    'registerRateRevision': 'Registrar Revisión de Tipo'
  };
  return titles[modalType] || 'Modal';
}

function renderModalContent(modalType, data, closeModal, showToast) {
  switch (modalType) {
    case 'editInvoice':
      return <EditInvoiceForm invoice={data.invoice} onClose={closeModal} showToast={showToast} />;
    case 'viewInvoice':
      return <ViewInvoiceContent invoice={data.invoice} onClose={closeModal} />;
    case 'assignProperty':
      return <AssignPropertyForm invoice={data.invoice} properties={data.properties} onClose={closeModal} showToast={showToast} />;
    case 'treasuryTransfer':
      return <TreasuryTransferForm accounts={data.accounts} onClose={closeModal} showToast={showToast} />;
    case 'registerIncome':
      return <RegisterIncomeForm accounts={data.accounts} onClose={closeModal} showToast={showToast} />;
    case 'assignMovementDocument':
      return <AssignMovementDocumentForm movementId={data.movementId} documents={data.documents} onClose={closeModal} showToast={showToast} />;
    case 'amortizeLoan':
      return <AmortizeLoanForm loan={data.loan} onClose={closeModal} showToast={showToast} />;
    case 'editLoan':
      return <EditLoanForm loan={data.loan} properties={data.properties} onClose={closeModal} showToast={showToast} />;
    case 'createLoan':
      return <CreateLoanForm properties={data.properties} onClose={closeModal} showToast={showToast} />;
    case 'linkLoanProperty':
      return <LinkLoanPropertyForm loans={data.loans} properties={data.properties} onClose={closeModal} showToast={showToast} />;
    case 'propertyPL':
      return <PropertyPLContent property={data.property} onClose={closeModal} />;
    case 'propertyDetail':
      return <PropertyDetailContent property={data.property} onClose={closeModal} />;
    case 'addPropertyExpense':
      return <AddPropertyExpenseForm property={data.property} onClose={closeModal} showToast={showToast} />;
    // HITO 7: Multi-unit modals
    case 'multi-unit-setup':
      return <MultiUnitSetupForm property={data.property} propertyId={data.propertyId} onClose={closeModal} showToast={showToast} />;
    case 'manage-units':
      return <ManageUnitsContent property={data.property} propertyId={data.propertyId} onClose={closeModal} showToast={showToast} />;
    case 'document-allocation':
      return <DocumentAllocationForm document={data.document} property={data.property} documentId={data.documentId} onClose={closeModal} showToast={showToast} />;
    // H11: Enhanced loan modals
    case 'createLoanWizard':
      return <CreateLoanWizard properties={data.properties} onClose={closeModal} showToast={showToast} />;
    case 'loanDetail':
      return <LoanDetailContent loan={data.loan} onClose={closeModal} showToast={showToast} />;
    case 'editLoanVinculaciones':
      return <EditLoanVinculacionesForm loan={data.loan} onClose={closeModal} showToast={showToast} />;
    case 'editLoanCostes':
      return <EditLoanCostesForm loan={data.loan} onClose={closeModal} showToast={showToast} />;
    case 'registerRateRevision':
      return <RegisterRateRevisionForm loan={data.loan} onClose={closeModal} showToast={showToast} />;
    default:
      return <div>Contenido del modal no encontrado</div>;
  }
}

// Edit Invoice Form
function EditInvoiceForm({ invoice, onClose, showToast }) {
  const [formData, setFormData] = useState({
    provider: invoice.provider || '',
    concept: invoice.concept || '',
    amount: invoice.amount || 0,
    category: invoice.category || 'Otros',
    propertyId: invoice.propertyId || '',
    status: invoice.status || 'Pendiente',
    isDeductible: invoice.isDeductible || false,
    // HITO 7: Fiscal fields
    expenseFamily: invoice.expenseFamily || '',
    fiscalTreatment: invoice.fiscalTreatment || 'deductible',
    rentalAffectation: invoice.rentalAffectation || 100,
    amortizationYears: invoice.amortizationYears || 10,
    amortizationStartDate: invoice.amortizationStartDate || new Date().toISOString().split('T')[0]
  });

  const state = store.getState();

  const handleSubmit = (e) => {
    e.preventDefault();
    store.updateDocument(invoice.id, formData);
    
    // If property is multi-unit and no allocation exists, suggest allocation
    const property = state.properties.find(p => p.id === formData.propertyId);
    if (property && property.multiUnit && !invoice.allocation && formData.expenseFamily) {
      const suggestedMethod = store.getSuggestedAllocation(formData.expenseFamily, formData.propertyId);
      showToast('info', `Sugerencia: considera prorratear por "${suggestedMethod}"`);
    }
    
    showToast('success', 'Factura actualizada');
    onClose();
  };

  const expenseFamilies = state.expenseFamilies || [];

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Proveedor:</label>
        <input 
          type="text" 
          value={formData.provider}
          onChange={(e) => setFormData({...formData, provider: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Concepto:</label>
        <input 
          type="text" 
          value={formData.concept}
          onChange={(e) => setFormData({...formData, concept: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Importe:</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Categoría:</label>
        <select 
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Suministros">Suministros</option>
          <option value="Seguros">Seguros</option>
          <option value="Gestión">Gestión</option>
          <option value="Impuestos">Impuestos</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {/* HITO 7: Expense Family */}
      <div className="form-group">
        <label>Familia de Gasto:</label>
        <select 
          value={formData.expenseFamily}
          onChange={(e) => {
            const family = expenseFamilies.find(ef => ef.id === e.target.value);
            setFormData({
              ...formData, 
              expenseFamily: e.target.value,
              fiscalTreatment: family ? family.defaultTreatment : 'deductible'
            });
          }}
        >
          <option value="">Seleccionar familia...</option>
          {expenseFamilies.map(family => (
            <option key={family.id} value={family.id}>{family.name}</option>
          ))}
        </select>
      </div>

      {/* HITO 7: Fiscal Treatment */}
      <div className="form-group">
        <label>Tratamiento Fiscal:</label>
        <select 
          value={formData.fiscalTreatment}
          onChange={(e) => setFormData({...formData, fiscalTreatment: e.target.value})}
        >
          <option value="deductible">Deducible en período</option>
          <option value="capitalizable">Capitalizable - Amortizable</option>
          <option value="no_deductible">No deducible</option>
        </select>
      </div>

      {/* HITO 7: Rental Affectation */}
      <div className="form-group">
        <label>% Afectación Alquiler:</label>
        <input 
          type="number" 
          min="0"
          max="100"
          step="1"
          value={formData.rentalAffectation}
          onChange={(e) => setFormData({...formData, rentalAffectation: parseInt(e.target.value) || 100})}
        />
        <div className="text-sm text-gray">Porcentaje del gasto afectado al alquiler</div>
      </div>

      {/* HITO 7: Amortization fields (only if capitalizable) */}
      {formData.fiscalTreatment === 'capitalizable' && (
        <>
          <div className="form-group">
            <label>Años de Amortización:</label>
            <input 
              type="number" 
              min="1"
              max="50"
              value={formData.amortizationYears}
              onChange={(e) => setFormData({...formData, amortizationYears: parseInt(e.target.value) || 10})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Fecha Inicio Amortización:</label>
            <input 
              type="date" 
              value={formData.amortizationStartDate}
              onChange={(e) => setFormData({...formData, amortizationStartDate: e.target.value})}
              required 
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Inmueble:</label>
        <select 
          value={formData.propertyId}
          onChange={(e) => setFormData({...formData, propertyId: e.target.value ? parseInt(e.target.value) : null})}
        >
          <option value="">Sin asignar</option>
          {state.properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.address} {property.multiUnit ? '(Multi-unidad)' : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Estado:</label>
        <select 
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Validada">Validada</option>
          <option value="Error">Error</option>
        </select>
      </div>
      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={formData.isDeductible}
            onChange={(e) => setFormData({...formData, isDeductible: e.target.checked})}
          />
          Gasto deducible (legacy)
        </label>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

// View Invoice Content
function ViewInvoiceContent({ invoice, onClose }) {
  return (
    <div className="invoice-view">
      <div className="invoice-details">
        <p><strong>Proveedor:</strong> {invoice.provider}</p>
        <p><strong>Concepto:</strong> {invoice.concept}</p>
        <p><strong>Importe:</strong> €{invoice.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
        <p><strong>Fecha:</strong> {new Date(invoice.uploadDate).toLocaleDateString('es-ES')}</p>
        <p><strong>Estado:</strong> {invoice.status}</p>
      </div>
      {invoice.documentUrl ? (
        <div className="document-preview">
          <p>Vista previa del documento:</p>
          <div className="preview-placeholder">
            <p>📄 {invoice.fileName || 'Documento'}</p>
            <p>Previsualización no disponible en esta versión</p>
          </div>
        </div>
      ) : (
        <p>No hay documento asociado</p>
      )}
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// Assign Property Form
function AssignPropertyForm({ invoice, properties, onClose, showToast }) {
  const [selectedProperty, setSelectedProperty] = useState(invoice.propertyId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    store.updateDocument(invoice.id, { propertyId: selectedProperty ? parseInt(selectedProperty) : null });
    showToast('success', 'Inmueble asignado');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Seleccionar inmueble para: {invoice.provider} - {invoice.concept}</label>
        <select 
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          required
        >
          <option value="">Seleccionar inmueble...</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>{property.name}</option>
          ))}
        </select>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Asignar</button>
      </div>
    </form>
  );
}

// Treasury Transfer Form
function TreasuryTransferForm({ accounts, onClose, showToast }) {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: 0,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.fromAccount === formData.toAccount) {
      showToast('error', 'Las cuentas origen y destino deben ser diferentes');
      return;
    }

    const fromAccount = accounts.find(acc => acc.id == formData.fromAccount);
    if (fromAccount && fromAccount.balanceToday < formData.amount) {
      showToast('error', 'Saldo insuficiente en cuenta origen');
      return;
    }

    // Update account balances
    store.updateAccountBalance(parseInt(formData.fromAccount), -formData.amount);
    store.updateAccountBalance(parseInt(formData.toAccount), formData.amount);

    // Add movement record
    store.addMovement({
      type: 'transfer',
      fromAccount: parseInt(formData.fromAccount),
      toAccount: parseInt(formData.toAccount),
      amount: formData.amount,
      notes: formData.notes
    });

    showToast('success', 'Transferencia realizada');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Cuenta origen:</label>
        <select 
          value={formData.fromAccount}
          onChange={(e) => setFormData({...formData, fromAccount: e.target.value})}
          required
        >
          <option value="">Seleccionar cuenta...</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name} - €{account.balanceToday.toLocaleString('es-ES', {minimumFractionDigits: 2})}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Cuenta destino:</label>
        <select 
          value={formData.toAccount}
          onChange={(e) => setFormData({...formData, toAccount: e.target.value})}
          required
        >
          <option value="">Seleccionar cuenta...</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Importe:</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Notas (opcional):</label>
        <textarea 
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows="3"
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Transferir</button>
      </div>
    </form>
  );
}

// Amortize Loan Form
function AmortizeLoanForm({ loan, onClose, showToast }) {
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (amount <= 0) {
      showToast('error', 'El importe debe ser mayor que 0');
      return;
    }

    if (amount > loan.pendingCapital) {
      showToast('error', 'El importe no puede ser mayor que el capital pendiente');
      return;
    }

    store.addAmortization(loan.id, amount);
    showToast('success', `Amortización de €${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})} realizada`);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="loan-info">
        <p><strong>Préstamo:</strong> {loan.bank} - {loan.propertyName}</p>
        <p><strong>Capital pendiente:</strong> €{loan.pendingCapital.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
      </div>
      <div className="form-group">
        <label>Importe a amortizar:</label>
        <input 
          type="number" 
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          max={loan.pendingCapital}
          required 
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Amortizar</button>
      </div>
    </form>
  );
}

// Edit Loan Form (placeholder)
function EditLoanForm({ loan, properties, onClose, showToast }) {
  return (
    <div className="modal-form">
      <p>Edición de préstamos disponible en próximas versiones</p>
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// Create Loan Form
function CreateLoanForm({ properties, onClose, showToast }) {
  const [formData, setFormData] = useState({
    propertyId: '',
    bank: '',
    originalAmount: 0,
    interestRate: 0,
    monthlyPayment: 0,
    remainingMonths: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newLoan = {
      id: Date.now(),
      ...formData,
      currentBalance: formData.originalAmount,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + formData.remainingMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const state = store.getState();
    store.setState({ loans: [...state.loans, newLoan] });
    showToast('success', 'Préstamo creado');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Inmueble:</label>
        <select 
          value={formData.propertyId}
          onChange={(e) => setFormData({...formData, propertyId: parseInt(e.target.value)})}
          required
        >
          <option value="">Seleccionar inmueble...</option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>{property.address}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Banco:</label>
        <input 
          type="text" 
          value={formData.bank}
          onChange={(e) => setFormData({...formData, bank: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Importe original:</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.originalAmount}
          onChange={(e) => setFormData({...formData, originalAmount: parseFloat(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Tipo de interés (%):</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.interestRate}
          onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Cuota mensual:</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.monthlyPayment}
          onChange={(e) => setFormData({...formData, monthlyPayment: parseFloat(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Meses restantes:</label>
        <input 
          type="number" 
          value={formData.remainingMonths}
          onChange={(e) => setFormData({...formData, remainingMonths: parseInt(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Crear</button>
      </div>
    </form>
  );
}

// Add Property Expense Form
function AddPropertyExpenseForm({ property, onClose, showToast }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    concept: '',
    amount: 0,
    category: 'Mantenimiento'
  });

  const categories = ['Mantenimiento', 'Reparaciones', 'Suministros', 'Seguros', 'Comunidad', 'Otros'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add expense as a document
    const newDocument = {
      id: Date.now(),
      fileName: `gasto_${property.address}_${Date.now()}.pdf`,
      provider: 'Gasto directo',
      concept: formData.concept,
      amount: formData.amount,
      category: formData.category,
      propertyId: property.id,
      status: 'Validada',
      isDeductible: true,
      uploadDate: formData.date
    };

    // Update property expenses
    const state = store.getState();
    const updatedProperties = state.properties.map(prop => 
      prop.id === property.id 
        ? { ...prop, monthlyExpenses: prop.monthlyExpenses + formData.amount }
        : prop
    );

    store.setState({ 
      documents: [...state.documents, newDocument],
      properties: updatedProperties
    });
    
    showToast('success', 'Gasto de explotación añadido');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <p><strong>Inmueble:</strong> {property.address}</p>
      <div className="form-group">
        <label>Fecha:</label>
        <input 
          type="date" 
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Concepto:</label>
        <input 
          type="text" 
          value={formData.concept}
          onChange={(e) => setFormData({...formData, concept: e.target.value})}
          placeholder="Descripción del gasto"
          required 
        />
      </div>
      <div className="form-group">
        <label>Importe:</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Categoría:</label>
        <select 
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Añadir</button>
      </div>
    </form>
  );
}

// Property Detail Content
function PropertyDetailContent({ property, onClose }) {
  const state = store.getState();
  const relatedDocuments = state.documents.filter(doc => doc.propertyId === property.id);
  const relatedMovements = state.movements.filter(mov => mov.propertyId === property.id);

  return (
    <div className="property-detail">
      <div className="property-info">
        <h4>Información del Inmueble</h4>
        <p><strong>Dirección:</strong> {property.address}</p>
        <p><strong>Ciudad:</strong> {property.city}</p>
        <p><strong>Tipo:</strong> {property.type}</p>
        <p><strong>Estado:</strong> {property.status}</p>
        <p><strong>Valor actual:</strong> €{property.currentValue?.toLocaleString('es-ES')}</p>
        <p><strong>Alquiler mensual:</strong> €{property.monthlyRent?.toLocaleString('es-ES')}</p>
        <p><strong>Gastos mensuales:</strong> €{property.monthlyExpenses?.toLocaleString('es-ES')}</p>
        <p><strong>Rentabilidad:</strong> {property.rentability}%</p>
      </div>
      
      <div className="property-kpis">
        <h4>KPIs del Inmueble</h4>
        <div className="kpi-grid">
          <div>Beneficio neto mensual: €{property.netProfit?.toLocaleString('es-ES')}</div>
          <div>Documentos asociados: {relatedDocuments.length}</div>
          <div>Movimientos este mes: {relatedMovements.length}</div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// Property P&L Content
function PropertyPLContent({ property, onClose }) {
  const state = store.getState();
  const relatedDocuments = state.documents.filter(doc => doc.propertyId === property.id && doc.status === 'Validada');
  const totalExpenses = relatedDocuments.reduce((sum, doc) => sum + doc.amount, 0);
  const monthlyIncome = property.monthlyRent || 0;
  const annualIncome = monthlyIncome * 12;
  const annualExpenses = totalExpenses;
  const netProfit = annualIncome - annualExpenses;

  return (
    <div className="property-pl">
      <h4>Análisis P&L - {property.address}</h4>
      
      <div className="pl-summary">
        <div className="pl-line">
          <span>Ingresos anuales:</span>
          <span>€{annualIncome.toLocaleString('es-ES')}</span>
        </div>
        <div className="pl-line">
          <span>Gastos anuales:</span>
          <span>€{annualExpenses.toLocaleString('es-ES')}</span>
        </div>
        <div className="pl-line total">
          <span>Beneficio neto:</span>
          <span>€{netProfit.toLocaleString('es-ES')}</span>
        </div>
        <div className="pl-line">
          <span>Rentabilidad:</span>
          <span>{((netProfit / property.currentValue) * 100).toFixed(2)}%</span>
        </div>
      </div>

      <div className="expense-breakdown">
        <h5>Desglose de gastos:</h5>
        {relatedDocuments.map(doc => (
          <div key={doc.id} className="expense-item">
            <span>{doc.concept}</span>
            <span>€{doc.amount.toLocaleString('es-ES')}</span>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}


// HITO 7: Multi-unit setup wizard
function MultiUnitSetupForm({ property, propertyId, onClose, showToast }) {
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState({
    unitCount: 3,
    unitNames: ["H1", "H2", "H3", "H4", "H5"],
    unitSqm: [null, null, null, null, null],
    unitRents: [0, 0, 0, 0, 0],
    unitStatuses: ["Libre", "Libre", "Libre", "Libre", "Libre"]
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete setup
      const config = {
        unitCount: setupData.unitCount,
        unitNames: setupData.unitNames.slice(0, setupData.unitCount),
        unitSqm: setupData.unitSqm.slice(0, setupData.unitCount),
        unitRents: setupData.unitRents.slice(0, setupData.unitCount)
      };

      try {
        store.setupMultiUnit(propertyId, config);
        showToast("success", `Multi-unidad configurado con ${setupData.unitCount} unidades`);
        onClose();
        // Refresh the page to show changes
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        showToast("error", `Error configurando Multi-unidad: ${error.message}`);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateUnitField = (index, field, value) => {
    const newData = { ...setupData };
    newData[field][index] = value;
    setSetupData(newData);
  };

  return (
    <div className="multi-unit-wizard">
      <div className="wizard-progress mb-4">
        <div className="flex items-center gap-4">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1. Estructura</div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2. Rentas</div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3. Confirmación</div>
        </div>
      </div>

      {step === 1 && (
        <div className="wizard-step">
          <h4>Estructura de Unidades</h4>
          <p>Configura la estructura básica del inmueble</p>
          
          <div className="form-group">
            <label>Número de unidades:</label>
            <select 
              value={setupData.unitCount}
              onChange={(e) => setSetupData({...setupData, unitCount: parseInt(e.target.value)})}
            >
              <option value={2}>2 unidades</option>
              <option value={3}>3 unidades</option>
              <option value={4}>4 unidades</option>
              <option value={5}>5 unidades</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nombres de las unidades:</label>
            {Array.from({length: setupData.unitCount}).map((_, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input 
                  type="text"
                  value={setupData.unitNames[index]}
                  onChange={(e) => updateUnitField(index, "unitNames", e.target.value)}
                  placeholder={`H${index + 1}`}
                  style={{flex: 1}}
                />
                <input 
                  type="number"
                  value={setupData.unitSqm[index] || ""}
                  onChange={(e) => updateUnitField(index, "unitSqm", parseFloat(e.target.value) || null)}
                  placeholder="m²"
                  style={{width: "80px"}}
                />
              </div>
            ))}
            <div className="text-sm text-gray">Los m² son opcionales pero permiten prorrateo por superficie</div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-step">
          <h4>Rentas por Unidad</h4>
          <p>Establece la renta mensual y estado inicial de cada unidad</p>
          
          {Array.from({length: setupData.unitCount}).map((_, index) => (
            <div key={index} className="form-group">
              <label>{setupData.unitNames[index]}:</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={setupData.unitRents[index]}
                  onChange={(e) => updateUnitField(index, "unitRents", parseFloat(e.target.value) || 0)}
                  placeholder="€/mes"
                  style={{flex: 1}}
                />
                <select 
                  value={setupData.unitStatuses[index]}
                  onChange={(e) => updateUnitField(index, "unitStatuses", e.target.value)}
                  style={{width: "120px"}}
                >
                  <option value="Libre">Libre</option>
                  <option value="Ocupada">Ocupada</option>
                </select>
              </div>
            </div>
          ))}
          
          <div className="mt-3 p-3" style={{background: "#F0F9FF", borderRadius: "6px"}}>
            <div className="text-sm">
              <strong>Total renta mensual:</strong> €{setupData.unitRents.slice(0, setupData.unitCount).reduce((sum, rent) => sum + rent, 0).toLocaleString("es-ES")}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-step">
          <h4>Confirmación</h4>
          <p>Revisa la configuración antes de aplicar los cambios</p>
          
          <div className="config-summary">
            <div className="mb-3">
              <strong>Inmueble:</strong> {property.address}
            </div>
            <div className="mb-3">
              <strong>Número de unidades:</strong> {setupData.unitCount}
            </div>
            <div className="mb-3">
              <strong>Configuración de unidades:</strong>
              <div style={{marginTop: "8px"}}>
                {Array.from({length: setupData.unitCount}).map((_, index) => (
                  <div key={index} className="flex justify-between p-2" style={{background: "#F9FAFB", marginBottom: "4px", borderRadius: "4px"}}>
                    <span>{setupData.unitNames[index]}</span>
                    <span>{setupData.unitSqm[index] ? `${setupData.unitSqm[index]}m²` : "Sin m²"}</span>
                    <span>€{setupData.unitRents[index]}/mes</span>
                    <span className={`chip ${setupData.unitStatuses[index] === "Ocupada" ? "success" : "warning"}`}>
                      {setupData.unitStatuses[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="alert" style={{background: "#FEF3C7", padding: "12px", borderRadius: "6px", border: "1px solid #F59E0B"}}>
            <strong>⚠️ Importante:</strong> Esta acción convertirá el inmueble a Multi-unidad. 
            Los contratos y gastos existentes se mantendrán a nivel de inmueble hasta que los reasignes a unidades específicas.
          </div>
        </div>
      )}

      <div className="modal-actions">
        {step > 1 && (
          <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
            Anterior
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleNext}>
          {step === 3 ? "Configurar Multi-unidad" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

// HITO 7: Manage units content
function ManageUnitsContent({ property, propertyId, onClose, showToast }) {
  const [activeTab, setActiveTab] = useState("units");
  const state = store.getState();
  
  const units = property.units || [];
  const unitContracts = state.unitContracts.filter(contract => 
    units.some(unit => unit.id === contract.unitId)
  );

  return (
    <div className="manage-units">
      <div className="property-header mb-4">
        <h4>{property.address}</h4>
        <div className="text-sm text-gray">
          Multi-unidad: {units.length} unidades · 
          Ocupadas: {units.filter(u => u.status === "Ocupada").length}
        </div>
      </div>

      <div className="tabs mb-4">
        <button 
          className={`btn btn-sm ${activeTab === "units" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("units")}
        >
          Unidades
        </button>
        <button 
          className={`btn btn-sm ${activeTab === "contracts" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("contracts")}
        >
          Contratos
        </button>
        <button 
          className={`btn btn-sm ${activeTab === "kpis" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("kpis")}
        >
          KPIs
        </button>
      </div>

      {activeTab === "units" && (
        <div className="units-tab">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>m²</th>
                  <th>Renta/Mes</th>
                  <th>Estado</th>
                  <th>Ocupación %</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  <tr key={unit.id}>
                    <td><strong>{unit.name}</strong></td>
                    <td>{unit.sqm || "-"}</td>
                    <td>€{unit.monthlyRent.toLocaleString("es-ES")}</td>
                    <td>
                      <span className={`chip ${unit.status === "Ocupada" ? "success" : "warning"}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td>
                      {unit.status === "Ocupada" ? "100%" : "0%"}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div className="contracts-tab">
          <div className="mb-3">
            <button className="btn btn-primary btn-sm">
              + Nuevo contrato
            </button>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Inquilino</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Renta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {unitContracts.map(contract => {
                  const unit = units.find(u => u.id === contract.unitId);
                  return (
                    <tr key={contract.id}>
                      <td><strong>{unit?.name}</strong></td>
                      <td>{contract.tenant}</td>
                      <td>{contract.startDate}</td>
                      <td>{contract.endDate}</td>
                      <td>€{contract.monthlyAmount.toLocaleString("es-ES")}</td>
                      <td>
                        <span className={`chip ${contract.status === "Activo" ? "success" : "warning"}`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {unitContracts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray">
                      No hay contratos por unidad registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "kpis" && (
        <div className="kpis-tab">
          <div className="grid-3 gap-4 mb-4">
            <div className="card" style={{background: "#F9FAFB"}}>
              <div className="text-sm text-gray">Ingresos Totales</div>
              <div className="font-semibold" style={{fontSize: "18px", color: "var(--success)"}}>
                €{units.reduce((sum, unit) => sum + unit.monthlyRent, 0).toLocaleString("es-ES")}/mes
              </div>
            </div>
            <div className="card" style={{background: "#F9FAFB"}}>
              <div className="text-sm text-gray">Ocupación Media</div>
              <div className="font-semibold" style={{fontSize: "18px", color: "var(--teal)"}}>
                {((units.filter(u => u.status === "Ocupada").length / units.length) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="card" style={{background: "#F9FAFB"}}>
              <div className="text-sm text-gray">Unidades Activas</div>
              <div className="font-semibold" style={{fontSize: "18px", color: "var(--navy)"}}>
                {units.filter(u => u.status === "Ocupada").length}/{units.length}
              </div>
            </div>
          </div>

          <div className="units-breakdown">
            <h5>Desglose por Unidad</h5>
            {units.map(unit => {
              const unitContract = unitContracts.find(c => c.unitId === unit.id && c.status === "Activo");
              return (
                <div key={unit.id} className="unit-card mb-3 p-3" style={{background: "#F9FAFB", borderRadius: "6px"}}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <strong>{unit.name}</strong>
                      {unit.sqm && <span className="text-sm text-gray ml-2">{unit.sqm}m²</span>}
                    </div>
                    <span className={`chip ${unit.status === "Ocupada" ? "success" : "warning"}`}>
                      {unit.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-gray">Renta mensual</div>
                      <div className="font-semibold">€{unit.monthlyRent.toLocaleString("es-ES")}</div>
                    </div>
                    {unitContract && (
                      <div>
                        <div className="text-sm text-gray">Inquilino</div>
                        <div className="font-semibold">{unitContract.tenant}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray">Ingresos anuales</div>
                      <div className="font-semibold">€{(unit.monthlyRent * 12).toLocaleString("es-ES")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}


// HITO 7: Document allocation form
function DocumentAllocationForm({ document, property, documentId, onClose, showToast }) {
  const [allocationMethod, setAllocationMethod] = useState("units");
  const [customPercentages, setCustomPercentages] = useState({});
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [excludedUnits, setExcludedUnits] = useState([]);
  
  const state = store.getState();
  const units = property.units || [];

  // Get suggested allocation based on expense family
  useEffect(() => {
    if (document.expenseFamily) {
      const suggested = store.getSuggestedAllocation(document.expenseFamily, property.id);
      setAllocationMethod(suggested);
    }
  }, [document.expenseFamily, property.id]);

  // Initialize custom percentages
  useEffect(() => {
    const initialPercentages = {};
    units.forEach(unit => {
      initialPercentages[unit.id] = 100 / units.length;
    });
    setCustomPercentages(initialPercentages);
  }, [units]);

  const calculateDistribution = () => {
    return store.calculateAllocationDistribution(
      property.id, 
      allocationMethod, 
      selectedUnits, 
      customPercentages
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const distribution = calculateDistribution();
    
    // Validate custom percentages sum to 100%
    if (allocationMethod === "custom") {
      const total = Object.values(customPercentages).reduce((sum, pct) => sum + pct, 0);
      if (Math.abs(total - 100) > 0.01) {
        showToast("error", "Los porcentajes deben sumar 100%");
        return;
      }
    }

    // Apply allocation
    const allocation = {
      method: allocationMethod,
      distribution,
      excludedUnits,
      allocatedAt: new Date().toISOString()
    };

    // Calculate actual amounts
    Object.keys(distribution).forEach(unitId => {
      allocation.distribution[unitId].amount = (document.amount * distribution[unitId].percentage) / 100;
    });

    store.allocateDocument(documentId, allocation);
    showToast("success", "Prorrateo aplicado correctamente");
    onClose();
  };

  const getMethodDescription = () => {
    switch (allocationMethod) {
      case "occupied":
        return "Solo unidades con contratos activos";
      case "total":
        return "Todas las unidades por igual";
      case "sqm":
        return "Proporcional a los metros cuadrados";
      case "custom":
        return "Porcentajes personalizados";
      case "specific":
        return "Unidades específicas seleccionadas";
      case "no_divide":
        return "No dividir, mantener a nivel inmueble";
      default:
        return "";
    }
  };

  const occupiedUnits = units.filter(unit => unit.status === "Ocupada");
  const totalSqm = units.reduce((sum, unit) => sum + (unit.sqm || 0), 0);

  return (
    <div className="allocation-form">
      <div className="document-info mb-4 p-3" style={{background: "#F9FAFB", borderRadius: "6px"}}>
        <div><strong>Documento:</strong> {document.provider} - {document.concept}</div>
        <div><strong>Importe:</strong> €{document.amount.toLocaleString("es-ES")}</div>
        <div><strong>Inmueble:</strong> {property.address} ({units.length} unidades)</div>
        {document.expenseFamily && (
          <div><strong>Familia:</strong> {state.expenseFamilies.find(ef => ef.id === document.expenseFamily)?.name}</div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Método de Prorrateo:</label>
          <select 
            value={allocationMethod}
            onChange={(e) => setAllocationMethod(e.target.value)}
          >
            <option value="occupied">Ocupadas ({occupiedUnits.length}/{units.length})</option>
            <option value="total">Totales ({units.length}/{units.length})</option>
            {totalSqm > 0 && <option value="sqm">Por m² ({totalSqm}m² total)</option>}
            <option value="custom">Personalizado (%)</option>
            <option value="specific">Unidad específica</option>
            <option value="no_divide">No dividir</option>
          </select>
          <div className="text-sm text-gray">{getMethodDescription()}</div>
        </div>

        {allocationMethod === "custom" && (
          <div className="form-group">
            <label>Porcentajes por Unidad:</label>
            {units.map(unit => (
              <div key={unit.id} className="flex items-center gap-2 mb-2">
                <span style={{minWidth: "60px"}}>{unit.name}:</span>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customPercentages[unit.id] || 0}
                  onChange={(e) => setCustomPercentages({
                    ...customPercentages,
                    [unit.id]: parseFloat(e.target.value) || 0
                  })}
                  style={{width: "80px"}}
                />
                <span>%</span>
                <span className="text-sm text-gray">
                  = €{((document.amount * (customPercentages[unit.id] || 0)) / 100).toLocaleString("es-ES")}
                </span>
              </div>
            ))}
            <div className="text-sm">
              <strong>Total: {Object.values(customPercentages).reduce((sum, pct) => sum + pct, 0).toFixed(1)}%</strong>
            </div>
          </div>
        )}

        {allocationMethod === "specific" && (
          <div className="form-group">
            <label>Seleccionar Unidades:</label>
            {units.map(unit => (
              <label key={unit.id} className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox"
                  checked={selectedUnits.includes(unit.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUnits([...selectedUnits, unit.id]);
                    } else {
                      setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                    }
                  }}
                />
                <span>{unit.name}</span>
                <span className="text-sm text-gray">
                  {unit.sqm && `${unit.sqm}m²`} · €{unit.monthlyRent}/mes · {unit.status}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Preview */}
        {allocationMethod !== "no_divide" && (
          <div className="allocation-preview mt-4 p-3" style={{background: "#F0F9FF", borderRadius: "6px"}}>
            <h5>Vista Previa del Prorrateo:</h5>
            <div className="preview-items">
              {Object.entries(calculateDistribution()).map(([unitId, allocation]) => {
                const unit = units.find(u => u.id == unitId);
                if (!unit) return null;
                return (
                  <div key={unitId} className="flex justify-between py-1">
                    <span>{unit.name}</span>
                    <span>{allocation.percentage.toFixed(1)}%</span>
                    <span>€{((document.amount * allocation.percentage) / 100).toLocaleString("es-ES")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Aplicar Prorrateo
          </button>
        </div>
      </form>
    </div>
  );
}


// H11: Enhanced Loan Creation Wizard (3 steps + 2.5 optional)
function CreateLoanWizard({ properties, onClose, showToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic data
    propertyId: '',
    banco: '',
    tipo: 'fijo', // fijo, variable, mixto
    principal_inicial: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    plazo_meses: 240,
    metodo: 'Frances',
    frecuencia: 'mensual',
    // Commissions (optional)
    comision_apertura_pct: 0,
    comision_apertura_eur: 0,
    comision_prepago_pct: 0,
    documento_adjunto: null,
    
    // Step 2: Interest type
    tna_fijo: 3.0,
    // Variable
    indice_label: 'Euríbor 12m',
    spread_bps: 150,
    freq_revision_meses: 12,
    fecha_proxima_revision: '',
    indice_vigente: 3.5,
    // Mixto
    mixto_tramo_fijo: { meses: 24, tna_fijo: 2.5 },
    
    // Step 2.5: Vinculaciones (optional)
    plantilla_banco: '',
    vinculaciones_seleccionadas: [],
    
    // Step 3: Proration
    prorrateo: { 
      metodo: 'sqm', // sqm, units, percentage, specific, no_divide
      distribuciones: {} 
    },
    
    // Fiscal
    interes_deducible: true
  });

  const [calculatedData, setCalculatedData] = useState({
    cuota_inicial: 0,
    tae_orientativa: 0,
    fecha_vencimiento: '',
    cuadro_preview: []
  });

  // Step navigation
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      if (step === 2) {
        calculateLoanPreview();
      }
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  // Calculate loan preview for step 3
  const calculateLoanPreview = () => {
    const { principal_inicial, plazo_meses, tipo, tna_fijo, spread_bps, indice_vigente } = formData;
    
    let efectiveTNA = tipo === 'fijo' ? tna_fijo : (indice_vigente + (spread_bps / 100));
    if (tipo === 'mixto') {
      efectiveTNA = formData.mixto_tramo_fijo.tna_fijo; // First period
    }
    
    const monthlyRate = efectiveTNA / 100 / 12;
    const cuota_inicial = (principal_inicial * monthlyRate * Math.pow(1 + monthlyRate, plazo_meses)) / 
                         (Math.pow(1 + monthlyRate, plazo_meses) - 1);
    
    // Simple TAE calculation (without commissions for now)
    const tae_orientativa = efectiveTNA;
    
    const fecha_vencimiento = new Date(formData.fecha_inicio);
    fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + plazo_meses);
    
    setCalculatedData({
      cuota_inicial: Math.round(cuota_inicial * 100) / 100,
      tae_orientativa: Math.round(tae_orientativa * 100) / 100,
      fecha_vencimiento: fecha_vencimiento.toISOString().split('T')[0],
      cuadro_preview: [] // Generate first few entries if needed
    });
  };

  // Submit loan creation
  const handleSubmit = () => {
    const newLoan = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      pendingCapital: formData.principal_inicial,
      monthlyPayment: calculatedData.cuota_inicial,
      remainingMonths: formData.plazo_meses,
      endDate: calculatedData.fecha_vencimiento,
      interestRate: formData.tipo === 'fijo' ? formData.tna_fijo : (formData.indice_vigente + (formData.spread_bps / 100))
    };

    const enhancedLoan = store.addLoan(newLoan);
    
    showToast('success', "Préstamo ${formData.banco} creado correctamente");
    onClose();
  };

  const formatCurrency = (amount) => {
    if (isNaN(amount)) return '—';
    return "${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €";
  };

  return (
    <div className="loan-wizard">
      <div className="flex gap-2 justify-end mt-6">
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        {step > 1 && (
          <button
            onClick={handlePrevious}
            className="btn btn-secondary"
          >
            Anterior
          </button>
        )}
        <button
          onClick={handleNext}
          className="btn btn-primary"
        >
          {step === 3 ? 'Crear Préstamo' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
