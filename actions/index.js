// ATLAS Actions - Action handlers for the ActionBridge
// HITO 4 - Connect buttons functionality

import store from '../store/index.js';

// Helper function to show notifications
const showToast = (type, message) => {
  const event = new CustomEvent('atlas:toast', {
    detail: { type, message }
  });
  document.dispatchEvent(event);
};

// Helper function to show modal
const showModal = (modalId, data = {}) => {
  const event = new CustomEvent('atlas:modal', {
    detail: { modalId, data }
  });
  document.dispatchEvent(event);
};

// Document/Invoice Actions
export const processOCR = () => {
  const state = store.getState();
  const inboxFiles = state.inboxEntries.filter(entry => 
    entry.status === 'Pendiente de procesamiento' || entry.status === 'Error lectura'
  );
  
  if (inboxFiles.length === 0) {
    showToast('warning', 'No hay archivos para procesar');
    return;
  }

  // Simulate loading delay
  setTimeout(() => {
    // Simulate realistic OCR processing with credible provider/concept/amounts
    const ocrProviders = ['Iberdrola', 'Gas Natural', 'Mapfre', 'AXA', 'Fontanería García', 'Comunidad Propietarios', 'Telefónica', 'Aqualia'];
    const ocrConcepts = ['Suministro eléctrico', 'Suministro gas', 'Seguro hogar', 'Reparación', 'Cuota comunidad', 'Telefonía', 'Agua'];
    const categories = ['Suministros', 'Seguros', 'Mantenimiento', 'Comunidad', 'Comunicaciones'];

    const newDocuments = inboxFiles.map((file, index) => ({
      id: Date.now() + Math.random() + index,
      fileName: file.fileName,
      provider: ocrProviders[Math.floor(Math.random() * ocrProviders.length)],
      concept: ocrConcepts[Math.floor(Math.random() * ocrConcepts.length)],
      amount: Math.floor(Math.random() * 300) + 50, // Random amount between 50-350
      category: categories[Math.floor(Math.random() * categories.length)],
      propertyId: null,
      status: 'Pendiente',
      isDeductible: true,
      uploadDate: new Date().toISOString(),
      documentUrl: file.url || null
    }));

    // Update inbox entries status to processed
    const updatedInboxEntries = state.inboxEntries.map(entry => 
      inboxFiles.find(f => f.id === entry.id) 
        ? { ...entry, status: 'Leído', provider: `Detectado: ${newDocuments.find(d => d.fileName === entry.fileName)?.provider}` }
        : entry
    );

    // Add documents to store
    const currentDocuments = state.documents;
    store.setState({ 
      documents: [...currentDocuments, ...newDocuments],
      inboxEntries: updatedInboxEntries
    });

    showToast('success', `${newDocuments.length} facturas procesadas con OCR`);
  }, 300);
};

export const clearUpload = () => {
  store.setState({ inboxEntries: [] });
  showToast('success', 'Archivos de subida limpiados');
};

export const sendToInvoices = (id) => {
  const state = store.getState();
  const inboxEntry = state.inboxEntries.find(entry => entry.id == id);
  
  if (!inboxEntry) {
    showToast('error', 'Archivo no encontrado en Inbox');
    return;
  }

  // Simulate sending to invoices with delay
  setTimeout(() => {
    // Create new document from inbox entry
    const newDocument = {
      id: Date.now() + Math.random(),
      fileName: inboxEntry.fileName,
      provider: inboxEntry.provider.replace('Detectado: ', '') || 'Proveedor Desconocido',
      concept: 'Concepto por determinar',
      amount: Math.floor(Math.random() * 200) + 50,
      category: 'Otros',
      propertyId: null,
      status: 'Pendiente',
      isDeductible: true,
      uploadDate: new Date().toISOString(),
      documentUrl: inboxEntry.url || null
    };

    // Add to documents and remove from inbox
    const currentDocuments = state.documents;
    const updatedInboxEntries = state.inboxEntries.filter(entry => entry.id != id);
    
    store.setState({ 
      documents: [...currentDocuments, newDocument],
      inboxEntries: updatedInboxEntries
    });

    showToast('success', 'Documento enviado a Facturas');
  }, 300);
};

export const editInvoice = (id) => {
  const state = store.getState();
  const invoice = state.documents.find(doc => doc.id == id);
  if (!invoice) {
    showToast('error', 'Factura no encontrada');
    return;
  }
  showModal('editInvoice', { invoice });
};

