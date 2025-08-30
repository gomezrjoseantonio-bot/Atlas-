// ATLAS ActionBridge - Centralized click handler
// HITO 4 - Connect buttons functionality

import store from '../store/index.js';
import * as actions from './index.js';

class ActionBridge {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || typeof document === 'undefined') return;
    
    // Listen for clicks at document level
    document.addEventListener('click', this.handleClick.bind(this));
    this.isInitialized = true;
    console.log('ActionBridge initialized');
  }

  handleClick(event) {
    const element = event.target.closest('[data-action]');
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();

    const action = element.getAttribute('data-action');
    const id = element.getAttribute('data-id');
    const extraData = element.getAttribute('data-extra');

    let parsedExtra = {};
    if (extraData) {
      try {
        parsedExtra = JSON.parse(extraData);
      } catch (error) {
        console.warn('Failed to parse data-extra:', extraData, error);
      }
    }

    this.executeAction(action, id, parsedExtra, element);
  }

  executeAction(action, id, extraData, element) {
    console.log('Executing action:', action, 'with id:', id, 'extra:', extraData);

    // Normalize action (case-insensitive, handle accents)
    const normalizedAction = action.toLowerCase()
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
      .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');

    try {
      switch (normalizedAction) {
        // Document/Invoice actions
        case 'invoice:process-ocr':
          actions.processOCR();
          break;
        case 'invoice:clear-upload':
          actions.clearUpload();
          break;
        case 'invoice:edit':
          actions.editInvoice(id);
          break;
        case 'invoice:view':
          actions.viewInvoice(id);
          break;
        case 'invoice:assign-property':
          actions.assignProperty(id);
          break;
        case 'invoice:delete':
          actions.deleteInvoice(id);
          break;
        case 'invoice:validate':
        case 'invoice:verify':
          actions.validateInvoice(id);
          break;
        case 'inbox:send-to-invoices':
          actions.sendToInvoices(id);
          break;

        // Export actions
        case 'export:deductibles-csv':
          actions.exportDeductiblesCSV();
          break;
        case 'export:fiscal-pdf':
          actions.exportFiscalPDF();
          break;

        // Treasury actions
        case 'treasury:transfer':
          actions.treasuryTransfer(extraData);
          break;
        case 'treasury:toggle-rule':
          actions.toggleTreasuryRule(id);
          break;
        case 'treasury:edit-rule':
          actions.editTreasuryRule(id);
          break;
        case 'treasury:register-income':
          actions.registerIncome();
          break;
        case 'treasury:connect-account':
          actions.connectAccount();
          break;
        case 'treasury:generate-report':
          actions.generateTreasuryReport();
          break;

        // Movement actions
        case 'movement:assign-document':
        case 'movements:view-all':
          actions.movementAction(normalizedAction, id);
          break;
        case 'movement:toggle-status':
          actions.toggleMovementStatus(id);
          break;

        case 'alert:add':
          actions.addAlert(extraData);
          break;
        case 'alert:dismiss':
          actions.dismissAlert(id);
          break;

        // Loan actions
        case 'loan:amortize':
          actions.amortizeLoan(id);
          break;
        case 'loan:edit':
          actions.editLoan(id);
          break;
        case 'loan:delete':
          actions.deleteLoan(id);
          break;
        case 'loan:create':
          actions.createLoan();
          break;
        case 'loan:link-property':
          actions.linkLoanToProperty();
          break;

        // Property actions
        case 'property:view-pl':
          actions.viewPropertyPL(id);
          break;
        case 'property:view-detail':
          actions.viewPropertyDetail(id);
          break;
        case 'property:delete':
          actions.deleteProperty(id);
          break;
        case 'property:toggle-status':
          actions.togglePropertyStatus(id);
          break;
        case 'property:add-expense':
          actions.addPropertyExpense(id);
          break;

        // Demo actions
        case 'demo:load':
          actions.loadDemo();
          break;

        // Additional actions
        case 'invoice:attach-document':
        case 'invoice:request-duplicate':
        case 'invoice:upload-photo':
        case 'invoice:resolve-all':
          actions.quickCloseAction(normalizedAction, id, extraData);
          break;

        default:
          console.warn('Unknown action:', action);
          this.showToast('error', `Acción no reconocida: ${action}`);
      }
    } catch (error) {
      console.error('Error executing action:', action, error);
      this.showToast('error', `Error ejecutando acción: ${error.message}`);
    }
  }

  // Helper method to show toast notifications
  showToast(type, message) {
    const event = new CustomEvent('atlas:toast', {
      detail: { type, message }
    });
    document.dispatchEvent(event);
  }

  // Clean up event listeners
  destroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.handleClick);
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
const actionBridge = new ActionBridge();

export default actionBridge;