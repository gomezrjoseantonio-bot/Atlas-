// ATLAS Store - Central state management with localStorage persistence
// HITO 4 - Connect buttons functionality

import { mockData } from '../data/mockData.js';

class AtlasStore {
  constructor() {
    this.storageKey = 'atlas-store';
    this.state = this.getInitialState();
    this.subscribers = [];
  }

  getInitialState() {
    return {
      accounts: [],
      properties: [],
      loans: [],
      documents: [],
      inboxEntries: [],
      movements: [],
      alerts: [],
      missingInvoices: [],
      users: [],
      treasuryRules: [],
      scheduledPayments: [],
      providerRules: [],
      sweepConfig: {},
      predictedItems: [],
      rulesEngineEnabled: true,
      lastRulesRun: null,
      lastUpdate: new Date().toISOString()
    };
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Update state with partial data
  setState(updates) {
    this.state = { 
      ...this.state, 
      ...updates, 
      lastUpdate: new Date().toISOString() 
    };
    this.save();
    this.notifySubscribers();
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  // Load from localStorage
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.state = { ...this.getInitialState(), ...JSON.parse(stored) };
      } else {
        this.resetDemo(); // Load demo data if nothing in storage
      }
      this.notifySubscribers();
    } catch (error) {
      console.warn('Failed to load from localStorage, using demo data:', error);
      this.resetDemo();
    }
  }

  // Save to localStorage
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Reset to demo data
  resetDemo() {
    this.state = {
      accounts: [...mockData.accounts],
      properties: [...mockData.properties],
      loans: [...mockData.loans],
      documents: [...mockData.documents],
      inboxEntries: [...mockData.inboxEntries],
      movements: [...mockData.movements],
      alerts: [...(mockData.alerts || [])],
      missingInvoices: [...mockData.missingInvoices],
      users: [...mockData.users],
      treasuryRules: [...mockData.treasuryRules],
      scheduledPayments: [...mockData.scheduledPayments],
      providerRules: [...mockData.providerRules],
      sweepConfig: {...mockData.sweepConfig},
      predictedItems: [...mockData.predictedItems],
      rulesEngineEnabled: true,
      lastRulesRun: null,
      lastUpdate: new Date().toISOString()
    };
    this.save();
    this.notifySubscribers();
  }

  // Helper methods for specific operations
  
  // Account operations
  updateAccountBalance(accountId, amount) {
    const accounts = this.state.accounts.map(account => 
      account.id === accountId 
        ? { ...account, balanceToday: account.balanceToday + amount }
        : account
    );
    this.setState({ accounts });
  }

  // Document operations
  addDocument(document) {
    const documents = [...this.state.documents, { 
      ...document, 
      id: Date.now(), 
      uploadDate: new Date().toISOString() 
    }];
    this.setState({ documents });
  }

  updateDocument(id, updates) {
    const documents = this.state.documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    );
    this.setState({ documents });
  }

  deleteDocument(id) {
    const documents = this.state.documents.filter(doc => doc.id !== id);
    this.setState({ documents });
  }

  // Loan operations
  updateLoan(id, updates) {
    const loans = this.state.loans.map(loan => 
      loan.id === id ? { ...loan, ...updates } : loan
    );
    this.setState({ loans });
  }

  addAmortization(loanId, amount) {
    const loans = this.state.loans.map(loan => {
      if (loan.id === loanId) {
        const newPendingCapital = Math.max(0, loan.pendingCapital - amount);
        return { 
          ...loan, 
          pendingCapital: newPendingCapital,
          lastAmortization: {
            amount,
            date: new Date().toISOString()
          }
        };
      }
      return loan;
    });
    this.setState({ loans });
  }

  // Inbox operations
  addInboxEntry(entry) {
    const inboxEntries = [...this.state.inboxEntries, { 
      ...entry, 
      id: Date.now(), 
      uploadDate: new Date().toISOString() 
    }];
    this.setState({ inboxEntries });
  }

  clearInbox() {
    this.setState({ inboxEntries: [] });
  }

  // Movement operations
  addMovement(movement) {
    const movements = [...this.state.movements, { 
      ...movement, 
      id: Date.now(), 
      date: new Date().toISOString() 
    }];
    this.setState({ movements });
  }

  // HITO 6: Rules Engine
  runRulesEngine() {
    console.log('🤖 Running ATLAS Rules Engine...');
    let changesApplied = [];
    
    // 1. Provider classification for documents/invoices
    changesApplied.push(...this.applyProviderClassification());
    
    // 2. Movement ↔ Invoice linking
    changesApplied.push(...this.linkMovementsToInvoices());
    
    // 3. Generate predicted charges/income
    changesApplied.push(...this.generatePredictedItems());
    
    // 4. Check for sweep suggestions
    changesApplied.push(...this.checkSweepSuggestions());
    
    // 5. Update alerts based on rules
    changesApplied.push(...this.updateAlertsFromRules());
    
    // Update last rules run timestamp
    this.setState({ 
      lastRulesRun: new Date().toISOString()
    });
    
    // Show toast notifications for changes
    if (changesApplied.length > 0) {
      this.showRulesAppliedToast(changesApplied);
    }
    
    console.log(`✅ Rules engine completed. ${changesApplied.length} changes applied.`);
    return changesApplied;
  }

  applyProviderClassification() {
    const changes = [];
    const { documents, providerRules, properties } = this.state;
    
    const updatedDocuments = documents.map(doc => {
      // Only apply rules to documents that don't already have "Regla aplicada" status
      if (doc.ruleApplied) return doc;
      
      for (const rule of providerRules.filter(r => r.active).sort((a, b) => a.order - b.order)) {
        if (doc.provider && doc.provider.toLowerCase().includes(rule.providerContains.toLowerCase())) {
          const updates = {
            category: rule.category,
            isDeductible: rule.deductible,
            ruleApplied: true,
            ruleId: rule.id
          };
          
          // Handle property assignment
          if (rule.propertyId === 'auto') {
            // Find property with matching contract that contains the provider name
            const matchingProperty = properties.find(p => 
              p.contracts && p.contracts.some(c => 
                c.company && c.company.toLowerCase().includes(rule.providerContains.toLowerCase())
              )
            );
            if (matchingProperty) {
              updates.propertyId = matchingProperty.id;
            }
          } else if (rule.propertyId) {
            updates.propertyId = rule.propertyId;
          }
          
          changes.push({
            type: 'provider_classification',
            description: `${rule.providerContains} → ${rule.category}`,
            documentId: doc.id
          });
          
          return { ...doc, ...updates };
        }
      }
      return doc;
    });
    
    if (changes.length > 0) {
      this.setState({ documents: updatedDocuments });
    }
    
    return changes;
  }

  linkMovementsToInvoices() {
    const changes = [];
    const { documents, movements, sweepConfig } = this.state;
    const matchingDays = sweepConfig.movementMatchingDays || 3;
    
    const updatedDocuments = documents.map(doc => {
      if (doc.status === 'Validada' || doc.linkedMovementId) return doc;
      
      // Find matching movements within ±matchingDays
      const docDate = new Date(doc.uploadDate);
      const matchingMovements = movements.filter(mov => {
        const movDate = new Date(mov.date);
        const daysDiff = Math.abs((movDate - docDate) / (1000 * 60 * 60 * 24));
        
        return daysDiff <= matchingDays && 
               Math.abs(mov.amount) === doc.amount &&
               !mov.linkedDocumentId;
      });
      
      if (matchingMovements.length === 1) {
        // Exact match found - link them
        const movement = matchingMovements[0];
        
        changes.push({
          type: 'movement_invoice_link',
          description: `Factura ${doc.provider} vinculada automáticamente`,
          documentId: doc.id,
          movementId: movement.id
        });
        
        // Update movement too
        const updatedMovements = movements.map(mov => 
          mov.id === movement.id 
            ? { ...mov, linkedDocumentId: doc.id, status: 'Regla aplicada' }
            : mov
        );
        this.setState({ movements: updatedMovements });
        
        return { ...doc, status: 'Validada', linkedMovementId: movement.id };
      } else if (matchingMovements.length > 1) {
        // Multiple candidates - needs manual review
        changes.push({
          type: 'manual_review_needed',
          description: `Múltiples candidatos para ${doc.provider}`,
          documentId: doc.id
        });
      }
      
      return doc;
    });
    
    if (changes.length > 0) {
      this.setState({ documents: updatedDocuments });
    }
    
    return changes;
  }

  generatePredictedItems() {
    const changes = [];
    const { loans, properties } = this.state;
    const contracts = this.state.contracts || []; // Get contracts from state or empty array
    const predictedItems = [];
    const now = new Date();
    const next90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    // Generate loan payment predictions
    loans.forEach(loan => {
      const nextPaymentDate = new Date(loan.nextRevision || now);
      while (nextPaymentDate <= next90Days) {
        predictedItems.push({
          id: `loan_${loan.id}_${nextPaymentDate.getTime()}`,
          type: 'charge',
          description: `Cuota hipoteca ${loan.bank}`,
          amount: loan.monthlyPayment,
          dueDate: nextPaymentDate.toISOString().split('T')[0],
          propertyId: loan.propertyId,
          recurringType: 'monthly',
          source: 'loan',
          loanId: loan.id
        });
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
    });
    
    // Generate rental income predictions from properties with active rent
    properties.filter(p => p.status === 'Ocupado' && p.monthlyRent > 0).forEach(property => {
      const nextRentDate = new Date();
      nextRentDate.setDate(1); // First of next month
      nextRentDate.setMonth(nextRentDate.getMonth() + 1);
      
      while (nextRentDate <= next90Days) {
        predictedItems.push({
          id: `rent_${property.id}_${nextRentDate.getTime()}`,
          type: 'income',
          description: `Alquiler ${property.tenant || 'Inquilino'}`,
          amount: property.monthlyRent,
          dueDate: nextRentDate.toISOString().split('T')[0],
          propertyId: property.id,
          recurringType: 'monthly',
          source: 'property'
        });
        nextRentDate.setMonth(nextRentDate.getMonth() + 1);
      }
    });
    
    if (predictedItems.length > 0) {
      this.setState({ predictedItems });
      changes.push({
        type: 'predicted_items_generated',
        description: `${predictedItems.length} elementos previstos generados`,
        count: predictedItems.length
      });
    }
    
    return changes;
  }

  checkSweepSuggestions() {
    const changes = [];
    const { accounts, sweepConfig } = this.state;
    
    accounts.forEach(account => {
      if (account.balanceToday < account.targetBalance) {
        const needed = account.targetBalance - account.balanceToday;
        const hubAccount = accounts.find(a => a.id === sweepConfig.hubAccountId);
        
        if (hubAccount && hubAccount.balanceToday >= needed) {
          changes.push({
            type: 'sweep_suggestion',
            description: `Sugerir mover €${needed.toFixed(2)} desde ${hubAccount.name}`,
            fromAccountId: hubAccount.id,
            toAccountId: account.id,
            amount: needed
          });
          
          // Add to alerts
          this.addAlert({
            type: 'sweep_suggestion',
            severity: 'high',
            title: `Saldo bajo en ${account.name}`,
            description: `Sugerir mover €${needed.toFixed(2)} desde ${hubAccount.name}`,
            accountId: account.id,
            suggestedAmount: needed,
            fromAccountId: hubAccount.id,
            actions: ['move_money', 'postpone', 'dismiss']
          });
        }
      }
    });
    
    return changes;
  }

  updateAlertsFromRules() {
    const changes = [];
    const { documents, movements, loans } = this.state;
    const contracts = this.state.contracts || []; // Get contracts from state or empty array
    
    // Check for invoices without payments
    documents.filter(doc => doc.status === 'Pendiente' && !doc.linkedMovementId).forEach(doc => {
      this.addAlert({
        type: 'unpaid_invoice',
        severity: 'low',
        title: 'Factura sin cargo',
        description: `Factura ${doc.provider} pendiente sin movimiento asociado`,
        documentId: doc.id,
        actions: ['create_predicted_charge', 'postpone', 'dismiss']
      });
      
      changes.push({
        type: 'alert_created',
        description: `Alerta creada para factura sin cargo: ${doc.provider}`
      });
    });
    
    // Check for upcoming loan revisions
    loans.forEach(loan => {
      if (loan.nextRevision) {
        const nextRevision = new Date(loan.nextRevision);
        const now = new Date();
        const daysUntilRevision = Math.ceil((nextRevision - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRevision <= 30 && daysUntilRevision > 0) {
          this.addAlert({
            type: 'loan_revision_upcoming',
            severity: 'medium',
            title: 'Revisión de tipo próxima',
            description: `${loan.bank} - Revisión de tipo en ${daysUntilRevision} días`,
            loanId: loan.id,
            daysLeft: daysUntilRevision,
            actions: ['view_loan', 'postpone', 'dismiss']
          });
          
          changes.push({
            type: 'alert_created',
            description: `Alerta creada para revisión de préstamo: ${loan.bank}`
          });
        }
      }
    });
    
    return changes;
  }

  addAlert(alert) {
    const alerts = [...this.state.alerts, {
      ...alert,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      dismissed: false
    }];
    this.setState({ alerts });
  }

  showRulesAppliedToast(changes) {
    // This would trigger toast notifications in the UI
    if (typeof window !== 'undefined' && window.showToast) {
      changes.forEach(change => {
        window.showToast(`Regla aplicada: ${change.description}`, 'success');
      });
    }
  }

  // Dismiss or postpone alerts
  updateAlert(alertId, updates) {
    const alerts = this.state.alerts.map(alert => 
      alert.id === alertId ? { ...alert, ...updates } : alert
    );
    this.setState({ alerts });
  }

  // Provider rules management
  addProviderRule(rule) {
    const providerRules = [...this.state.providerRules, {
      ...rule,
      id: Date.now(),
      order: this.state.providerRules.length + 1
    }];
    this.setState({ providerRules });
  }

  updateProviderRule(ruleId, updates) {
    const providerRules = this.state.providerRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    this.setState({ providerRules });
  }

  deleteProviderRule(ruleId) {
    const providerRules = this.state.providerRules.filter(rule => rule.id !== ruleId);
    this.setState({ providerRules });
  }

  // Sweep config management
  updateSweepConfig(config) {
    this.setState({ sweepConfig: { ...this.state.sweepConfig, ...config } });
  }
}

// Create singleton instance
const store = new AtlasStore();

// Initialize store on first import
if (typeof window !== 'undefined') {
  store.load();
  
  // HITO 6: Auto-run rules engine when app loads
  setTimeout(() => {
    if (store.getState().rulesEngineEnabled !== false) {
      store.runRulesEngine();
    }
  }, 2000); // Increased delay to ensure everything is loaded including toast system
}

export default store;