export const viewInvoice = (id) => {
  const state = store.getState();
  const invoice = state.documents.find(doc => doc.id == id);
  if (!invoice) {
    showToast('error', 'Factura no encontrada');
    return;
  }
  showModal('viewInvoice', { invoice });
};

export const assignProperty = (id) => {
  const state = store.getState();
  const invoice = state.documents.find(doc => doc.id == id);
  if (!invoice) {
    showToast('error', 'Factura no encontrada');
    return;
  }
  showModal('assignProperty', { invoice, properties: state.properties });
};

export const deleteInvoice = (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;
  
  store.deleteDocument(parseInt(id));
  showToast('success', 'Factura eliminada');
};

export const validateInvoice = (id) => {
  setTimeout(() => {
    const state = store.getState();
    const invoice = state.documents.find(doc => doc.id == id);
    if (!invoice) {
      showToast('error', 'Factura no encontrada');
      return;
    }
    
    store.updateDocument(parseInt(id), { status: 'Validada' });
    showToast('success', 'Factura validada');
  }, 400);
};

// Export Actions
export const exportDeductiblesCSV = () => {
  const state = store.getState();
  const deductibleInvoices = state.documents.filter(doc => 
    doc.status === 'Validada' && doc.isDeductible
  );

  if (deductibleInvoices.length === 0) {
    showToast('warning', 'No hay gastos deducibles para exportar');
    return;
  }

  // Create CSV content
  const headers = ['Fecha', 'Proveedor', 'Concepto', 'Importe', 'Categoría', 'Inmueble'];
  const csvContent = [
    headers.join(','),
    ...deductibleInvoices.map(invoice => [
      invoice.uploadDate.split('T')[0],
      `"${invoice.provider}"`,
      `"${invoice.concept}"`,
      invoice.amount.toFixed(2),
      `"${invoice.category}"`,
      `"${getPropertyName(invoice.propertyId, state.properties)}"`
    ].join(','))
  ].join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `gastos-deducibles-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  showToast('success', 'Archivo CSV descargado');
};

export const exportFiscalPDF = () => {
  // Open fiscal summary in new window for printing
  const state = store.getState();
  const fiscalData = calculateFiscalSummary(state.documents);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(generateFiscalPrintHTML(fiscalData, state));
  printWindow.document.close();
  printWindow.focus();
  
  showToast('success', 'Informe fiscal abierto para impresión');
};

// Treasury Actions
export const treasuryTransfer = (data = {}) => {
  showModal('treasuryTransfer', { accounts: store.getState().accounts });
};

export const addAlert = (data) => {
  const alert = {
    id: Date.now(),
    type: data.type || 'reminder',
    message: data.message || 'Nueva alerta',
    date: data.date || new Date().toISOString(),
    status: 'active'
  };
  
  const state = store.getState();
  store.setState({ alerts: [...state.alerts, alert] });
  showToast('success', 'Alerta añadida');
};

export const dismissAlert = (id) => {
  const state = store.getState();
  const alerts = state.alerts.filter(alert => alert.id != id);
  store.setState({ alerts });
  showToast('success', 'Alerta descartada');
};

// Additional treasury actions
export const toggleTreasuryRule = (id) => {
  setTimeout(() => {
    const state = store.getState();
    const treasuryRules = state.treasuryRules.map(rule => 
      rule.id == id ? { ...rule, active: !rule.active } : rule
    );
    store.setState({ treasuryRules });
    showToast('success', 'Regla de tesorería actualizada');
  }, 250);
};

export const editTreasuryRule = (id) => {
  showToast('info', 'Edición de reglas de tesorería disponible próximamente');
};

export const toggleMovementStatus = (id) => {
  setTimeout(() => {
    const state = store.getState();
    const statusCycle = ['Regla aplicada', 'Pendiente', 'Excepción'];
    
    const movements = state.movements.map(movement => {
      if (movement.id == id) {
        const currentIndex = statusCycle.indexOf(movement.status);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        return { ...movement, status: statusCycle[nextIndex] };
      }
      return movement;
    });
    
    store.setState({ movements });
    showToast('success', 'Estado del movimiento actualizado');
  }, 200);
};

export const registerIncome = () => {
  showModal('registerIncome', { accounts: store.getState().accounts });
};

export const connectAccount = () => {
  showToast('info', 'Conexión de nueva cuenta disponible próximamente');
};

export const generateTreasuryReport = () => {
  showToast('info', 'Generación de informes disponible próximamente');
};

// Movement actions
export const movementAction = (action, id) => {
  switch (action) {
    case 'movement:assign-document':
      showModal('assignMovementDocument', { movementId: id, documents: store.getState().documents });
      break;
    case 'movements:view-all':
      showToast('info', 'Vista completa de movimientos disponible próximamente');
      break;
    default:
      showToast('warning', `Acción de movimiento ${action} no implementada`);
  }
};

// Loan Actions
export const amortizeLoan = (id) => {
  const state = store.getState();
  const loan = state.loans.find(loan => loan.id == id);
  if (!loan) {
    showToast('error', 'Préstamo no encontrado');
    return;
  }
  showModal('amortizeLoan', { loan });
};

export const editLoan = (id) => {
  const state = store.getState();
  const loan = state.loans.find(loan => loan.id == id);
  if (!loan) {
    showToast('error', 'Préstamo no encontrado');
    return;
  }
  showModal('editLoan', { loan, properties: state.properties });
};

export const deleteLoan = (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este préstamo?')) return;
  
  const state = store.getState();
  const loans = state.loans.filter(loan => loan.id != id);
  store.setState({ loans });
  showToast('success', 'Préstamo eliminado');
};

// Property Actions
export const viewPropertyPL = (id) => {
  const state = store.getState();
  const property = state.properties.find(prop => prop.id == id);
  if (!property) {
    showToast('error', 'Inmueble no encontrado');
    return;
  }
  showModal('propertyPL', { property });
};

export const viewPropertyDetail = (id) => {
  const state = store.getState();
  const property = state.properties.find(prop => prop.id == id);
  if (!property) {
    showToast('error', 'Inmueble no encontrado');
    return;
  }
  showModal('propertyDetail', { property });
};

export const deleteProperty = (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este inmueble?')) return;
  
  const state = store.getState();
  const properties = state.properties.filter(prop => prop.id != id);
  
  // Unassign documents from this property
  const documents = state.documents.map(doc => 
    doc.propertyId == id ? { ...doc, propertyId: null } : doc
  );
  
  store.setState({ properties, documents });
  showToast('success', 'Inmueble eliminado');
};

export const togglePropertyStatus = (id) => {
  setTimeout(() => {
    const state = store.getState();
    const properties = state.properties.map(property => {
      if (property.id == id) {
        const newStatus = property.status === 'Ocupado' ? 'Disponible' : 'Ocupado';
        const occupancy = newStatus === 'Ocupado' ? 100 : 0;
        return { 
          ...property, 
          status: newStatus, 
          occupancy,
          tenant: newStatus === 'Ocupado' ? 'Nuevo inquilino' : null,
          contractStart: newStatus === 'Ocupado' ? new Date().toISOString().split('T')[0] : null,
          contractEnd: newStatus === 'Ocupado' ? new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0] : null
        };
      }
      return property;
    });
    
    store.setState({ properties });
    showToast('success', 'Estado del inmueble actualizado');
  }, 300);
};

export const addPropertyExpense = (id) => {
  const state = store.getState();
  const property = state.properties.find(prop => prop.id == id);
  if (!property) {
    showToast('error', 'Inmueble no encontrado');
    return;
  }
  showModal('addPropertyExpense', { property });
};

export const createLoan = () => {
  showModal('createLoanWizard', { properties: store.getState().properties });
};

export const linkLoanToProperty = () => {
  const state = store.getState();
  const unlinkedLoans = state.loans.filter(loan => !loan.propertyId);
  if (unlinkedLoans.length === 0) {
    showToast('info', 'Todos los préstamos ya están vinculados a inmuebles');
    return;
  }
  showModal('linkLoanProperty', { loans: unlinkedLoans, properties: state.properties });
};

// Quick close actions
export const quickCloseAction = (action, id, data) => {
  switch (action) {
    case 'invoice:attach-document':
      showToast('info', 'Adjuntar documento - Funcionalidad disponible próximamente');
      break;
    case 'invoice:request-duplicate':
      showToast('info', 'Solicitud de duplicado enviada (simulado)');
      break;
    case 'invoice:upload-photo':
      showToast('info', 'Subir foto - Funcionalidad disponible próximamente');
      break;
    case 'invoice:resolve-all':
      showToast('success', 'Procesando resolución de todas las facturas pendientes (simulado)');
      break;
    default:
      showToast('warning', `Acción ${action} no implementada aún`);
  }
};

// Helper functions
const getPropertyName = (propertyId, properties) => {
  if (!propertyId) return 'Sin asignar';
  const property = properties.find(prop => prop.id === propertyId);
  return property ? property.name : 'Inmueble no encontrado';
};

const calculateFiscalSummary = (documents) => {
  return {
    deductible: documents.filter(d => d.isDeductible && d.status === 'Validada').reduce((sum, d) => sum + d.amount, 0),
    nonDeductible: documents.filter(d => !d.isDeductible && d.status === 'Validada').reduce((sum, d) => sum + d.amount, 0),
    pending: documents.filter(d => d.status === 'Pendiente').reduce((sum, d) => sum + d.amount, 0),
    total: documents.filter(d => d.status === 'Validada').reduce((sum, d) => sum + d.amount, 0)
  };
};

const generateFiscalPrintHTML = (fiscalData, state) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Informe Fiscal - ATLAS</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { margin: 20px 0; }
        .summary table { width: 100%; border-collapse: collapse; }
        .summary th, .summary td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .summary th { background-color: #f5f5f5; }
        .amount { text-align: right; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ATLAS - Informe Fiscal</h1>
        <p>Generado el ${new Date().toLocaleDateString('es-ES')}</p>
      </div>
      <div class="summary">
        <h2>Resumen Fiscal</h2>
        <table>
          <tr><th>Concepto</th><th>Importe</th></tr>
          <tr><td>Gastos Deducibles</td><td class="amount">€${fiscalData.deductible.toLocaleString('es-ES', {minimumFractionDigits: 2})}</td></tr>
          <tr><td>Gastos No Deducibles</td><td class="amount">€${fiscalData.nonDeductible.toLocaleString('es-ES', {minimumFractionDigits: 2})}</td></tr>
          <tr><td>Pendientes de Validar</td><td class="amount">€${fiscalData.pending.toLocaleString('es-ES', {minimumFractionDigits: 2})}</td></tr>
          <tr><th>Total Gastos</th><th class="amount">€${fiscalData.total.toLocaleString('es-ES', {minimumFractionDigits: 2})}</th></tr>
        </table>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `;
};

