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
    addPropertyExpense: 'Añadir Gasto de Explotación'
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
    isDeductible: invoice.isDeductible || false
  });

  const state = store.getState();

  const handleSubmit = (e) => {
    e.preventDefault();
    store.updateDocument(invoice.id, formData);
    showToast('success', 'Factura actualizada');
    onClose();
  };

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
      <div className="form-group">
        <label>Inmueble:</label>
        <select 
          value={formData.propertyId}
          onChange={(e) => setFormData({...formData, propertyId: e.target.value ? parseInt(e.target.value) : null})}
        >
          <option value="">Sin asignar</option>
          {state.properties.map(property => (
            <option key={property.id} value={property.id}>{property.name}</option>
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
          Gasto deducible
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
