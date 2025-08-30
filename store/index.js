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
      // HITO 7: Multi-unit data
      units: [...(mockData.units || [])],
      unitContracts: [...(mockData.unitContracts || [])],
      allocationPreferences: {...(mockData.allocationPreferences || {})},
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
}

// Create singleton instance
const store = new AtlasStore();

// Initialize store on first import
if (typeof window !== 'undefined') {
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
  
  // HITO 6: Auto-run rules engine when app loads - DISABLED for deployment stability
  // Users can manually trigger rules via "Aplicar reglas ahora" button
  // setTimeout(() => {
  //   if (store.getState().rulesEngineEnabled !== false) {
  //     store.runRulesEngine();
  //   }
  // }, 2000);
} else {
  // If window is not available (SSR), load demo data immediately
  console.log('Window not available, loading demo data for SSR');
  store.resetDemo();
}

export default store;