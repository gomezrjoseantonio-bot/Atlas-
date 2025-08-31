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

  // H11: Initialize bank templates with vinculaciones
  initializeBankTemplates() {
    return {
      ING: {
        id: 'ING',
        name: 'ING',
        vinculaciones: [
          {
            id: 'ing_hogar',
            tipo: 'Seguro_hogar',
            etiqueta: 'Seguro Hogar',
            bonificacion_bps: 30,
            aplica_sobre: 'spread',
            obligatoria_para_concesion: false
          },
          {
            id: 'ing_vida',
            tipo: 'Seguro_vida',
            etiqueta: 'Seguro Vida',
            bonificacion_bps: 0, // Base 0, conditional +50 if Hogar
            aplica_sobre: 'spread',
            conditional_bonus: [
              { if_all: ['ing_hogar'], extra_bps: 50 }
            ]
          },
          {
            id: 'ing_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 20,
            aplica_sobre: 'spread'
          },
          {
            id: 'ing_recibos',
            tipo: 'Recibos_domiciliados',
            etiqueta: 'Recibos Domiciliados',
            bonificacion_bps: 10,
            aplica_sobre: 'spread'
          }
        ],
        grupos: [
          {
            group_id: 'ing_elige_2_de_4',
            label: 'Elige 2 de 4',
            policy: { type: 'at_least_k', k: 2 },
            member_ids: ['ing_nomina', 'ing_recibos', 'ing_tarjeta', 'ing_plan'],
            group_bonus_bps: 20,
            aplica_sobre: 'spread'
          }
        ]
      },
      SANTANDER: {
        id: 'SANTANDER',
        name: 'Santander',
        vinculaciones: [
          {
            id: 'san_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 25,
            aplica_sobre: 'spread',
            umbral_minimo: 2500 // €/mes
          },
          {
            id: 'san_tarjeta',
            tipo: 'Tarjeta_gasto_minimo',
            etiqueta: 'Tarjeta Gasto Mínimo',
            bonificacion_bps: 15,
            aplica_sobre: 'spread',
            umbral_minimo: 600 // €/mes
          },
          {
            id: 'san_hogar',
            tipo: 'Seguro_hogar',
            etiqueta: 'Seguro Hogar',
            bonificacion_bps: 20,
            aplica_sobre: 'spread'
          }
        ]
      },
      BBVA: {
        id: 'BBVA',
        name: 'BBVA',
        vinculaciones: [
          {
            id: 'bbva_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 30,
            aplica_sobre: 'spread',
            umbral_minimo: 3000
          },
          {
            id: 'bbva_plan',
            tipo: 'Plan_pensiones',
            etiqueta: 'Plan de Pensiones',
            bonificacion_bps: 25,
            aplica_sobre: 'spread',
            umbral_minimo: 1200 // €/año
          }
        ]
      },
      CAIXA: {
        id: 'CAIXA',
        name: 'CaixaBank',
        vinculaciones: [
          {
            id: 'caixa_digital',
            tipo: 'Cuenta_digital',
            etiqueta: 'Cuenta Digital',
            bonificacion_bps: 15,
            aplica_sobre: 'spread'
          }
        ]
      },
      OPENBANK: {
        id: 'OPENBANK',
        name: 'Openbank',
        vinculaciones: [
          {
            id: 'open_digital',
            tipo: 'Cuenta_digital',
            etiqueta: 'Operativa Digital',
            bonificacion_bps: 10,
            aplica_sobre: 'spread'
          }
        ]
      },
      EVO: {
        id: 'EVO',
        name: 'EVO Banco',
        vinculaciones: [
          {
            id: 'evo_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 40,
            aplica_sobre: 'spread'
          }
        ]
      },
      GENERICA: {
        id: 'GENERICA',
        name: 'Plantilla Genérica',
        vinculaciones: []
      }
    };
  }

  // H11: Initialize vinculacion catalog
  initializeVinculacionCatalog() {
    return [
      {
        id: 'nomina_domiciliada',
        name: 'Nómina Domiciliada',
        tipo: 'Nomina_domiciliada',
        description: 'Domiciliación de nómina en la entidad',
        regla_verificacion: {
          tipo: 'movimiento_mensual',
          patron: 'Nómina|Payroll|NOMINA',
          umbral_minimo: 1500,
          periodicidad: 'mensual'
        },
        coste_estimado_anual: 0
      },
      {
        id: 'recibos_domiciliados',
        name: 'Recibos Domiciliados',
        tipo: 'Recibos_domiciliados',
        description: 'Domiciliación de recibos (agua, luz, gas, teléfono)',
        regla_verificacion: {
          tipo: 'cargo_mensual',
          categorias: ['Suministros', 'Telecomunicaciones'],
          minimo_recibos: 3,
          periodicidad: 'mensual'
        },
        coste_estimado_anual: 0
      },
      {
        id: 'tarjeta_gasto_minimo',
        name: 'Tarjeta Gasto Mínimo',
        tipo: 'Tarjeta_gasto_minimo',
        description: 'Gasto mínimo mensual con tarjeta del banco',
        regla_verificacion: {
          tipo: 'gasto_tarjeta',
          umbral_minimo: 600,
          periodicidad: 'mensual',
          excluir_cajeros: true
        },
        coste_estimado_anual: 0
      },
      {
        id: 'seguro_hogar',
        name: 'Seguro Hogar',
        tipo: 'Seguro_hogar',
        description: 'Contratación de seguro de hogar con la entidad',
        regla_verificacion: {
          tipo: 'cargo_periodico',
          patron: 'Seguro|MAPFRE|AXA|ZURICH',
          periodicidad: 'anual_o_semestral'
        },
        coste_estimado_anual: 200
      },
      {
        id: 'seguro_vida',
        name: 'Seguro Vida',
        tipo: 'Seguro_vida',
        description: 'Contratación de seguro de vida con la entidad',
        regla_verificacion: {
          tipo: 'cargo_periodico',
          patron: 'Vida|LIFE|Seguro Vida',
          periodicidad: 'anual_o_semestral'
        },
        coste_estimado_anual: 150
      },
      {
        id: 'plan_pensiones',
        name: 'Plan de Pensiones',
        tipo: 'Plan_pensiones',
        description: 'Aportaciones a plan de pensiones del banco',
        regla_verificacion: {
          tipo: 'aportacion_anual',
          patron: 'Plan Pensiones|Pension|PENSION',
          umbral_minimo: 1200,
          periodicidad: 'anual'
        },
        coste_estimado_anual: 1200
      },
      {
        id: 'alarma_partner',
        name: 'Alarma/Partner',
        tipo: 'Alarma_partner',
        description: 'Servicios de partner (alarma, telecomunicaciones)',
        regla_verificacion: {
          tipo: 'cargo_mensual',
          patron: 'Securitas|Prosegur|ADT|Movistar|Vodafone',
          periodicidad: 'mensual'
        },
        coste_estimado_anual: 300
      },
      {
        id: 'cuenta_digital',
        name: 'Cuenta Digital',
        tipo: 'Cuenta_digital',
        description: 'Operativa 100% digital',
        regla_verificacion: {
          tipo: 'configuracion',
          requiere_banca_digital: true
        },
        coste_estimado_anual: 0
      }
    ];
  }

  getInitialState() {
    return {
      accounts: [],
      properties: [],
      loans: [],
      contracts: [], // H13: Rental contracts
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
      // H9B: CAPEX Management System
      capexProjects: [], // CAPEX projects for properties
      capexItems: [], // Individual CAPEX items linked to projects and documents
      // H11: Enhanced Loan Management System
      loanVinculaciones: [], // Loan bonification products per loan
      loanCostesComisiones: [], // Loan costs and commissions per loan
      bankTemplates: this.initializeBankTemplates(), // Predefined bank product templates
      vinculacionCatalog: this.initializeVinculacionCatalog(), // Product catalog for vinculaciones
      loanAlerts: [], // Loan-specific alerts (revisions, bonifications at risk, etc.)
      loanProjections: [], // Loan projections and scenarios
      fiscalConfig: {
        rcAnnualLimit: 1000, // R/C annual limit per property (€)
        rcCarryoverYears: 4, // Years to carry over unused R/C limit
        furnitureDepreciationYears: 10, // Furniture depreciation period
        improvementCapitalizationThreshold: 600 // Minimum for capitalizable improvements
      },
      fiscalTreatments: [
        { 
          id: 'rc_maintenance', 
          name: 'Reparación/Conservación (R/C)', 
          description: 'Deducible hasta límite anual, arrastre 4 años',
          type: 'deductible_limited',
          annualLimit: true,
          carryover: true
        },
        { 
          id: 'improvement_capitalizable', 
          name: 'Mejora capitalizable', 
          description: 'Se capitaliza al edificio, no deducible',
          type: 'capitalizable',
          annualLimit: false,
          carryover: false
        },
        { 
          id: 'furniture_depreciable', 
          name: 'Mobiliario amortizable', 
          description: 'Amortizable en 10 años',
          type: 'depreciable',
          annualLimit: false,
          carryover: false,
          depreciationYears: 10
        },
        { 
          id: 'operational_expense', 
          name: 'Gasto operacional', 
          description: 'Deducible íntegramente',
          type: 'deductible',
          annualLimit: false,
          carryover: false
        }
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
        console.log('Loading data from localStorage');
        const parsedData = JSON.parse(stored);
        this.state = { ...this.getInitialState(), ...parsedData };
        
        // Restore lastActivityTime from stored data
        this.lastActivityTime = this.state.lastActivityTime || null;
        
        console.log(`Loaded store with ${this.state.properties?.length || 0} properties`);
        
        // Check if this looks like genuine user data
        const hasUserProperties = this.state.properties?.length > 0;
        const hasActivity = this.state.lastActivityTime != null;
        
        // If we have user properties or activity markers, respect the stored data
        if (hasUserProperties || hasActivity) {
          console.log('User data detected, preserving stored properties');
          this.notifySubscribers();
          return;
        }
        
        // If no user content but we have some demo data structure, keep it
        const hasAnyData = this.state.accounts?.length > 0 || 
                         this.state.documents?.length > 0;
        
        if (hasAnyData) {
          console.log('Keeping existing demo data structure');
          this.notifySubscribers();
          return;
        }
      }
      
      // Only load demo data if no localStorage data exists at all
      console.log('No stored data found, loading demo data');
      this.resetDemo();
      
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
    
    // Mark recent activity to prevent demo reset
    this.markRecentActivity();
    
    // Update state with new properties
    this.setState({ properties });
    
    console.log('Property added successfully:', property.alias);
    console.log('Total properties now:', properties.length);
  }
  
  // Track recent activity to prevent demo reset interference
  markRecentActivity() {
    const now = Date.now();
    this.lastActivityTime = now;
    
    // Update state with activity marker
    this.state = { 
      ...this.state, 
      lastActivityTime: now,
      lastUpdate: new Date().toISOString() 
    };
    
    // Save immediately to localStorage
    this.save();
    
    console.log('Activity marked at:', new Date(now).toISOString());
  }
  
  hasRecentActivity() {
    if (!this.lastActivityTime) return false;
    const timeSinceActivity = Date.now() - this.lastActivityTime;
    // Consider activity recent if within last 5 minutes
    return timeSinceActivity < 5 * 60 * 1000;
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

  // H13: Contract operations for comprehensive rental contract management
  addContract(contract) {
    const contracts = [...this.state.contracts, { 
      ...contract, 
      id: contract.id || Date.now(), 
      createdAt: new Date().toISOString() 
    }];
    this.setState({ contracts });
  }

  updateContract(contractData) {
    const contracts = this.state.contracts.map(contract => 
      contract.id === contractData.id ? { ...contract, ...contractData } : contract
    );
    this.setState({ contracts });
  }

  deleteContract(id) {
    const contracts = this.state.contracts.filter(contract => contract.id !== id);
    this.setState({ contracts });
  }

  // H13: Generate rent calendar for a contract
  generateRentCalendar(contract, months = 12) {
    const calendar = [];
    const startDate = new Date(contract.fechas?.fecha_inicio || contract.startDate);
    const rentAmount = parseFloat(contract.renta?.importe_base_mes || contract.monthlyAmount || 0);
    const paymentDay = contract.renta?.dia_vencimiento || 1;
    
    for (let i = 0; i < months; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);
      paymentDate.setDate(paymentDay);
      
      // Handle month overflow (e.g., Jan 31 -> Feb 28)
      if (paymentDate.getDate() !== paymentDay) {
        paymentDate.setDate(0); // Last day of previous month
      }
      
      calendar.push({
        month: paymentDate.getMonth(),
        year: paymentDate.getFullYear(),
        date: paymentDate.toLocaleDateString('es-ES'),
        amount: rentAmount,
        status: i === 0 ? 'Pendiente' : 'Programado',
        isPaid: false,
        paymentId: null
      });
    }
    
    return calendar;
  }

  // H13: Apply rent indexation
  applyRentIndexation(contractId, indexValue, newRentAmount) {
    const contracts = this.state.contracts.map(contract => {
      if (contract.id === contractId) {
        const historialActualizaciones = contract.historial_actualizaciones || [];
        historialActualizaciones.push({
          fecha: new Date().toISOString(),
          indice_valor: indexValue,
          renta_anterior: contract.renta?.importe_base_mes || contract.monthlyAmount,
          renta_nueva: newRentAmount,
          metodo: contract.actualizacion?.metodo,
          id: Date.now()
        });

        return {
          ...contract,
          renta: {
            ...contract.renta,
            importe_base_mes: newRentAmount
          },
          monthlyAmount: newRentAmount, // Legacy field
          historial_actualizaciones: historialActualizaciones,
          actualizacion: {
            ...contract.actualizacion,
            ultima_revision: new Date().toISOString().split('T')[0],
            proxima_revision: this.calculateNextRentRevision(contract)
          }
        };
      }
      return contract;
    });
    
    this.setState({ contracts });
  }

  // H13: Calculate next rent revision date
  calculateNextRentRevision(contract) {
    const periodicidad = contract.actualizacion?.periodicidad_meses || 12;
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + periodicidad);
    return nextDate.toISOString().split('T')[0];
  }

  // H13: Register rent payment
  registerRentPayment(contractId, paymentData) {
    const contracts = this.state.contracts.map(contract => {
      if (contract.id === contractId) {
        const historialPagos = contract.historial_pagos || [];
        historialPagos.push({
          ...paymentData,
          fecha: new Date().toISOString(),
          id: Date.now()
        });

        return {
          ...contract,
          historial_pagos: historialPagos
        };
      }
      return contract;
    });
    
    this.setState({ contracts });
  }

  // H13: Extend/renew contract
  renewContract(contractId, renewalData) {
    const contracts = this.state.contracts.map(contract => {
      if (contract.id === contractId) {
        const historialRenovaciones = contract.historial_renovaciones || [];
        historialRenovaciones.push({
          fecha: new Date().toISOString(),
          fecha_fin_anterior: contract.fechas?.fecha_fin_prevista || contract.endDate,
          fecha_fin_nueva: renewalData.nueva_fecha_fin,
          renta_anterior: contract.renta?.importe_base_mes || contract.monthlyAmount,
          renta_nueva: renewalData.nueva_renta || contract.renta?.importe_base_mes || contract.monthlyAmount,
          id: Date.now()
        });

        return {
          ...contract,
          fechas: {
            ...contract.fechas,
            fecha_fin_prevista: renewalData.nueva_fecha_fin
          },
          endDate: renewalData.nueva_fecha_fin, // Legacy field
          renta: {
            ...contract.renta,
            importe_base_mes: renewalData.nueva_renta || contract.renta?.importe_base_mes
          },
          monthlyAmount: renewalData.nueva_renta || contract.monthlyAmount, // Legacy field
          historial_renovaciones: historialRenovaciones
        };
      }
      return contract;
    });
    
    this.setState({ contracts });
  }

  // H11: Enhanced Loan operations with comprehensive features
  updateLoan(id, updates) {
    const loans = this.state.loans.map(loan => 
      loan.id === id ? { ...loan, ...updates } : loan
    );
    this.setState({ loans });
  }

  addLoan(loanData) {
    const newLoan = {
      ...loanData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      // H11: Enhanced loan structure
      cuadroAmortizacion: this.generateAmortizationTable(loanData),
      tnaEfectivo: this.calculateEffectiveTNA(loanData),
      vinculaciones: loanData.vinculaciones || [],
      costesComisiones: loanData.costesComisiones || [],
      alertas: []
    };
    
    const loans = [...this.state.loans, newLoan];
    this.setState({ loans });
    return newLoan;
  }

  addAmortization(loanId, amount) {
    const loans = this.state.loans.map(loan => {
      if (loan.id === loanId) {
        const newPendingCapital = Math.max(0, loan.pendingCapital - amount);
        const amortizationEntry = {
          amount,
          date: new Date().toISOString(),
          newPendingCapital
        };
        
        // Recalculate amortization table
        const updatedLoan = { 
          ...loan, 
          pendingCapital: newPendingCapital,
          lastAmortization: amortizationEntry
        };
        
        // Regenerate amortization table from current state
        updatedLoan.cuadroAmortizacion = this.generateAmortizationTable(updatedLoan);
        
        return updatedLoan;
      }
      return loan;
    });
    this.setState({ loans });
  }

  // H11: French method amortization table generation
  generateAmortizationTable(loan) {
    const {
      principal_inicial = loan.originalAmount || loan.pendingCapital,
      pendingCapital = loan.pendingCapital || principal_inicial,
      tna_fijo = loan.interestRate,
      tna_variable = loan.interestRate,
      tipo = loan.interestType || 'fijo',
      plazo_meses = loan.remainingMonths || 240,
      fecha_inicio = loan.startDate || new Date().toISOString().split('T')[0]
    } = loan;

    const monthlyRate = (tipo === 'fijo' ? tna_fijo : tna_variable) / 100 / 12;
    const startDate = new Date(fecha_inicio);
    const table = [];
    let remainingCapital = pendingCapital;

    // French method: fixed monthly payment
    const monthlyPayment = (remainingCapital * monthlyRate * Math.pow(1 + monthlyRate, plazo_meses)) / 
                           (Math.pow(1 + monthlyRate, plazo_meses) - 1);

    for (let month = 1; month <= plazo_meses && remainingCapital > 0.01; month++) {
      const paymentDate = new Date(startDate);
      // Properly add months while preserving the day of month
      const targetMonth = startDate.getMonth() + month;
      const targetYear = startDate.getFullYear() + Math.floor(targetMonth / 12);
      const finalMonth = targetMonth % 12;
      
      paymentDate.setFullYear(targetYear, finalMonth, startDate.getDate());
      
      // Handle cases where the target day doesn't exist in target month (e.g., Jan 31 -> Feb 31)
      if (paymentDate.getMonth() !== finalMonth) {
        // If we overflowed to next month, set to last day of target month
        paymentDate.setFullYear(targetYear, finalMonth + 1, 0);
      }

      const interestPayment = remainingCapital * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingCapital = Math.max(0, remainingCapital - principalPayment);

      table.push({
        mes: month,
        fecha: paymentDate.toISOString().split('T')[0],
        cuota: Math.round(monthlyPayment * 100) / 100,
        interes: Math.round(interestPayment * 100) / 100,
        amortizacion: Math.round(principalPayment * 100) / 100,
        pendiente: Math.round(remainingCapital * 100) / 100,
        tipoAplicado: tipo === 'fijo' ? tna_fijo : tna_variable
      });
    }

    return table;
  }

  // H11: Calculate effective TNA with bonifications
  calculateEffectiveTNA(loan) {
    const baseTNA = loan.interestRate || 0;
    const bonificaciones = loan.vinculaciones || [];
    
    let totalBonificacionBps = 0;
    
    // Sum all active bonifications
    bonificaciones.forEach(vinculacion => {
      if (vinculacion.activo && vinculacion.estado === 'Cumplida') {
        totalBonificacionBps += vinculacion.bonificacion_bps || 0;
        
        // Add conditional bonuses
        if (vinculacion.conditional_bonus) {
          vinculacion.conditional_bonus.forEach(bonus => {
            if (this.evaluateConditionalBonus(bonus, bonificaciones)) {
              totalBonificacionBps += bonus.extra_bps || 0;
            }
          });
        }
      }
    });

    // Apply group bonuses (X de N)
    totalBonificacionBps += this.calculateGroupBonuses(bonificaciones);

    // Apply bundle bonuses
    totalBonificacionBps += this.calculateBundleBonuses(bonificaciones);

    return Math.max(0, baseTNA - (totalBonificacionBps / 100));
  }

  // H11: Evaluate conditional bonus rules
  evaluateConditionalBonus(bonus, vinculaciones) {
    if (!bonus.if_all || !Array.isArray(bonus.if_all)) return false;
    
    return bonus.if_all.every(requiredId => 
      vinculaciones.some(v => v.id === requiredId && v.activo && v.estado === 'Cumplida')
    );
  }

  // H11: Calculate group bonuses (X de N)
  calculateGroupBonuses(vinculaciones) {
    const groups = {};
    
    // Group vinculaciones by group_id
    vinculaciones.forEach(v => {
      if (v.group_id) {
        if (!groups[v.group_id]) groups[v.group_id] = [];
        groups[v.group_id].push(v);
      }
    });

    let totalGroupBonus = 0;
    
    Object.values(groups).forEach(group => {
      const activeCount = group.filter(v => v.activo && v.estado === 'Cumplida').length;
      const policy = group[0].group_policy;
      
      if (policy && this.evaluateGroupPolicy(policy, activeCount)) {
        totalGroupBonus += group[0].group_bonus_bps || 0;
      }
    });

    return totalGroupBonus;
  }

  // H11: Calculate bundle bonuses  
  calculateBundleBonuses(vinculaciones) {
    const bundles = {};
    
    // Group vinculaciones by bundle_id
    vinculaciones.forEach(v => {
      if (v.bundle_id) {
        if (!bundles[v.bundle_id]) bundles[v.bundle_id] = [];
        bundles[v.bundle_id].push(v);
      }
    });

    let totalBundleBonus = 0;
    
    Object.values(bundles).forEach(bundle => {
      const allActive = bundle.every(v => v.activo && v.estado === 'Cumplida');
      if (allActive) {
        totalBundleBonus += bundle[0].bundle_bonus_bps || 0;
      }
    });

    return totalBundleBonus;
  }

  // H11: Evaluate group policy (at_least_k, exactly_k, at_most_k)
  evaluateGroupPolicy(policy, activeCount) {
    switch (policy.type) {
      case 'at_least_k':
        return activeCount >= policy.k;
      case 'exactly_k':
        return activeCount === policy.k;
      case 'at_most_k':
        return activeCount <= policy.k;
      default:
        return false;
    }
  }

  // H11: Register interest rate revision
  registerRateRevision(loanId, revisionData) {
    const loans = this.state.loans.map(loan => {
      if (loan.id === loanId) {
        const historialRevisiones = loan.historial_revisiones || [];
        historialRevisiones.push({
          ...revisionData,
          fecha: new Date().toISOString(),
          id: Date.now()
        });

        const updatedLoan = {
          ...loan,
          interestRate: revisionData.nuevo_tna,
          historial_revisiones: historialRevisiones,
          nextRevision: this.calculateNextRevisionDate(loan, revisionData.fecha)
        };

        // Recalculate amortization table from revision date
        updatedLoan.cuadroAmortizacion = this.generateAmortizationTable(updatedLoan);
        updatedLoan.tnaEfectivo = this.calculateEffectiveTNA(updatedLoan);

        return updatedLoan;
      }
      return loan;
    });
    
    this.setState({ loans });
  }

  // H11: Calculate next revision date
  calculateNextRevisionDate(loan, currentRevisionDate) {
    const currentDate = new Date(currentRevisionDate);
    const revisionFreq = loan.freq_revision_meses || 12;
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + revisionFreq);
    return nextDate.toISOString().split('T')[0];
  }

  // H11: Refinance loan (create new, mark old as cancelled)
  refinanceLoan(oldLoanId, newLoanData) {
    const oldLoan = this.state.loans.find(l => l.id === oldLoanId);
    if (!oldLoan) return null;

    // Create new loan with current pending capital
    const newLoan = {
      ...newLoanData,
      id: Date.now(),
      principal_inicial: oldLoan.pendingCapital,
      pendingCapital: oldLoan.pendingCapital,
      refinanced_from: oldLoanId,
      createdAt: new Date().toISOString()
    };

    // Mark old loan as cancelled
    const loans = this.state.loans.map(loan => {
      if (loan.id === oldLoanId) {
        return {
          ...loan,
          status: 'Cancelado por refinanciación',
          refinanced_to: newLoan.id,
          cancellationDate: new Date().toISOString()
        };
      }
      return loan;
    });

    // Add new loan
    loans.push(this.addLoanCalculations(newLoan));
    this.setState({ loans });
    
    return newLoan;
  }

  // H11: Add calculated fields to loan
  addLoanCalculations(loan) {
    return {
      ...loan,
      cuadroAmortizacion: this.generateAmortizationTable(loan),
      tnaEfectivo: this.calculateEffectiveTNA(loan),
      monthlyPayment: this.calculateMonthlyPayment(loan)
    };
  }

  // H11: Calculate monthly payment using French method
  calculateMonthlyPayment(loan) {
    const capital = loan.pendingCapital || loan.principal_inicial || 0;
    const monthlyRate = (loan.tnaEfectivo || loan.interestRate || 0) / 100 / 12;
    const months = loan.plazo_meses || loan.remainingMonths || 240;
    
    if (monthlyRate === 0) return capital / months;
    
    return (capital * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
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

  // H10: Send inbox entry to invoices with OCR processing
  sendInboxEntryToInvoices(entryId) {
    const entry = this.state.inboxEntries.find(e => e.id === entryId);
    if (!entry) return;

    // Convert inbox entry to document
    const document = {
      provider: entry.provider !== 'Pendiente OCR' ? entry.provider : 'Proveedor simulado',
      concept: entry.concept || 'Concepto detectado por OCR',
      amount: entry.amount || 150.00,
      status: 'Validada',
      category: 'Servicios',
      propertyId: null,
      isDeductible: true,
      hasOcr: true,
      ocrText: entry.ocrText || null,
      ocrConfidence: entry.ocrConfidence || null,
      ocrLang: entry.ocrLang || null,
      pagesOcr: entry.pagesOcr || null
    };

    // Add to documents
    this.addDocument(document);

    // Remove from inbox
    const inboxEntries = this.state.inboxEntries.filter(e => e.id !== entryId);
    this.setState({ inboxEntries });
  }

  // H10: Update inbox entry with OCR results
  updateInboxEntryOCR(entryId, ocrResults) {
    const inboxEntries = this.state.inboxEntries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          status: 'OCR listo',
          ocrText: ocrResults.text,
          ocrConfidence: ocrResults.confidence,
          ocrLang: ocrResults.language,
          pagesOcr: ocrResults.pagesOcr,
          // Pre-fill extracted data
          provider: ocrResults.extractedData.provider || entry.provider,
          concept: ocrResults.extractedData.concept || entry.concept,
          amount: ocrResults.extractedData.total || entry.amount,
          hasOcr: true
        };
      }
      return entry;
    });
    this.setState({ inboxEntries });
  }

  // H10: Set OCR processing status
  setInboxEntryOCRStatus(entryId, status, errorMessage = null) {
    const inboxEntries = this.state.inboxEntries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          status: status,
          ocrError: errorMessage
        };
      }
      return entry;
    });
    this.setState({ inboxEntries });
  }

  // H10: Process multiple documents with OCR
  async processDocumentsWithOCR(entryIds) {
    // This will be called from the UI to trigger OCR processing
    entryIds.forEach(id => {
      this.setInboxEntryOCRStatus(id, 'OCR en curso');
    });

    // Return the IDs for the UI to handle actual OCR processing
    return entryIds;
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
    
    // Check for upcoming contract expirations
    contracts.forEach(contract => {
      const endDate = contract.fechas?.fecha_fin_prevista || contract.endDate;
      if (endDate) {
        const contractEnd = new Date(endDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((contractEnd - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
          const property = this.state.properties.find(p => p.id === (contract.inmuebleId || contract.propertyId));
          const tenantName = contract.arrendatarios?.[0]?.nombre || contract.tenant;
          
          this.addAlert({
            type: 'contract_expiry',
            severity: daysUntilExpiry <= 30 ? 'high' : 'medium',
            title: 'Contrato próximo a vencer',
            description: `${tenantName} (${property?.address || 'Inmueble'}) vence en ${daysUntilExpiry} días`,
            propertyId: contract.inmuebleId || contract.propertyId,
            contractId: contract.id,
            dueDate: endDate,
            actions: ['open_contract', 'renew_contract', 'postpone', 'dismiss']
          });
          
          changes.push({
            type: 'alert_created',
            description: `Alerta creada para vencimiento de contrato: ${tenantName}`
          });
        }
      }
      
      // Check for upcoming rent payments
      const paymentDay = contract.renta?.dia_vencimiento || 1;
      const now = new Date();
      const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, paymentDay);
      const daysUntilPayment = Math.ceil((nextPaymentDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilPayment <= 7 && daysUntilPayment > 0 && contract.status === 'Activo') {
        const tenantName = contract.arrendatarios?.[0]?.nombre || contract.tenant;
        const rentAmount = contract.renta?.importe_base_mes || contract.monthlyAmount;
        
        this.addAlert({
          type: 'rent_payment_due',
          severity: 'medium',
          title: 'Cobro de alquiler próximo',
          description: `${tenantName} - Pago mensual vence en ${daysUntilPayment} días`,
          propertyId: contract.inmuebleId || contract.propertyId,
          contractId: contract.id,
          amount: rentAmount,
          dueDate: nextPaymentDate.toISOString().split('T')[0],
          actions: ['open_contract', 'mark_paid', 'send_reminder', 'dismiss']
        });
        
        changes.push({
          type: 'alert_created',
          description: `Alerta creada para cobro de alquiler: ${tenantName}`
        });
      }
      
      // Check for rent indexation opportunities
      if (contract.actualizacion?.metodo === 'Indice' && contract.status === 'Activo') {
        const startDate = new Date(contract.fechas?.fecha_inicio || contract.startDate);
        const periodicidad = contract.actualizacion.periodicidad_meses || 12;
        const lastUpdate = contract.actualizacion.ultima_revision ? new Date(contract.actualizacion.ultima_revision) : startDate;
        
        const nextRevisionDate = new Date(lastUpdate);
        nextRevisionDate.setMonth(nextRevisionDate.getMonth() + periodicidad);
        
        const now = new Date();
        const daysUntilRevision = Math.ceil((nextRevisionDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRevision <= 0 && daysUntilRevision >= -30) { // Eligible for indexation
          const tenantName = contract.arrendatarios?.[0]?.nombre || contract.tenant;
          const currentRent = contract.renta?.importe_base_mes || contract.monthlyAmount;
          const suggestedIncrease = 2.8; // Mock IPC increase
          const newAmount = currentRent * (1 + suggestedIncrease / 100);
          
          this.addAlert({
            type: 'rent_indexation',
            severity: 'low',
            title: 'Actualización de renta disponible',
            description: `Contrato ${tenantName} elegible para revisión ${contract.actualizacion.indice_label} (+${suggestedIncrease}%)`,
            propertyId: contract.inmuebleId || contract.propertyId,
            contractId: contract.id,
            suggestedIncrease,
            newAmount,
            actions: ['open_contract', 'apply_indexation', 'postpone', 'dismiss']
          });
          
          changes.push({
            type: 'alert_created',
            description: `Alerta creada para actualización de renta: ${tenantName}`
          });
        }
      }
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
          concept: 'Factura electricidad',
          category: 'Suministros',
          type: 'Factura',
          status: 'Asignada a CAPEX',
          recurrence: 'monthly',
          propertyId: 1,
          fiscalTreatment: 'operational_expense',
          capexProjectId: 1
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
      ],
      // H9B: CAPEX data for demonstration
      capexProjects: [
        {
          id: 1,
          name: 'Reforma cocina 2024',
          description: 'Renovación completa de la cocina del inmueble',
          propertyId: 1,
          propertyName: 'Calle Ejemplo 123, 2ºA',
          totalBudget: 8000,
          spentAmount: 3500,
          documentCount: 3,
          status: 'active',
          category: 'improvement',
          fiscalTreatment: 'improvement_capitalizable',
          createdDate: '2024-01-01T00:00:00.000Z'
        }
      ],
      capexItems: [
        {
          id: 1,
          projectId: 1,
          documentId: 1,
          lineItemId: null,
          assignedDate: '2024-01-10T00:00:00.000Z'
        }
      ],
      fiscalConfig: {
        rcAnnualLimit: 1000,
        rcCarryoverYears: 4,
        furnitureDepreciationYears: 10,
        improvementCapitalizationThreshold: 600
      },
      fiscalTreatments: [
        { 
          id: 'rc_maintenance', 
          name: 'Reparación/Conservación (R/C)', 
          description: 'Deducible hasta límite anual, arrastre 4 años',
          type: 'deductible_limited',
          annualLimit: true,
          carryover: true
        },
        { 
          id: 'improvement_capitalizable', 
          name: 'Mejora capitalizable', 
          description: 'Se capitaliza al edificio, no deducible',
          type: 'capitalizable',
          annualLimit: false,
          carryover: false
        },
        { 
          id: 'furniture_depreciable', 
          name: 'Mobiliario amortizable', 
          description: 'Amortizable en 10 años',
          type: 'depreciable',
          annualLimit: false,
          carryover: false,
          depreciationYears: 10
        },
        { 
          id: 'operational_expense', 
          name: 'Gasto operacional', 
          description: 'Deducible íntegramente',
          type: 'deductible',
          annualLimit: false,
          carryover: false
        }
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

  // H9B: CAPEX Management Methods
  
  // Create a new CAPEX project
  addCapexProject(project) {
    const capexProjects = [...this.state.capexProjects, {
      ...project,
      id: Date.now(),
      createdDate: new Date().toISOString(),
      status: 'active', // active, completed, cancelled
      totalBudget: project.totalBudget || 0,
      spentAmount: 0,
      documentCount: 0
    }];
    this.setState({ capexProjects });
    return capexProjects[capexProjects.length - 1];
  }

  // Update CAPEX project
  updateCapexProject(projectId, updates) {
    const capexProjects = this.state.capexProjects.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    );
    this.setState({ capexProjects });
  }

  // Add document breakdown with line items
  addDocumentBreakdown(documentId, lineItems) {
    // Update the document with line items
    const documents = this.state.documents.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          hasBreakdown: true,
          lineItems: lineItems.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
            documentId: documentId
          }))
        };
      }
      return doc;
    });
    
    this.setState({ documents });
  }

  // Assign document or line item to CAPEX project
  assignToCapexProject(projectId, documentId, lineItemId = null) {
    const capexItems = [...this.state.capexItems, {
      id: Date.now(),
      projectId: projectId,
      documentId: documentId,
      lineItemId: lineItemId,
      assignedDate: new Date().toISOString()
    }];
    
    // Update document status
    const documents = this.state.documents.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          capexProjectId: projectId,
          status: 'Asignada a CAPEX'
        };
      }
      return doc;
    });
    
    // Update project totals
    this.recalculateCapexProjectTotals(projectId);
    
    this.setState({ capexItems, documents });
  }

  // Recalculate CAPEX project totals
  recalculateCapexProjectTotals(projectId) {
    const projectItems = this.state.capexItems.filter(item => item.projectId === projectId);
    let totalSpent = 0;
    let documentCount = 0;
    
    projectItems.forEach(item => {
      const document = this.state.documents.find(doc => doc.id === item.documentId);
      if (document) {
        if (item.lineItemId) {
          // If it's a line item, find the specific line
          const lineItem = document.lineItems?.find(line => line.id === item.lineItemId);
          if (lineItem) {
            totalSpent += lineItem.amount || 0;
          }
        } else {
          // If it's the entire document
          totalSpent += document.amount || 0;
          documentCount++;
        }
      }
    });
    
    // Update project
    const capexProjects = this.state.capexProjects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          spentAmount: totalSpent,
          documentCount: documentCount
        };
      }
      return project;
    });
    
    this.setState({ capexProjects });
  }

  // Get CAPEX summary for a property
  getCapexSummaryForProperty(propertyId) {
    const propertyProjects = this.state.capexProjects.filter(project => project.propertyId === propertyId);
    const currentYear = new Date().getFullYear();
    
    const summary = {
      totalCapex: 0,
      currentYearCapex: 0,
      pendingCapex: 0,
      projectCount: propertyProjects.length,
      activeProjects: 0,
      rcUsed: 0,
      rcAvailable: this.state.fiscalConfig.rcAnnualLimit
    };
    
    propertyProjects.forEach(project => {
      summary.totalCapex += project.spentAmount || 0;
      
      if (project.status === 'active') {
        summary.activeProjects++;
        summary.pendingCapex += (project.totalBudget || 0) - (project.spentAmount || 0);
      }
      
      // Calculate current year spending
      const projectYear = new Date(project.createdDate).getFullYear();
      if (projectYear === currentYear) {
        summary.currentYearCapex += project.spentAmount || 0;
      }
    });
    
    // Calculate R/C usage for current year
    const currentYearRCItems = this.state.capexItems.filter(item => {
      const document = this.state.documents.find(doc => doc.id === item.documentId);
      if (!document) return false;
      
      const fiscalTreatment = document.fiscalTreatment || 'rc_maintenance';
      const itemYear = new Date(document.uploadDate || document.date).getFullYear();
      
      return fiscalTreatment === 'rc_maintenance' && itemYear === currentYear;
    });
    
    currentYearRCItems.forEach(item => {
      const document = this.state.documents.find(doc => doc.id === item.documentId);
      if (document) {
        if (item.lineItemId) {
          const lineItem = document.lineItems?.find(line => line.id === item.lineItemId);
          if (lineItem) {
            summary.rcUsed += lineItem.amount || 0;
          }
        } else {
          summary.rcUsed += document.amount || 0;
        }
      }
    });
    
    summary.rcAvailable = Math.max(0, this.state.fiscalConfig.rcAnnualLimit - summary.rcUsed);
    
    return summary;
  }

  // Get fiscal summary for CAPEX
  getCapexFiscalSummary(propertyId, year = null) {
    const targetYear = year || new Date().getFullYear();
    const propertyProjects = this.state.capexProjects.filter(project => project.propertyId === propertyId);
    
    const summary = {
      year: targetYear,
      rcMaintenance: { used: 0, limit: this.state.fiscalConfig.rcAnnualLimit, available: 0 },
      improvements: { total: 0, capitalized: 0 },
      furniture: { total: 0, annualDepreciation: 0 },
      operational: { total: 0, deducted: 0 }
    };
    
    // Collect all items for the property in the target year
    const yearItems = this.state.capexItems.filter(item => {
      const document = this.state.documents.find(doc => doc.id === item.documentId);
      if (!document) return false;
      
      const itemYear = new Date(document.uploadDate || document.date).getFullYear();
      return itemYear === targetYear && 
             propertyProjects.some(project => project.id === item.projectId);
    });
    
    yearItems.forEach(item => {
      const document = this.state.documents.find(doc => doc.id === item.documentId);
      if (!document) return;
      
      let amount = 0;
      if (item.lineItemId) {
        const lineItem = document.lineItems?.find(line => line.id === item.lineItemId);
        amount = lineItem?.amount || 0;
      } else {
        amount = document.amount || 0;
      }
      
      const fiscalTreatment = document.fiscalTreatment || 'rc_maintenance';
      
      switch (fiscalTreatment) {
        case 'rc_maintenance':
          summary.rcMaintenance.used += amount;
          break;
        case 'improvement_capitalizable':
          summary.improvements.total += amount;
          summary.improvements.capitalized += amount;
          break;
        case 'furniture_depreciable':
          summary.furniture.total += amount;
          summary.furniture.annualDepreciation += amount / this.state.fiscalConfig.furnitureDepreciationYears;
          break;
        case 'operational_expense':
          summary.operational.total += amount;
          summary.operational.deducted += amount;
          break;
      }
    });
    
    summary.rcMaintenance.available = Math.max(0, summary.rcMaintenance.limit - summary.rcMaintenance.used);
    
    return summary;
  }

  // Detect duplicate documents
  detectDuplicateDocuments(newDocument) {
    const duplicates = this.state.documents.filter(doc => {
      // Check amount similarity (±1€)
      const amountDiff = Math.abs((doc.amount || 0) - (newDocument.amount || 0));
      if (amountDiff > 1) return false;
      
      // Check date similarity (±7 days)
      const docDate = new Date(doc.uploadDate || doc.date);
      const newDocDate = new Date(newDocument.uploadDate || newDocument.date);
      const daysDiff = Math.abs(docDate - newDocDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7) return false;
      
      return true;
    });
    
    return duplicates;
  }

  // Add manual CAPEX expense
  addManualCapexExpense(expense) {
    const document = {
      ...expense,
      id: Date.now(),
      uploadDate: new Date().toISOString(),
      type: 'Manual',
      status: 'Validada',
      source: 'manual_capex'
    };
    
    const documents = [...this.state.documents, document];
    this.setState({ documents });
    
    // If assigned to project, create the assignment
    if (expense.capexProjectId) {
      this.assignToCapexProject(expense.capexProjectId, document.id);
    }
    
    return document;
  }

  // Close CAPEX year (fiscal closure)
  closeCapexYear(year, propertyId) {
    const summary = this.getCapexFiscalSummary(propertyId, year);
    
    // Create a closure record
    const capexClosures = this.state.capexClosures || [];
    const closure = {
      id: Date.now(),
      year: year,
      propertyId: propertyId,
      closureDate: new Date().toISOString(),
      fiscalSummary: summary,
      status: 'closed'
    };
    
    capexClosures.push(closure);
    this.setState({ capexClosures });
    
    return closure;
  }

  // H11: Initialize bank templates with vinculaciones
  initializeBankTemplates() {
    return {
      ING: {
        id: 'ING',
        name: 'ING',
        vinculaciones: [
          {
            id: 'ing_hogar',
            tipo: 'Seguro_hogar',
            etiqueta: 'Seguro Hogar',
            bonificacion_bps: 30,
            aplica_sobre: 'spread',
            obligatoria_para_concesion: false
          },
          {
            id: 'ing_vida',
            tipo: 'Seguro_vida',
            etiqueta: 'Seguro Vida',
            bonificacion_bps: 0, // Base 0, conditional +50 if Hogar
            aplica_sobre: 'spread',
            conditional_bonus: [
              { if_all: ['ing_hogar'], extra_bps: 50 }
            ]
          },
          {
            id: 'ing_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 20,
            aplica_sobre: 'spread'
          },
          {
            id: 'ing_recibos',
            tipo: 'Recibos_domiciliados',
            etiqueta: 'Recibos Domiciliados',
            bonificacion_bps: 10,
            aplica_sobre: 'spread'
          }
        ],
        grupos: [
          {
            group_id: 'ing_elige_2_de_4',
            label: 'Elige 2 de 4',
            policy: { type: 'at_least_k', k: 2 },
            member_ids: ['ing_nomina', 'ing_recibos', 'ing_tarjeta', 'ing_plan'],
            group_bonus_bps: 20,
            aplica_sobre: 'spread'
          }
        ]
      },
      SANTANDER: {
        id: 'SANTANDER',
        name: 'Santander',
        vinculaciones: [
          {
            id: 'san_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 25,
            aplica_sobre: 'spread',
            umbral_minimo: 2500 // €/mes
          },
          {
            id: 'san_tarjeta',
            tipo: 'Tarjeta_gasto_minimo',
            etiqueta: 'Tarjeta Gasto Mínimo',
            bonificacion_bps: 15,
            aplica_sobre: 'spread',
            umbral_minimo: 600 // €/mes
          },
          {
            id: 'san_hogar',
            tipo: 'Seguro_hogar',
            etiqueta: 'Seguro Hogar',
            bonificacion_bps: 20,
            aplica_sobre: 'spread'
          }
        ]
      },
      BBVA: {
        id: 'BBVA',
        name: 'BBVA',
        vinculaciones: [
          {
            id: 'bbva_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 30,
            aplica_sobre: 'spread',
            umbral_minimo: 3000
          },
          {
            id: 'bbva_plan',
            tipo: 'Plan_pensiones',
            etiqueta: 'Plan de Pensiones',
            bonificacion_bps: 25,
            aplica_sobre: 'spread',
            umbral_minimo: 1200 // €/año
          }
        ]
      },
      CAIXA: {
        id: 'CAIXA',
        name: 'CaixaBank',
        vinculaciones: [
          {
            id: 'caixa_digital',
            tipo: 'Cuenta_digital',
            etiqueta: 'Cuenta Digital',
            bonificacion_bps: 15,
            aplica_sobre: 'spread'
          }
        ]
      },
      OPENBANK: {
        id: 'OPENBANK',
        name: 'Openbank',
        vinculaciones: [
          {
            id: 'open_digital',
            tipo: 'Cuenta_digital',
            etiqueta: 'Operativa Digital',
            bonificacion_bps: 10,
            aplica_sobre: 'spread'
          }
        ]
      },
      EVO: {
        id: 'EVO',
        name: 'EVO Banco',
        vinculaciones: [
          {
            id: 'evo_nomina',
            tipo: 'Nomina_domiciliada',
            etiqueta: 'Nómina Domiciliada',
            bonificacion_bps: 40,
            aplica_sobre: 'spread'
          }
        ]
      },
      GENERICA: {
        id: 'GENERICA',
        name: 'Plantilla Genérica',
        vinculaciones: []
      }
    };
  }

  // H11: Initialize vinculacion catalog
  initializeVinculacionCatalog() {
    return [
      {
        id: 'nomina_domiciliada',
        name: 'Nómina Domiciliada',
        tipo: 'Nomina_domiciliada',
        description: 'Domiciliación de nómina en la entidad',
        regla_verificacion: {
          tipo: 'movimiento_mensual',
          patron: 'Nómina|Payroll|NOMINA',
          umbral_minimo: 1500,
          periodicidad: 'mensual'
        },
        coste_estimado_anual: 0
      },
      {
        id: 'recibos_domiciliados',
        name: 'Recibos Domiciliados',
        tipo: 'Recibos_domiciliados',
        description: 'Domiciliación de recibos (agua, luz, gas, teléfono)',
        regla_verificacion: {
          tipo: 'cargo_mensual',
          categorias: ['Suministros', 'Telecomunicaciones'],
          minimo_recibos: 3,
          periodicidad: 'mensual'
        },
        coste_estimado_anual: 0
      },
      {
        id: 'tarjeta_gasto_minimo',
        name: 'Tarjeta Gasto Mínimo',
        tipo: 'Tarjeta_gasto_minimo',
        description: 'Gasto mínimo mensual con tarjeta del banco',
        regla_verificacion: {
          tipo: 'gasto_tarjeta',
          umbral_minimo: 600,
          periodicidad: 'mensual',
          excluir_cajeros: true
        },
        coste_estimado_anual: 0
      },
      {
        id: 'seguro_hogar',
        name: 'Seguro Hogar',
        tipo: 'Seguro_hogar',
        description: 'Contratación de seguro de hogar con la entidad',
        regla_verificacion: {
          tipo: 'cargo_periodico',
          patron: 'Seguro|MAPFRE|AXA|ZURICH',
          periodicidad: 'anual_o_semestral'
        },
        coste_estimado_anual: 200
      },
      {
        id: 'seguro_vida',
        name: 'Seguro Vida',
        tipo: 'Seguro_vida',
        description: 'Contratación de seguro de vida con la entidad',
        regla_verificacion: {
          tipo: 'cargo_periodico',
          patron: 'Vida|LIFE|Seguro Vida',
          periodicidad: 'anual_o_semestral'
        },
        coste_estimado_anual: 150
      },
      {
        id: 'plan_pensiones',
        name: 'Plan de Pensiones',
        tipo: 'Plan_pensiones',
        description: 'Aportaciones a plan de pensiones del banco',
        regla_verificacion: {
          tipo: 'aportacion_anual',
          patron: 'Plan Pensiones|Pension|PENSION',
          umbral_minimo: 1200,
          periodicidad: 'anual'
        },
        coste_estimado_anual: 1200
      },
      {
        id: 'alarma_partner',
        name: 'Alarma/Partner',
        tipo: 'Alarma_partner',
        description: 'Servicios de partner (alarma, telecomunicaciones)',
        regla_verificacion: {
          tipo: 'cargo_mensual',
          patron: 'Securitas|Prosegur|ADT|Movistar|Vodafone',
          periodicidad: 'mensual'
        },
        coste_estimado_anual: 300
      },
      {
        id: 'cuenta_digital',
        name: 'Cuenta Digital',
        tipo: 'Cuenta_digital',
        description: 'Operativa 100% digital',
        regla_verificacion: {
          tipo: 'configuracion',
          requiere_banca_digital: true
        },
        coste_estimado_anual: 0
      }
    ];
  }
}

// Create singleton instance
const store = new AtlasStore();

// Initialize store on first import
if (typeof window !== 'undefined') {
  // In browser environment, try to load from localStorage first
  setTimeout(() => {
    console.log('Initializing store from localStorage...');
    store.load();
    
    // Initialize QA mode after data is loaded
    store.initializeQAMode();
  }, 100); // Small delay to allow DOM to be ready
} else {
  // If window is not available (SSR), load demo data for server rendering
  console.log('Window not available, loading demo data for SSR');
  store.resetDemo();
}

export default store;