// Demo Actions
export const loadDemo = () => {
  if (!confirm('¿Estás seguro de que quieres cargar los datos de ejemplo? Esto sobrescribirá todos los datos actuales.')) return;
  
  store.resetDemo();
  showToast('success', 'Datos de ejemplo cargados');
  
  // Refresh the page to reflect changes
  setTimeout(() => window.location.reload(), 1000);
};

// HITO 7: Multi-unit property actions

export const togglePropertyMultiUnit = (propertyId, element) => {
  const state = store.getState();
  const property = state.properties.find(p => p.id == propertyId);
  
  if (!property) {
    showToast('error', 'Inmueble no encontrado');
    return;
  }

  const isChecked = element.querySelector('input[type="checkbox"]').checked;
  
  if (isChecked && !property.multiUnit) {
    // Enabling multi-unit - show setup wizard
    showModal('multi-unit-setup', { propertyId: propertyId, property: property });
  } else if (!isChecked && property.multiUnit) {
    // Disabling multi-unit - confirm and convert back to single unit
    if (confirm('¿Estás seguro de que quieres desactivar Multi-unidad? Se perderán los datos de unidades individuales.')) {
      store.togglePropertyMultiUnit(propertyId, false);
      showToast('success', 'Multi-unidad desactivado');
    } else {
      // Revert checkbox state
      element.querySelector('input[type="checkbox"]').checked = true;
    }
  }
};

