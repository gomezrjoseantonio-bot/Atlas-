// ATLAS Store - Central state management with localStorage persistence
// HITO 4 - Connect buttons functionality

import { mockData } from '../data/mockData.js';

class AtlasStore {
  constructor() {
    this.storageKey = 'atlas-store';
    this.qaModeKey = 'atlas.qaMode';
    this.activeSeedKey = 'atlas.activeSeed';
    this.state = this.getInitialState();
    this.subscribers = [];
    
    // Initialize QA mode from various sources
    this.initializeQAMode();
  }

  // Initialize QA mode from localStorage, URL params, and Netlify preview detection
  initializeQAMode() {
    if (typeof window === 'undefined') return;
    
    let qaMode = false;
    let activeSeed = null;
    
    // 1. Check URL parameters first (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('qa')) {
      qaMode = urlParams.get('qa') === '1';
      localStorage.setItem(this.qaModeKey, qaMode.toString());
      console.log(`QA Mode set via URL: ${qaMode}`);
    }
    // 2. Check localStorage
    else {
      const stored = localStorage.getItem(this.qaModeKey);
      if (stored !== null) {
        qaMode = stored === 'true';
      }
      // 3. Check if this is a Netlify preview deployment (auto-enable QA)
      else if (window.location.hostname.includes('--') && window.location.hostname.includes('.netlify.app')) {
        qaMode = true;
        localStorage.setItem(this.qaModeKey, 'true');
        console.log('Auto-enabled QA mode for Netlify preview');
      }
    }
    
    // Get active seed from localStorage
    const storedSeed = localStorage.getItem(this.activeSeedKey);
    if (storedSeed) {
      activeSeed = storedSeed;
    }
    
    // Update state immediately
    this.state.qaMode = qaMode;
    this.state.activeSeed = activeSeed;
    