export const managePropertyUnits = (propertyId) => {
  const state = store.getState();
  const property = state.properties.find(p => p.id == propertyId);
  
  if (!property || !property.multiUnit) {
    showToast('error', 'Este inmueble no tiene Multi-unidad activado');
    return;
  }

  showModal('manage-units', { propertyId: propertyId, property: property });
};

export const setupMultiUnit = (propertyId, config) => {
  const state = store.getState();
  const property = state.properties.find(p => p.id == propertyId);
  
  if (!property) {
    showToast('error', 'Inmueble no encontrado');
    return;
  }

  try {
    store.setupMultiUnit(propertyId, config);
    showToast('success', `Multi-unidad configurado con ${config.unitCount} unidades`);
  } catch (error) {
    showToast('error', `Error configurando Multi-unidad: ${error.message}`);
  }
};

// HITO 7: Document allocation action
export const allocateDocument = (documentId) => {
  const state = store.getState();
  const document = state.documents.find(d => d.id == documentId);
  
  if (!document) {
    showToast('error', 'Documento no encontrado');
    return;
  }

  const property = state.properties.find(p => p.id === document.propertyId);
  if (!property || !property.multiUnit) {
    showToast('error', 'Este documento no está asignado a un inmueble multi-unidad');
    return;
  }

  showModal('document-allocation', { 
    document: document, 
    property: property,
    documentId: documentId 
  });
};