    // Add global keyboard shortcut (Ctrl/Cmd + Alt + Q)
    if (qaMode) {
      this.addKeyboardShortcuts();
    }
  }

  // Add keyboard shortcuts for QA
  addKeyboardShortcuts() {
    if (typeof window === 'undefined') return;
    
    const handleKeyboard = (e) => {
      // Ctrl/Cmd + Alt + Q to toggle QA panel
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        this.toggleQAPanel();
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    this.keyboardHandler = handleKeyboard;
  }

  // Remove keyboard shortcuts
  removeKeyboardShortcuts() {
    if (typeof window !== 'undefined' && this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  // Toggle QA panel visibility (will be implemented in _app.js)
  toggleQAPanel() {
    const event = new CustomEvent('atlas:toggleQAPanel');
    document.dispatchEvent(event);
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
      // QA Toolkit
      qaMode: false,
      activeSeed: null,
      qaEvents: [],
      // HITO 7: Multi-unit and allocation system
      units: [], // Units belonging to multi-unit properties
      unitContracts: [], // Contracts per unit
      allocationPreferences: {}, // Default allocation preferences per provider/category
      expenseFamilies: [
        { id: 'acquisition', name: 'Adquisición', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'improvement', name: 'Mejora / CAPEX', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'maintenance', name: 'Mantenimiento / Reparación', defaultTreatment: 'deductible', defaultAllocation: 'specific' },
        { id: 'financing_interest', name: 'Financiación – Intereses', defaultTreatment: 'deductible', defaultAllocation: 'units' },
        { id: 'financing_fees', name: 'Financiación – Comisiones/Formalización', defaultTreatment: 'capitalizable', defaultAllocation: 'units' },
        { id: 'operational_fixed', name: 'Explotación – Fijos', defaultTreatment: 'deductible', defaultAllocation: 'total' },
        { id: 'operational_variable', name: 'Explotación – Variables (Suministros)', defaultTreatment: 'deductible', defaultAllocation: 'occupied' },
        { id: 'other_owner', name: 'Otros / Propietario', defaultTreatment: 'no_deductible', defaultAllocation: 'no_divide' }
      ],
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
      // Check if localStorage is available (not available during SSR)
      if (typeof localStorage === 'undefined') {
        console.log('localStorage not available, loading demo data');
        this.resetDemo();
        return;
      }
      
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);
        this.state = { ...this.getInitialState(), ...parsedData };
        
        // Ensure we have some data - if arrays are empty, reload demo data
        const hasData = this.state.accounts?.length > 0 || 
                       this.state.properties?.length > 0 || 
                       this.state.documents?.length > 0;
        
        if (!hasData) {
          console.log('Stored data is empty, loading demo data');
          this.resetDemo();
          return;
        }
      } else {
        console.log('No stored data found, loading demo data');
        this.resetDemo(); // Load demo data if nothing in storage
        return;
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
      // Check if localStorage is available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      }
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Reset to demo data (uses currently selected seed)
  resetDemo() {
    // Get current seed or default to 'A'
    const currentSeed = this.state.activeSeed || 'A';
    
    console.log(`Resetting demo data with Seed ${currentSeed}...`);
    
    // Load the selected seed instead of default mockData
    this.loadSeed(currentSeed);
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

  // Property operations
  addProperty(property) {
    const properties = [...this.state.properties, { 
      ...property, 
      id: property.id || Date.now(),
      createdDate: new Date().toISOString() 
    }];
    this.setState({ properties });
  }

  updateProperty(id, updates) {
    const properties = this.state.properties.map(property => 
      property.id === id ? { ...property, ...updates } : property
    );
    this.setState({ properties });
  }

  deleteProperty(id) {
    const properties = this.state.properties.filter(property => property.id !== id);
    this.setState({ properties });
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
    // Show a single summary toast instead of multiple individual ones
    if (typeof window !== 'undefined' && window.showToast && changes.length > 0) {
      if (changes.length === 1) {
        window.showToast(`Regla aplicada: ${changes[0].description}`, 'success');
      } else {
        window.showToast(`Motor de reglas: ${changes.length} cambios aplicados`, 'success');
      }
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

  updateSweepConfig(config) {
    this.setState({ sweepConfig: { ...this.state.sweepConfig, ...config } });
  }

  // HITO 7: Multi-unit property management
  
  // Toggle multi-unit for a property
  togglePropertyMultiUnit(propertyId, enabled) {
    const properties = this.state.properties.map(property => {
      if (property.id === propertyId) {
        const updates = { multiUnit: enabled };
        
        if (enabled && !property.units) {
          // Initialize with default "Piso completo" unit
          updates.units = [
            {
              id: `${propertyId}_full`,
              name: 'Piso completo',
              isDefault: true,
              sqm: null,
              monthlyRent: property.monthlyRent || 0,
              status: property.status === 'Ocupado' ? 'Ocupada' : 'Libre'
            }
          ];
        }
        
        return { ...property, ...updates };
      }
      return property;
    });
    
    this.setState({ properties });
  }

  // Setup multi-unit wizard
  setupMultiUnit(propertyId, unitsConfig) {
    const { unitCount, unitNames, unitSqm, unitRents } = unitsConfig;
    
    const units = [];
    for (let i = 0; i < unitCount; i++) {
      units.push({
        id: `${propertyId}_unit_${i + 1}`,
        name: unitNames[i] || `H${i + 1}`,
        sqm: unitSqm ? unitSqm[i] : null,
        monthlyRent: unitRents[i] || 0,
        status: 'Libre', // Default to free
        propertyId: propertyId
      });
    }
    
    // Update property
    const properties = this.state.properties.map(property => {
      if (property.id === propertyId) {
        return {
          ...property,
          multiUnit: true,
          units: units,
          // Aggregate totals
          totalUnits: unitCount,
          occupiedUnits: 0 // Will be calculated based on contracts
        };
      }
      return property;
    });
    
    // Store units separately for easier access
    const stateUnits = [...this.state.units, ...units];
    
    this.setState({ properties, units: stateUnits });
  }

  // Update unit
  updateUnit(unitId, updates) {
    const units = this.state.units.map(unit => 
      unit.id === unitId ? { ...unit, ...updates } : unit
    );
    
    // Also update in property
    const properties = this.state.properties.map(property => {
      if (property.units) {
        const updatedUnits = property.units.map(unit => 
          unit.id === unitId ? { ...unit, ...updates } : unit
        );
        return { ...property, units: updatedUnits };
      }
      return property;
    });
    
    this.setState({ units, properties });
  }

  // Add unit contract
  addUnitContract(unitId, contractData) {
    const contract = {
      ...contractData,
      id: Date.now(),
      unitId: unitId,
      createdAt: new Date().toISOString()
    };
    
    const unitContracts = [...this.state.unitContracts, contract];
    this.setState({ unitContracts });
    
    // Update unit occupancy
    this.updateUnitOccupancy(unitId);
  }

  // Update unit occupancy based on contracts
  updateUnitOccupancy(unitId) {
    const now = new Date();
    const activeContracts = this.state.unitContracts.filter(contract => 
      contract.unitId === unitId && 
      new Date(contract.startDate) <= now && 
      new Date(contract.endDate || '9999-12-31') >= now
    );
    
    const isOccupied = activeContracts.length > 0;
    this.updateUnit(unitId, { 
      status: isOccupied ? 'Ocupada' : 'Libre',
      currentContract: activeContracts[0] || null
    });
  }

  // Calculate monthly occupancy percentage for a unit
  getUnitMonthlyOccupancy(unitId, year, month) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const totalDays = monthEnd.getDate();
    
    const contracts = this.state.unitContracts.filter(contract => {
      if (contract.unitId !== unitId) return false;
      
      const contractStart = new Date(contract.startDate);
      const contractEnd = new Date(contract.endDate || '9999-12-31');
      
      return contractStart <= monthEnd && contractEnd >= monthStart;
    });
    
    let occupiedDays = 0;
    
    contracts.forEach(contract => {
      const contractStart = new Date(contract.startDate);
      const contractEnd = new Date(contract.endDate || '9999-12-31');
      
      const periodStart = new Date(Math.max(monthStart.getTime(), contractStart.getTime()));
      const periodEnd = new Date(Math.min(monthEnd.getTime(), contractEnd.getTime()));
      
      if (periodStart <= periodEnd) {
        const days = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24)) + 1;
        occupiedDays += days;
      }
    });
    
    return Math.min(100, (occupiedDays / totalDays) * 100);
  }

  // Document allocation methods
  
  // Update document with expense family and fiscal treatment
  updateDocumentFiscalInfo(documentId, fiscalInfo) {
    const { expenseFamily, fiscalTreatment, rentalAffectation, amortizationYears, amortizationStartDate } = fiscalInfo;
    
    const documents = this.state.documents.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          expenseFamily,
          fiscalTreatment,
          rentalAffectation: rentalAffectation || 100,
          amortizationYears,
          amortizationStartDate
        };
      }
      return doc;
    });
    
    this.setState({ documents });
  }

  // Allocate document amount across units
  allocateDocument(documentId, allocation) {
    const { method, distribution, excludedUnits = [] } = allocation;
    
    const documents = this.state.documents.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          allocation: {
            method,
            distribution,
            excludedUnits,
            allocatedAt: new Date().toISOString()
          }
        };
      }
      return doc;
    });
    
    this.setState({ documents });
  }

  // Get suggested allocation method based on expense family
  getSuggestedAllocation(expenseFamily, propertyId) {
    const expenseFamilyData = this.state.expenseFamilies.find(ef => ef.id === expenseFamily);
    if (!expenseFamilyData) return 'units';
    
    const property = this.state.properties.find(p => p.id === propertyId);
    if (!property || !property.multiUnit) return 'no_divide';
    
    // Map internal allocation codes to display values
    const allocationMapping = {
      'occupied': 'occupied',
      'total': 'total',
      'sqm': 'sqm',
      'units': 'units',
      'specific': 'specific',
      'no_divide': 'no_divide'
    };
    
    return allocationMapping[expenseFamilyData.defaultAllocation] || 'units';
  }

  // Calculate allocation distribution
  calculateAllocationDistribution(propertyId, method, targetUnits = null, customPercentages = null) {
    const property = this.state.properties.find(p => p.id === propertyId);
    if (!property || !property.multiUnit || !property.units) {
      return { total: { percentage: 100, amount: 0 } };
    }
    
    const units = property.units;
    const distribution = {};
    
    switch (method) {
      case 'occupied':
        const occupiedUnits = units.filter(unit => unit.status === 'Ocupada');
        const occupiedCount = occupiedUnits.length;
        if (occupiedCount === 0) {
          // Fall back to total if no occupied units
          units.forEach(unit => {
            distribution[unit.id] = { percentage: 100 / units.length, amount: 0 };
          });
        } else {
          occupiedUnits.forEach(unit => {
            distribution[unit.id] = { percentage: 100 / occupiedCount, amount: 0 };
          });
        }
        break;
        
      case 'total':
        units.forEach(unit => {
          distribution[unit.id] = { percentage: 100 / units.length, amount: 0 };
        });
        break;
        
      case 'sqm':
        const totalSqm = units.reduce((sum, unit) => sum + (unit.sqm || 0), 0);
        if (totalSqm === 0) {
          // Fall back to units if no sqm data
          units.forEach(unit => {
            distribution[unit.id] = { percentage: 100 / units.length, amount: 0 };
          });
        } else {
          units.forEach(unit => {
            const unitSqm = unit.sqm || 0;
            distribution[unit.id] = { percentage: (unitSqm / totalSqm) * 100, amount: 0 };
          });
        }
        break;
        
      case 'custom':
        if (customPercentages) {
          Object.keys(customPercentages).forEach(unitId => {
            distribution[unitId] = { percentage: customPercentages[unitId], amount: 0 };
          });
        }
        break;
        
      case 'specific':
        if (targetUnits && targetUnits.length > 0) {
          targetUnits.forEach(unitId => {
            distribution[unitId] = { percentage: 100 / targetUnits.length, amount: 0 };
          });
        }
        break;
        
      case 'no_divide':
      default:
        distribution.property = { percentage: 100, amount: 0 };
        break;
    }
    
    return distribution;
  }

  // Get allocation preferences
  getAllocationPreferences(provider, category) {
    const key = `${provider}_${category}`;
    return this.state.allocationPreferences[key] || null;
  }

  // Save allocation preferences
  saveAllocationPreference(provider, category, allocation) {
    const key = `${provider}_${category}`;
    const allocationPreferences = {
      ...this.state.allocationPreferences,
      [key]: allocation
    };
    this.setState({ allocationPreferences });
  }

  // QA Toolkit Methods
  
  // Toggle QA Mode with proper persistence
  toggleQAMode() {
    const qaMode = !this.state.qaMode;
    
    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.qaModeKey, qaMode.toString());
    }
    
    // Update state
    this.setState({ 
      qaMode,
      qaEvents: [...(this.state.qaEvents || []), {
        type: qaMode ? 'qa_mode_enabled' : 'qa_mode_disabled',
        timestamp: new Date().toISOString(),
        module: 'QA'
      }]
    });
    
    // Add/remove keyboard shortcuts
    if (qaMode) {
      this.addKeyboardShortcuts();
    } else {
      this.removeKeyboardShortcuts();
    }
    
    // Show toast notification
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(
        qaMode ? 'Modo QA activado' : 'Modo QA desactivado', 
        qaMode ? 'success' : 'info'
      );
    }
  }

  // Load specific seed data with proper persistence
  loadSeed(seedType) {
    const seeds = this.getSeeds();
    const seed = seeds[seedType];
    
    if (!seed) {
      console.error(`Seed ${seedType} not found`);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(`Seed ${seedType} no encontrado`, 'error');
      }
      return;
    }

    console.log(`Loading Seed ${seedType}...`);
    
    // Preserve QA settings
    const qaMode = this.state.qaMode;
    const qaEvents = [...(this.state.qaEvents || []), {
      type: 'seed_loaded',
      seedType,
      timestamp: new Date().toISOString(),
      module: 'QA'
    }];

    // Replace entire state with seed data
    this.state = {
      ...seed,
      qaMode,
      activeSeed: seedType,
      qaEvents,
      lastSeedReset: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
    
    // Save active seed to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.activeSeedKey, seedType);
    }
    
    // Save and notify
    this.save();
    this.notifySubscribers();
    
    // Show success toast
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`Seed ${seedType} cargado`, 'success');
    }
    
    console.log(`✅ Seed ${seedType} loaded successfully`);
  }

  // Get all available seeds
  getSeeds() {
    return {
      A: this.getSeedA(),
      B: this.getSeedB(), 
      C: this.getSeedC()
    };
  }

  // Seed A (Simple): 1 property, 2 accounts, 1 loan, 4 invoices
  getSeedA() {
    return {
      accounts: [
        {
          id: 1,
          name: 'Cuenta Principal',
          bank: 'BBVA',
          iban: 'ES21 0182 1111 ****',
          balanceToday: 15000,
          balanceT7: 15200,
          balanceT30: 14800,
          targetBalance: 15000,
          health: 'good',
          hidden: false
        },
        {
          id: 2,
          name: 'Cuenta Gastos',
          bank: 'Santander',
          iban: 'ES45 0049 2222 ****',
          balanceToday: 8500,
          balanceT7: 8200,
          balanceT30: 8000,
          targetBalance: 8000,
          health: 'excellent',
          hidden: false
        }
      ],
      properties: [
        {
          id: 1,
          address: 'Calle Ejemplo 123, 2ºA',
          city: 'Madrid',
          type: 'Piso',
          purchaseDate: '2020-01-15',
          purchasePrice: 180000,
          currentValue: 195000,
          monthlyRent: 1200,
          monthlyExpenses: 200,
          netProfit: 1000,
          rentability: 6.7,
          occupancy: 100,
          tenant: 'Ana García',
          contractStart: '2023-01-01',
          contractEnd: '2024-12-31',
          status: 'Ocupado',
          multiUnit: false
        }
      ],
      loans: [
        {
          id: 1,
          propertyId: 1,
          bank: 'BBVA',
          product: 'Hipoteca estándar',
          originalAmount: 140000,
          pendingCapital: 120000,
          interestRate: 2.5,
          interestType: 'variable',
          monthlyPayment: 650,
          remainingMonths: 180,
          startDate: '2020-01-15',
          endDate: '2035-01-15'
        }
      ],
      documents: [
        {
          id: 1,
          uploadDate: '2024-01-10',
          provider: 'Endesa',
          amount: 85,
          description: 'Factura electricidad',
          category: 'Suministros',
          type: 'Factura',
          status: 'Pendiente',
          recurrence: 'monthly'
        },
        {
          id: 2,
          uploadDate: '2024-01-12',
          provider: 'Comunidad',
          amount: 120,
          description: 'Gastos comunidad',
          category: 'Fijos',
          type: 'Factura',
          status: 'Pendiente',
          recurrence: 'monthly'
        },
        {
          id: 3,
          uploadDate: '2024-01-15',
          provider: 'Canal Isabel II',
          amount: 45,
          description: 'Factura agua',
          category: 'Suministros',
          type: 'Factura',
          status: 'Pendiente',
          recurrence: 'monthly'
        },
        {
          id: 4,
          uploadDate: '2024-01-20',
          provider: 'Mapfre',
          amount: 35,
          description: 'Seguro hogar',
          category: 'Seguros',
          type: 'Factura',
          status: 'Pendiente',
          recurrence: 'monthly'
        }
      ],
      movements: [],
      alerts: [],
      inboxEntries: [],
      missingInvoices: [],
      users: mockData.users,
      treasuryRules: mockData.treasuryRules,
      scheduledPayments: [],
      providerRules: mockData.providerRules,
      sweepConfig: mockData.sweepConfig,
      predictedItems: [],
      rulesEngineEnabled: true,
      lastRulesRun: null,
      units: [],
      unitContracts: [],
      allocationPreferences: {},
      expenseFamilies: [
        { id: 'acquisition', name: 'Adquisición', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'improvement', name: 'Mejora / CAPEX', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'maintenance', name: 'Mantenimiento / Reparación', defaultTreatment: 'deductible', defaultAllocation: 'specific' },
        { id: 'financing_interest', name: 'Financiación – Intereses', defaultTreatment: 'deductible', defaultAllocation: 'units' },
        { id: 'financing_fees', name: 'Financiación – Comisiones/Formalización', defaultTreatment: 'capitalizable', defaultAllocation: 'units' },
        { id: 'operational_fixed', name: 'Explotación – Fijos', defaultTreatment: 'deductible', defaultAllocation: 'total' },
        { id: 'operational_variable', name: 'Explotación – Variables (Suministros)', defaultTreatment: 'deductible', defaultAllocation: 'occupied' },
        { id: 'other_owner', name: 'Otros / Propietario', defaultTreatment: 'no_deductible', defaultAllocation: 'no_divide' }
      ]
    };
  }

  // Seed B (Multi-unit): 1 property with 5 rooms
  getSeedB() {
    return {
      accounts: [
        {
          id: 1,
          name: 'Cuenta Principal',
          bank: 'BBVA',
          iban: 'ES21 0182 1111 ****',
          balanceToday: 25000,
          balanceT7: 24800,
          balanceT30: 25200,
          targetBalance: 25000,
          health: 'excellent',
          hidden: false
        },
        {
          id: 2,
          name: 'Cuenta Gastos',
          bank: 'Santander',
          iban: 'ES45 0049 2222 ****',
          balanceToday: 12000,
          balanceT7: 11800,
          balanceT30: 12200,
          targetBalance: 12000,
          health: 'good',
          hidden: false
        }
      ],
      properties: [
        {
          id: 1,
          address: 'Calle Multi 456, Piso Compartido',
          city: 'Madrid',
          type: 'Piso compartido',
          purchaseDate: '2021-06-01',
          purchasePrice: 250000,
          currentValue: 270000,
          monthlyRent: 1910,
          monthlyExpenses: 400,
          netProfit: 1510,
          rentability: 7.2,
          occupancy: 80,
          tenant: 'Varios inquilinos',
          contractStart: '2024-01-01',
          contractEnd: '2024-12-31',
          status: 'Parcialmente ocupado',
          multiUnit: true,
          totalUnits: 5,
          occupiedUnits: 4
        }
      ],
      units: [
        { id: 1, propertyId: 1, name: 'H1', sqm: 8, monthlyRent: 320, status: 'Ocupada' },
        { id: 2, propertyId: 1, name: 'H2', sqm: 9, monthlyRent: 350, status: 'Ocupada' },
        { id: 3, propertyId: 1, name: 'H3', sqm: 12, monthlyRent: 400, status: 'Ocupada' },
        { id: 4, propertyId: 1, name: 'H4', sqm: 12, monthlyRent: 400, status: 'Ocupada' },
        { id: 5, propertyId: 1, name: 'H5', sqm: 15, monthlyRent: 440, status: 'Libre' }
      ],
      unitContracts: [
        {
          id: 1,
          unitId: 1,
          type: 'Alquiler',
          tenant: 'Pedro Martín',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyAmount: 320,
          status: 'Activo'
        },
        {
          id: 2,
          unitId: 2,
          type: 'Alquiler',
          tenant: 'Laura Sánchez',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyAmount: 350,
          status: 'Activo'
        },
        {
          id: 3,
          unitId: 3,
          type: 'Alquiler',
          tenant: 'Miguel Ruiz',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          monthlyAmount: 400,
          status: 'Activo'
        },
        {
          id: 4,
          unitId: 4,
          type: 'Alquiler',
          tenant: 'Sofia López',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyAmount: 400,
          status: 'Activo'
        }
      ],
      loans: [],
      documents: [
        {
          id: 1,
          uploadDate: '2024-01-10',
          provider: 'Endesa',
          amount: 120,
          description: 'Factura electricidad',
          category: 'Suministros',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'occupied'
        },
        {
          id: 2,
          uploadDate: '2024-01-10',
          provider: 'Canal Isabel II',
          amount: 60,
          description: 'Factura agua',
          category: 'Suministros',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'occupied'
        },
        {
          id: 3,
          uploadDate: '2024-01-10',
          provider: 'Movistar',
          amount: 40,
          description: 'Internet fibra',
          category: 'Suministros',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'occupied'
        },
        {
          id: 4,
          uploadDate: '2024-01-15',
          provider: 'Comunidad',
          amount: 80,
          description: 'Gastos comunidad',
          category: 'Fijos',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'total'
        },
        {
          id: 5,
          uploadDate: '2024-01-15',
          provider: 'Ayuntamiento',
          amount: 150,
          description: 'IBI',
          category: 'Fijos',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'total'
        },
        {
          id: 6,
          uploadDate: '2024-01-20',
          provider: 'Cerrajería López',
          amount: 45,
          description: 'Cambio cerradura H3',
          category: 'Mantenimiento',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'specific',
          specificUnit: 'H3'
        },
        {
          id: 7,
          uploadDate: '2024-01-25',
          provider: 'Ventanas Pro',
          amount: 1500,
          description: 'Cambio ventanas',
          category: 'CAPEX',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'sqm'
        },
        {
          id: 8,
          uploadDate: '2024-01-30',
          provider: 'BBVA',
          amount: 210,
          description: 'Intereses hipoteca',
          category: 'Financiación',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'units'
        },
        {
          id: 9,
          uploadDate: '2024-01-30',
          provider: 'Gestora ABC',
          amount: 300,
          description: 'Comisión gestión',
          category: 'Gestión',
          type: 'Factura',
          status: 'Pendiente',
          allocationMethod: 'units'
        }
      ],
      movements: [],
      alerts: [],
      inboxEntries: [],
      missingInvoices: [],
      users: mockData.users,
      treasuryRules: mockData.treasuryRules,
      scheduledPayments: [],
      providerRules: mockData.providerRules,
      sweepConfig: mockData.sweepConfig,
      predictedItems: [],
      rulesEngineEnabled: true,
      lastRulesRun: null,
      allocationPreferences: {
        'Endesa_Suministros': { method: 'occupied', lastUsed: '2024-01-10' },
        'Canal_Suministros': { method: 'occupied', lastUsed: '2024-01-10' },
        'Movistar_Suministros': { method: 'occupied', lastUsed: '2024-01-10' },
        'Comunidad_Fijos': { method: 'total', lastUsed: '2024-01-15' }
      },
      expenseFamilies: [
        { id: 'acquisition', name: 'Adquisición', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'improvement', name: 'Mejora / CAPEX', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'maintenance', name: 'Mantenimiento / Reparación', defaultTreatment: 'deductible', defaultAllocation: 'specific' },
        { id: 'financing_interest', name: 'Financiación – Intereses', defaultTreatment: 'deductible', defaultAllocation: 'units' },
        { id: 'financing_fees', name: 'Financiación – Comisiones/Formalización', defaultTreatment: 'capitalizable', defaultAllocation: 'units' },
        { id: 'operational_fixed', name: 'Explotación – Fijos', defaultTreatment: 'deductible', defaultAllocation: 'total' },
        { id: 'operational_variable', name: 'Explotación – Variables (Suministros)', defaultTreatment: 'deductible', defaultAllocation: 'occupied' },
        { id: 'other_owner', name: 'Otros / Propietario', defaultTreatment: 'no_deductible', defaultAllocation: 'no_divide' }
      ]
    };
  }

  // Seed C (Edge cases): overlapping contracts, custom percentages
  getSeedC() {
    return {
      accounts: [
        {
          id: 1,
          name: 'Cuenta Principal',
          bank: 'BBVA',
          iban: 'ES21 0182 1111 ****',
          balanceToday: 18000,
          balanceT7: 17500,
          balanceT30: 18200,
          targetBalance: 18000,
          health: 'good',
          hidden: false
        }
      ],
      properties: [
        {
          id: 1,
          address: 'Calle Bordes 789, Casos Límite',
          city: 'Barcelona',
          type: 'Piso',
          purchaseDate: '2022-03-01',
          purchasePrice: 200000,
          currentValue: 215000,
          monthlyRent: 1100,
          monthlyExpenses: 250,
          netProfit: 850,
          rentability: 6.2,
          occupancy: 100,
          tenant: 'Contrato Complejo',
          contractStart: '2024-01-15',
          contractEnd: '2024-12-31',
          status: 'Ocupado',
          multiUnit: true,
          totalUnits: 2,
          occupiedUnits: 2,
          sqm: null // Property without square meters
        }
      ],
      units: [
        { id: 1, propertyId: 1, name: 'Zona A', sqm: null, monthlyRent: 550, status: 'Ocupada' },
        { id: 2, propertyId: 1, name: 'Zona B', sqm: null, monthlyRent: 550, status: 'Ocupada' }
      ],
      unitContracts: [
        {
          id: 1,
          unitId: 1,
          type: 'Piso completo',
          tenant: 'Juan Pérez',
          startDate: '2024-01-15',
          endDate: '2024-01-30',
          monthlyAmount: 1100,
          status: 'Solapado',
          overlapping: true
        },
        {
          id: 2,
          unitId: 2,
          type: 'Piso completo',
          tenant: 'María González',
          startDate: '2024-01-15',
          endDate: '2024-01-30',
          monthlyAmount: 1100,
          status: 'Solapado',
          overlapping: true
        }
      ],
      loans: [],
      documents: [
        {
          id: 1,
          uploadDate: '2024-01-10',
          provider: 'Iberdrola',
          amount: 95,
          description: 'Electricidad sin reparto',
          category: 'Suministros',
          type: 'Factura',
          status: 'Sin reparto',
          allocationMethod: null
        },
        {
          id: 2,
          uploadDate: '2024-01-15',
          provider: 'Reparaciones XYZ',
          amount: 200,
          description: 'Personalizado 70/30',
          category: 'Mantenimiento',
          type: 'Factura',
          status: 'Personalizado',
          allocationMethod: 'custom',
          customAllocation: [
            { unitId: 1, percentage: 70 },
            { unitId: 2, percentage: 30 }
          ]
        }
      ],
      movements: [],
      alerts: [
        {
          id: 1,
          type: 'warning',
          title: 'Contratos solapados',
          description: 'Hay contratos que se solapan 15 días',
          severity: 'high',
          date: '2024-01-15',
          dismissed: false
        }
      ],
      inboxEntries: [],
      missingInvoices: [],
      users: mockData.users,
      treasuryRules: mockData.treasuryRules,
      scheduledPayments: [],
      providerRules: mockData.providerRules,
      sweepConfig: mockData.sweepConfig,
      predictedItems: [],
      rulesEngineEnabled: true,
      lastRulesRun: null,
      allocationPreferences: {},
      expenseFamilies: [
        { id: 'acquisition', name: 'Adquisición', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'improvement', name: 'Mejora / CAPEX', defaultTreatment: 'capitalizable', defaultAllocation: 'sqm' },
        { id: 'maintenance', name: 'Mantenimiento / Reparación', defaultTreatment: 'deductible', defaultAllocation: 'specific' },
        { id: 'financing_interest', name: 'Financiación – Intereses', defaultTreatment: 'deductible', defaultAllocation: 'units' },
        { id: 'financing_fees', name: 'Financiación – Comisiones/Formalización', defaultTreatment: 'capitalizable', defaultAllocation: 'units' },
        { id: 'operational_fixed', name: 'Explotación – Fijos', defaultTreatment: 'deductible', defaultAllocation: 'total' },
        { id: 'operational_variable', name: 'Explotación – Variables (Suministros)', defaultTreatment: 'deductible', defaultAllocation: 'occupied' },
        { id: 'other_owner', name: 'Otros / Propietario', defaultTreatment: 'no_deductible', defaultAllocation: 'no_divide' }
      ]
    };
  }

  // Add QA event
  addQAEvent(event) {
    const qaEvents = [...(this.state.qaEvents || []), {
      ...event,
      timestamp: new Date().toISOString()
    }];
    this.setState({ qaEvents });
  }

  // Generate diagnostics info
  generateDiagnostics() {
    const state = this.state;
    const route = typeof window !== 'undefined' ? window.location.pathname : '/';
    const version = '0.1.3'; // From package.json
    const commitShort = 'dev-' + Date.now().toString().slice(-6);
    
    return {
      route,
      version,
      commit: commitShort,
      seed: state.activeSeed || 'default',
      qaMode: state.qaMode,
      timestamp: new Date().toISOString(),
      flags: {
        rulesEngine: state.rulesEngineEnabled,
        multiUnit: state.properties?.some(p => p.multiUnit) || false
      }
    };
  }

  // Copy diagnostics to clipboard (will be handled in UI)
  getDiagnosticsText() {
    const diag = this.generateDiagnostics();
    return `ATLAS Diagnostics
Route: ${diag.route}
Version: ${diag.version}
Commit: ${diag.commit}
Seed: ${diag.seed}
QA Mode: ${diag.qaMode ? 'ON' : 'OFF'}
Rules Engine: ${diag.flags.rulesEngine ? 'ON' : 'OFF'}
Multi-unit: ${diag.flags.multiUnit ? 'YES' : 'NO'}
Timestamp: ${diag.timestamp}`;
  }

  // QA Quick Actions
  
  // Create upcoming movements (next 7 days)
  createUpcomingMovements() {
    const movements = [];
    const today = new Date();
    
    for (let i = 1; i <= 10; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      
      movements.push({
        id: Date.now() + i,
        date: futureDate.toISOString().split('T')[0],
        description: `Movimiento futuro ${i}`,
        amount: Math.floor(Math.random() * 500) + 50,
        account: 'Cuenta Principal',
        category: 'Programado',
        status: 'Pendiente'
      });
    }
    
    const updatedMovements = [...this.state.movements, ...movements];
    this.setState({ movements: updatedMovements });
    this.addQAEvent({ type: 'upcoming_movements_created', count: 10, module: 'Tesorería' });
    
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('10 movimientos próximos creados', 'success');
    }
  }

  // Create overdue movements (last 10 days)
  createOverdueMovements() {
    const movements = [];
    const today = new Date();
    
    for (let i = 1; i <= 10; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      
      movements.push({
        id: Date.now() + i + 1000,
        date: pastDate.toISOString().split('T')[0],
        description: `Movimiento atrasado ${i}`,
        amount: -(Math.floor(Math.random() * 300) + 25),
        account: 'Cuenta Principal',
        category: 'Atrasado',
        status: 'Excepción'
      });
    }
    
    const updatedMovements = [...this.state.movements, ...movements];
    this.setState({ movements: updatedMovements });
    this.addQAEvent({ type: 'overdue_movements_created', count: 10, module: 'Tesorería' });
    
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('10 movimientos atrasados creados', 'success');
    }
  }

  // Generate invoices without documents
  generateInvoicesWithoutDocuments() {
    const invoices = [
      {
        id: Date.now() + 1,
        uploadDate: new Date().toISOString(),
        provider: 'Proveedor Sin Doc 1',
        amount: 125.50,
        description: 'Factura sin documento detectada',
        category: 'Sin categoría',
        type: 'Factura',
        status: 'Sin documento',
        hasDocument: false
      },
      {
        id: Date.now() + 2,
        uploadDate: new Date().toISOString(),
        provider: 'Proveedor Sin Doc 2',
        amount: 89.25,
        description: 'Gasto sin justificante',
        category: 'Sin categoría',
        type: 'Factura',
        status: 'Sin documento',
        hasDocument: false
      },
      {
        id: Date.now() + 3,
        uploadDate: new Date().toISOString(),
        provider: 'Proveedor Sin Doc 3',
        amount: 234.75,
        description: 'Factura extraviada',
        category: 'Sin categoría',
        type: 'Factura',
        status: 'Sin documento',
        hasDocument: false
      }
    ];
    
    const updatedDocuments = [...this.state.documents, ...invoices];
    const updatedInbox = [...this.state.inboxEntries, ...invoices.map(inv => ({
      ...inv,
      type: 'pending_document',
      urgent: true
    }))];
    
    this.setState({ 
      documents: updatedDocuments,
      inboxEntries: updatedInbox
    });
    this.addQAEvent({ type: 'invoices_without_docs_created', count: 3, module: 'Documentos' });
    
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('3 facturas sin documento generadas', 'success');
    }
  }

  // Simulate low balance in an account
  simulateLowBalance() {
    const accounts = this.state.accounts.map(account => {
      if (account.id === 1) { // Main account
        return {
          ...account,
          balanceToday: account.targetBalance - 1000, // Set below target
          health: 'warning'
        };
      }
      return account;
    });
    
    // Add low balance alert
    this.addAlert({
      type: 'low_balance',
      severity: 'high',
      title: 'Saldo bajo detectado',
      description: 'La cuenta principal está por debajo del objetivo',
      accountId: 1,
      actions: ['transfer_money', 'adjust_target', 'dismiss']
    });
    
    this.setState({ accounts });
    this.addQAEvent({ type: 'low_balance_simulated', module: 'Tesorería' });
    
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('Saldo bajo simulado en cuenta principal', 'warning');
    }
  }

  // Execute rules engine with feedback
  executeRulesEngine() {
    console.log('🔄 Ejecutando motor de reglas desde QA...');
    const changes = this.runRulesEngine();
    
    this.addQAEvent({ 
      type: 'rules_engine_executed', 
      changesCount: changes.length,
      module: 'Config'
    });
    
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(
        `Motor de reglas ejecutado: ${changes.length} cambios aplicados`, 
        'success'
      );
    }
    
    return changes;
  }
}

// Create singleton instance
const store = new AtlasStore();

// Always ensure we have demo data immediately, regardless of environment
console.log('Initializing store with demo data');
store.resetDemo();

// Initialize store on first import
if (typeof window !== 'undefined') {
  // In browser environment, try to load from localStorage but keep demo as fallback
  setTimeout(() => {
    store.load();
    
    // Double-check that store has data after loading - if not, force demo data
    const state = store.getState();
    const hasData = state.accounts?.length > 0 || 
                   state.properties?.length > 0 || 
                   state.documents?.length > 0;
    
    if (!hasData) {
      console.log('Store still empty after load, forcing demo data');
      store.resetDemo();
    }
    
    // Initialize QA mode after data is loaded
    store.initializeQAMode();
  }, 100); // Small delay to allow DOM to be ready
} else {
  // If window is not available (SSR), we already have demo data loaded
  console.log('Window not available, demo data already loaded for SSR');
}

export default store;