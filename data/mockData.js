// Mock data for ATLAS HITO 3 - MVP navegable
export const mockData = {
  // Bank accounts data
  accounts: [
    {
      id: 1,
      name: 'Cuenta Corriente Principal',
      bank: 'BBVA',
      iban: 'ES21 0182 1111 ****',
      balanceToday: 12450.67,
      balanceT7: 15230.45,
      balanceT30: 18670.23,
      targetBalance: 15000,
      health: 'good',
      hidden: false,
      lastUpdate: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      name: 'Cuenta Ahorro Inmuebles',
      bank: 'Santander',
      iban: 'ES45 0049 2222 ****',
      balanceToday: 25800.45,
      balanceT7: 24950.30,
      balanceT30: 23150.80,
      targetBalance: 25000,
      health: 'excellent',
      hidden: false,
      lastUpdate: '2024-01-14T16:45:00'
    },
    {
      id: 3,
      name: 'Cuenta Gastos Inmuebles',
      bank: 'ING',
      iban: 'ES67 1465 3333 ****',
      balanceToday: 3240.12,
      balanceT7: 5680.40,
      balanceT30: 8920.15,
      targetBalance: 5000,
      health: 'warning',
      hidden: false,
      lastUpdate: '2024-01-12T09:15:00'
    },
    {
      id: 4,
      name: 'Cuenta Personal',
      bank: 'CaixaBank',
      iban: 'ES89 2100 4444 ****',
      balanceToday: 4567.89,
      balanceT7: 5234.56,
      balanceT30: 6789.12,
      targetBalance: 5000,
      health: 'good',
      hidden: false,
      lastUpdate: '2024-01-15T08:00:00'
    }
  ],

  // Properties portfolio
  properties: [
    {
      id: 1,
      address: 'Calle Mayor 45, 3ºB',
      city: 'Madrid',
      type: 'Piso',
      purchaseDate: '2020-03-15',
      purchasePrice: 180000,
      currentValue: 195000,
      monthlyRent: 1200,
      monthlyExpenses: 180,
      netProfit: 1020,
      rentability: 6.8,
      occupancy: 100,
      tenant: 'María García',
      contractStart: '2023-06-01',
      contractEnd: '2025-05-31',
      status: 'Ocupado'
    },
    {
      id: 2,
      address: 'Avenida Libertad 23, 1ºA',
      city: 'Barcelona',
      type: 'Estudio',
      purchaseDate: '2021-09-20',
      purchasePrice: 95000,
      currentValue: 102000,
      monthlyRent: 850,
      monthlyExpenses: 120,
      netProfit: 730,
      rentability: 9.2,
      occupancy: 100,
      tenant: 'João Silva',
      contractStart: '2024-01-15',
      contractEnd: '2025-01-14',
      status: 'Ocupado'
    },
    {
      id: 3,
      address: 'Plaza del Sol 12, 2ºC',
      city: 'Valencia',
      type: 'Piso',
      purchaseDate: '2019-11-10',
      purchasePrice: 145000,
      currentValue: 158000,
      monthlyRent: 950,
      monthlyExpenses: 145,
      netProfit: 805,
      rentability: 6.7,
      occupancy: 0,
      tenant: null,
      contractStart: null,
      contractEnd: null,
      status: 'Disponible'
    },
    {
      id: 4,
      address: 'Calle Alcalá 78, 4ºA',
      city: 'Madrid',
      type: 'Piso compartido',
      purchaseDate: '2022-05-15',
      purchasePrice: 220000,
      currentValue: 235000,
      monthlyRent: 1910, // Sum of all unit rents
      monthlyExpenses: 250,
      netProfit: 1660,
      rentability: 8.5,
      occupancy: 60, // 3 out of 5 units occupied
      tenant: 'Varios inquilinos',
      contractStart: '2024-01-01',
      contractEnd: '2024-12-31',
      status: 'Parcialmente ocupado',
      // HITO 7: Multi-unit properties
      multiUnit: true,
      totalUnits: 5,
      occupiedUnits: 3,
      units: [
        {
          id: 4001,
          name: 'H1',
          sqm: 15,
          monthlyRent: 400,
          status: 'Ocupada'
        },
        {
          id: 4002,
          name: 'H2',
          sqm: 12,
          monthlyRent: 350,
          status: 'Ocupada'
        },
        {
          id: 4003,
          name: 'H3',
          sqm: 14,
          monthlyRent: 380,
          status: 'Libre'
        },
        {
          id: 4004,
          name: 'H4',
          sqm: 16,
          monthlyRent: 420,
          status: 'Ocupada'
        },
        {
          id: 4005,
          name: 'H5',
          sqm: 13,
          monthlyRent: 360,
          status: 'Libre'
        }
      ]
    }
  ],

  // Rental contracts with H13 comprehensive model
  contracts: [
    {
      id: 1,
      inmuebleId: 1,
      unidadId: null, // Whole property
      tipo: 'Vivienda_completa',
      arrendador: {
        nombre: 'José Antonio Gómez',
        dni: '12345678A',
        telefono: '+34 600 123 456',
        email: 'jose@example.com'
      },
      arrendatarios: [
        {
          nombre: 'María García',
          dni: '87654321B',
          telefono: '+34 600 654 321',
          email: 'maria@example.com',
          tipo_responsabilidad: 'Solidaria'
        }
      ],
      fechas: {
        fecha_inicio: '2023-06-01',
        fecha_fin_prevista: '2025-05-31',
        prorroga_auto: true
      },
      renta: {
        importe_base_mes: 1200,
        moneda: 'EUR',
        dia_vencimiento: 1,
        prorrateo_entrada: true,
        prorrateo_salida: true
      },
      actualizacion: {
        metodo: 'Indice',
        indice_label: 'IPC',
        periodicidad_meses: 12,
        ultima_revision: '2024-06-01',
        proxima_revision: '2025-06-01'
      },
      fianza: {
        importe: 2400,
        tipo: 'Legal',
        deposito_cuenta: 'Depósito Legal',
        interes_aplicable: false
      },
      garantias: [],
      status: 'Activo',
      // Legacy fields for backward compatibility
      propertyId: 1,
      type: 'Alquiler',
      tenant: 'María García',
      startDate: '2023-06-01',
      endDate: '2025-05-31',
      monthlyAmount: 1200,
      deposit: 2400
    },
    {
      id: 2,
      inmuebleId: 2,
      unidadId: null, // Whole property
      tipo: 'Vivienda_completa',
      arrendador: {
        nombre: 'José Antonio Gómez',
        dni: '12345678A',
        telefono: '+34 600 123 456',
        email: 'jose@example.com'
      },
      arrendatarios: [
        {
          nombre: 'João Silva',
          dni: 'X1234567L',
          telefono: '+34 600 987 654',
          email: 'joao@example.com',
          tipo_responsabilidad: 'Solidaria'
        }
      ],
      fechas: {
        fecha_inicio: '2024-01-15',
        fecha_fin_prevista: '2025-01-14',
        prorroga_auto: false
      },
      renta: {
        importe_base_mes: 850,
        moneda: 'EUR',
        dia_vencimiento: 15,
        prorrateo_entrada: false,
        prorrateo_salida: true
      },
      actualizacion: {
        metodo: 'Fijo_pct',
        porcentaje_anual: 2.5,
        periodicidad_meses: 12,
        ultima_revision: null,
        proxima_revision: '2025-01-15'
      },
      fianza: {
        importe: 1700,
        tipo: 'Legal',
        deposito_cuenta: 'Depósito Legal',
        interes_aplicable: false
      },
      garantias: [],
      status: 'Activo',
      // Legacy fields for backward compatibility
      propertyId: 2,
      type: 'Alquiler',
      tenant: 'João Silva',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      monthlyAmount: 850,
      deposit: 1700
    },
    {
      id: 3,
      inmuebleId: 3,
      unidadId: 'habitacion-1',
      tipo: 'Habitacion',
      arrendador: {
        nombre: 'José Antonio Gómez',
        dni: '12345678A',
        telefono: '+34 600 123 456',
        email: 'jose@example.com'
      },
      arrendatarios: [
        {
          nombre: 'Ana Martínez',
          dni: '11223344C',
          telefono: '+34 600 111 222',
          email: 'ana@example.com',
          tipo_responsabilidad: 'Solidaria'
        }
      ],
      fechas: {
        fecha_inicio: '2024-02-01',
        fecha_fin_prevista: '2024-08-31',
        prorroga_auto: true
      },
      renta: {
        importe_base_mes: 400,
        moneda: 'EUR',
        dia_vencimiento: 1,
        prorrateo_entrada: true,
        prorrateo_salida: true
      },
      actualizacion: {
        metodo: 'Ninguno'
      },
      fianza: {
        importe: 400,
        tipo: 'Legal',
        deposito_cuenta: 'Depósito Legal',
        interes_aplicable: false
      },
      garantias: [],
      status: 'Activo',
      // Legacy fields for backward compatibility
      propertyId: 3,
      type: 'Alquiler Habitación',
      tenant: 'Ana Martínez',
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      monthlyAmount: 400,
      deposit: 400
    },
    {
      id: 4,
      inmuebleId: 1,
      unidadId: null,
      tipo: 'Seguro',
      company: 'Mapfre',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyAmount: 45,
      status: 'Activo',
      // Legacy fields
      propertyId: 1,
      type: 'Seguro Hogar'
    },
    {
      id: 5,
      inmuebleId: 2,
      unidadId: null,
      tipo: 'Seguro', 
      company: 'AXA',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      monthlyAmount: 38,
      status: 'Próximo vencimiento',
      // Legacy fields
      propertyId: 2,
      type: 'Seguro Hogar'
    }
  ],

  // Mortgage loans
  loans: [
    {
      id: 1,
      propertyId: 1,
      bank: 'BBVA',
      product: 'Hipoteca estándar',
      originalAmount: 140000,
      pendingCapital: 98750,
      interestRate: 2.85,
      interestType: 'variable',
      monthlyPayment: 658,
      remainingMonths: 156,
      startDate: '2020-03-15',
      endDate: '2033-03-15',
      nextRevision: '2024-03-15'
    },
    {
      id: 2,
      propertyId: 2,
      bank: 'Santander',
      product: 'Hipoteca estándar',
      originalAmount: 75000,
      pendingCapital: 62400,
      interestRate: 3.15,
      interestType: 'variable',
      monthlyPayment: 445,
      remainingMonths: 142,
      startDate: '2021-09-20',
      endDate: '2033-07-20',
      nextRevision: '2024-09-20'
    }
  ],

  // Recent movements/transactions
  movements: [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Transferencia - Alquiler María García',
      amount: 1200,
      type: 'income',
      accountId: 1,
      category: 'Alquiler',
      propertyId: 1,
      status: 'Regla aplicada',
      hasDocument: true
    },
    {
      id: 2,
      date: '2024-01-15',
      description: 'Pago - Seguro Hogar Mapfre',
      amount: -45,
      type: 'expense',
      accountId: 3,
      category: 'Seguros',
      propertyId: 1,
      status: 'Pendiente',
      hasDocument: false
    },
    {
      id: 3,
      date: '2024-01-14',
      description: 'Transferencia - Alquiler João Silva',
      amount: 850,
      type: 'income',
      accountId: 1,
      category: 'Alquiler',
      propertyId: 2,
      status: 'Regla aplicada',
      hasDocument: true
    },
    {
      id: 4,
      date: '2024-01-12',
      description: 'Pago - Reparación fontanería',
      amount: -125,
      type: 'expense',
      accountId: 3,
      category: 'Mantenimiento',
      propertyId: 1,
      status: 'Excepción',
      hasDocument: false
    },
    {
      id: 5,
      date: '2024-01-10',
      description: 'Nómina Enero',
      amount: 3200,
      type: 'income',
      accountId: 4,
      category: 'Nómina',
      status: 'Regla aplicada',
      hasDocument: true
    }
  ],

  // Treasury rules and sweeps
  treasuryRules: [
    {
      id: 1,
      name: 'Saldo mínimo corriente',
      condition: 'Saldo < 10.000€',
      action: 'Mover desde Ahorro',
      targetAccount: 'Cuenta Ahorro Inmuebles',
      amount: 5000,
      active: true
    },
    {
      id: 2,
      name: 'Exceso en corriente',
      condition: 'Saldo > 20.000€',
      action: 'Mover a Ahorro',
      targetAccount: 'Cuenta Ahorro Inmuebles',
      amount: 10000,
      active: true
    },
    {
      id: 3,
      name: 'Backup gastos inmuebles',
      condition: 'Saldo gastos < 2.000€',
      action: 'Mover desde Principal',
      targetAccount: 'Cuenta Corriente Principal',
      amount: 3000,
      active: false
    }
  ],

  // Scheduled alerts/payments
  scheduledPayments: [
    {
      id: 1,
      description: 'Cuota hipoteca BBVA',
      amount: 658,
      dueDate: '2024-01-28',
      propertyId: 1,
      status: 'pending',
      daysLeft: 13
    },
    {
      id: 2,
      description: 'Cuota hipoteca Santander',
      amount: 445,
      dueDate: '2024-01-20',
      propertyId: 2,
      status: 'pending',
      daysLeft: 5
    },
    {
      id: 3,
      description: 'IBI Valencia',
      amount: 245,
      dueDate: '2024-01-30',
      propertyId: 3,
      status: 'pending',
      daysLeft: 15
    },
    {
      id: 4,
      description: 'Seguro Hogar AXA',
      amount: 38,
      dueDate: '2024-01-16',
      propertyId: 2,
      status: 'today',
      daysLeft: 1
    }
  ],

  // Documents and invoices
  documents: [
    {
      id: 1,
      uploadDate: '2024-01-15',
      fileName: 'factura_mapfre_enero.pdf',
      provider: 'Mapfre',
      concept: 'Seguro Hogar',
      amount: 45,
      propertyId: 1,
      category: 'Seguros',
      status: 'Validada',
      hasOcr: true,
      isDeductible: true,
      // HITO 7: Fiscal information
      expenseFamily: 'operational_fixed',
      fiscalTreatment: 'deductible',
      rentalAffectation: 100
    },
    {
      id: 2,
      uploadDate: '2024-01-14',
      fileName: 'recibo_reparacion.jpg',
      provider: 'Fontanería García',
      concept: 'Reparación grifo cocina',
      amount: 125,
      propertyId: 1,
      category: 'Mantenimiento',
      status: 'Pendiente',
      hasOcr: false,
      isDeductible: true,
      // HITO 7: Fiscal information
      expenseFamily: 'maintenance',
      fiscalTreatment: 'deductible',
      rentalAffectation: 100
    },
    {
      id: 3,
      uploadDate: '2024-01-12',
      fileName: 'factura_luz_diciembre.pdf',
      provider: 'Iberdrola',
      concept: 'Suministro eléctrico',
      amount: 89,
      propertyId: 4, // Multi-unit property
      category: 'Suministros',
      status: 'Error',
      hasOcr: true,
      isDeductible: true,
      // HITO 7: Fiscal information and allocation
      expenseFamily: 'operational_variable',
      fiscalTreatment: 'deductible',
      rentalAffectation: 100,
      allocation: {
        method: 'occupied',
        distribution: {
          4001: { percentage: 33.33, amount: 29.66 },
          4002: { percentage: 33.33, amount: 29.66 },
          4004: { percentage: 33.34, amount: 29.68 }
        },
        excludedUnits: [4003, 4005],
        allocatedAt: '2024-01-12T15:30:00'
      }
    },
    {
      id: 4,
      uploadDate: '2024-01-10',
      fileName: 'gastos_varios.pdf',
      provider: 'Varios',
      concept: 'Gastos mantenimiento',
      amount: 234,
      propertyId: null,
      category: 'Mantenimiento',
      status: 'Listo para asignar',
      hasOcr: true,
      isDeductible: true,
      // HITO 7: Fiscal information
      expenseFamily: 'maintenance',
      fiscalTreatment: 'deductible',
      rentalAffectation: 100
    },
    {
      id: 5,
      uploadDate: '2024-01-08',
      fileName: 'factura_reforma.pdf',
      provider: 'Construcciones López',
      concept: 'Reforma baño completo',
      amount: 3500,
      propertyId: 4,
      category: 'Mejoras',
      status: 'Validada',
      hasOcr: true,
      isDeductible: false,
      // HITO 7: Fiscal information - Capitalizable expense
      expenseFamily: 'improvement',
      fiscalTreatment: 'capitalizable',
      rentalAffectation: 100,
      amortizationYears: 10,
      amortizationStartDate: '2024-01-08',
      allocation: {
        method: 'sqm',
        distribution: {
          4001: { percentage: 21.43, amount: 750.05 },
          4002: { percentage: 17.14, amount: 599.90 },
          4003: { percentage: 20.00, amount: 700.00 },
          4004: { percentage: 22.86, amount: 800.10 },
          4005: { percentage: 18.57, amount: 649.95 }
        },
        allocatedAt: '2024-01-08T12:00:00'
      }
    }
  ],

  // Inbox entries (documents before processing)
  inboxEntries: [
    {
      id: 1,
      uploadDate: '2024-01-15T14:30:00',
      fileName: 'nueva_factura.pdf',
      fileSize: '245KB',
      provider: 'Detectado: Gas Natural',
      status: 'Leído',
      hasOcr: true
    },
    {
      id: 2,
      uploadDate: '2024-01-15T12:15:00',
      fileName: 'recibo_comunidad.jpg',
      fileSize: '1.2MB',
      provider: 'Error OCR',
      status: 'Error lectura',
      hasOcr: false
    },
    {
      id: 3,
      uploadDate: '2024-01-14T16:45:00',
      fileName: 'factura_seguros.pdf',
      fileSize: '189KB',
      provider: 'Detectado: AXA',
      status: 'Pendiente de cargo',
      hasOcr: true
    }
  ],

  // Missing invoices for quick closure
  missingInvoices: [
    {
      id: 1,
      provider: 'Iberdrola',
      date: '2024-01-10',
      amount: 89,
      propertyId: 2,
      concept: 'Suministro eléctrico diciembre'
    },
    {
      id: 2,
      provider: 'Fontanería García',
      date: '2024-01-12',
      amount: 125,
      propertyId: 1,
      concept: 'Reparación fontanería'
    },
    {
      id: 3,
      provider: 'Comunidad Propietarios',
      date: '2024-01-05',
      amount: 156,
      propertyId: 1,
      concept: 'Cuota comunidad enero'
    }
  ],

  // Users and roles
  users: [
    {
      id: 1,
      name: 'José Antonio Gómez',
      email: 'jose@atlas.com',
      role: 'Administrador',
      lastLogin: '2024-01-15T10:30:00',
      status: 'Activo'
    },
    {
      id: 2,
      name: 'María Técnico',
      email: 'maria@atlas.com',
      role: 'Gestor',
      lastLogin: '2024-01-12T14:20:00',
      status: 'Activo'
    }
  ],

  // Projection scenarios
  projectionScenarios: {
    base: {
      occupancyRate: 95,
      rentIncrease: 2,
      expenseIncrease: 3,
      interestRate: 3.0
    },
    optimista: {
      occupancyRate: 98,
      rentIncrease: 4,
      expenseIncrease: 2,
      interestRate: 2.5
    },
    pesimista: {
      occupancyRate: 85,
      rentIncrease: 0,
      expenseIncrease: 5,
      interestRate: 4.0
    }
  },

  // Personal finances (when PERSONAL toggle is ON)
  personalFinances: {
    monthlyNetSalary: 3200,
    monthlyExpenses: 2450,
    irpfProvision: 850,
    ivaProvision: 0,
    estimatedAnnualNet: 38400,
    estimatedAnnualExpenses: 29400
  },

  // HITO 6: Provider classification rules
  providerRules: [
    {
      id: 1,
      providerContains: 'Endesa',
      category: 'Suministros',
      propertyId: null, // null means no specific property assignment
      active: true,
      deductible: true,
      order: 1
    },
    {
      id: 2,
      providerContains: 'Iberdrola',
      category: 'Suministros',
      propertyId: null,
      active: true,
      deductible: true,
      order: 2
    },
    {
      id: 3,
      providerContains: 'Comunidad',
      category: 'Gastos comunidad',
      propertyId: 'auto', // auto-assign to property with "Comunidad" in contracts
      active: true,
      deductible: true,
      order: 3
    },
    {
      id: 4,
      providerContains: 'Administrador',
      category: 'Gastos comunidad',
      propertyId: 'auto',
      active: true,
      deductible: true,
      order: 4
    },
    {
      id: 5,
      providerContains: 'Mapfre',
      category: 'Seguros',
      propertyId: null,
      active: true,
      deductible: true,
      order: 5
    }
  ],

  // HITO 6: Sweep configuration
  sweepConfig: {
    hubAccountId: 2, // Cuenta Ahorro Inmuebles as default hub
    autoSweepEnabled: false,
    movementMatchingDays: 3 // ±3 days for movement-invoice matching
  },

  // HITO 6: Predicted charges and income (next 90 days)
  predictedItems: [
    {
      id: 1,
      type: 'charge',
      description: 'Cuota hipoteca BBVA',
      amount: 658,
      dueDate: '2024-01-28',
      propertyId: 1,
      recurringType: 'monthly',
      source: 'loan'
    },
    {
      id: 2,
      type: 'charge',
      description: 'Cuota hipoteca Santander',
      amount: 445,
      dueDate: '2024-01-20',
      propertyId: 2,
      recurringType: 'monthly',
      source: 'loan'
    },
    {
      id: 3,
      type: 'income',
      description: 'Alquiler María García',
      amount: 1200,
      dueDate: '2024-02-01',
      propertyId: 1,
      recurringType: 'monthly',
      source: 'contract'
    },
    {
      id: 4,
      type: 'income',
      description: 'Alquiler João Silva',
      amount: 850,
      dueDate: '2024-02-15',
      propertyId: 2,
      recurringType: 'monthly',
      source: 'contract'
    },
    {
      id: 5,
      type: 'charge',
      description: 'IBI Valencia',
      amount: 245,
      dueDate: '2024-01-30',
      propertyId: 3,
      recurringType: 'yearly',
      source: 'property'
    }
  ],

  // HITO 6: Alerts system
  alerts: [
    {
      id: 1,
      type: 'low_balance',
      severity: 'critical',
      title: 'Saldo bajo en Cuenta Gastos Inmuebles',
      description: 'La cuenta está por debajo del objetivo (€3.240 < €5.000)',
      accountId: 3,
      suggestedAmount: 1760,
      actions: ['move_money', 'postpone', 'dismiss'],
      createdAt: '2024-01-15T10:00:00',
      dismissed: false
    },
    {
      id: 2,
      type: 'upcoming_charge',
      severity: 'high',
      title: 'Cargo de hipoteca próximo',
      description: 'Cuota hipoteca Santander (€445) - 5 días',
      dueDate: '2024-01-20',
      amount: 445,
      propertyId: 2,
      actions: ['prepare_funds', 'postpone', 'dismiss'],
      createdAt: '2024-01-15T09:00:00',
      dismissed: false
    },
    {
      id: 3,
      type: 'unpaid_invoice',
      severity: 'low',
      title: 'Factura sin cargo',
      description: 'Factura Fontanería García pendiente sin movimiento asociado',
      documentId: 2,
      actions: ['create_predicted_charge', 'postpone', 'dismiss'],
      createdAt: '2024-01-14T16:00:00',
      dismissed: false
    }
  ],

  // HITO 7: Multi-unit demo data
  units: [
    // Units for property 4 (will be added as multi-unit demo)
    {
      id: 4001,
      propertyId: 4,
      name: 'H1',
      sqm: 15,
      monthlyRent: 400,
      status: 'Ocupada'
    },
    {
      id: 4002,
      propertyId: 4,
      name: 'H2',
      sqm: 12,
      monthlyRent: 350,
      status: 'Ocupada'
    },
    {
      id: 4003,
      propertyId: 4,
      name: 'H3',
      sqm: 14,
      monthlyRent: 380,
      status: 'Libre'
    },
    {
      id: 4004,
      propertyId: 4,
      name: 'H4',
      sqm: 16,
      monthlyRent: 420,
      status: 'Ocupada'
    },
    {
      id: 4005,
      propertyId: 4,
      name: 'H5',
      sqm: 13,
      monthlyRent: 360,
      status: 'Libre'
    }
  ],

  unitContracts: [
    {
      id: 1001,
      unitId: 4001,
      type: 'Alquiler',
      tenant: 'Ana Rodríguez',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyAmount: 400,
      deposit: 800,
      status: 'Activo'
    },
    {
      id: 1002,
      unitId: 4002,
      type: 'Alquiler',
      tenant: 'Carlos Méndez',
      startDate: '2024-02-15',
      endDate: '2025-02-14',
      monthlyAmount: 350,
      deposit: 700,
      status: 'Activo'
    },
    {
      id: 1003,
      unitId: 4004,
      type: 'Alquiler',
      tenant: 'Laura Fernández',
      startDate: '2023-11-01',
      endDate: '2024-10-31',
      monthlyAmount: 420,
      deposit: 840,
      status: 'Activo'
    }
  ],

  allocationPreferences: {
    'Endesa_Suministros': { method: 'occupied', lastUsed: '2024-01-15' },
    'Iberdrola_Suministros': { method: 'occupied', lastUsed: '2024-01-10' },
    'Mapfre_Seguros': { method: 'total', lastUsed: '2024-01-05' }
  }
};

// Helper functions for data manipulation
export const getPropertyById = (id) => {
  return mockData.properties.find(p => p.id === id);
};

export const getAccountById = (id) => {
  return mockData.accounts.find(a => a.id === id);
};

export const getMovementsByAccount = (accountId) => {
  return mockData.movements.filter(m => m.accountId === accountId);
};

export const getTotalPortfolioValue = () => {
  return mockData.properties.reduce((total, property) => total + property.currentValue, 0);
};

export const getTotalMonthlyRent = () => {
  return mockData.properties
    .filter(p => p.status === 'Ocupado')
    .reduce((total, property) => total + property.monthlyRent, 0);
};

export const getTotalMonthlyExpenses = () => {
  return mockData.properties.reduce((total, property) => total + property.monthlyExpenses, 0);
};

export const getPortfolioRentability = () => {
  const totalValue = getTotalPortfolioValue();
  const annualRent = getTotalMonthlyRent() * 12;
  const annualExpenses = getTotalMonthlyExpenses() * 12;
  return totalValue > 0 ? ((annualRent - annualExpenses) / totalValue) * 100 : 0;
};

export const getOccupancyRate = () => {
  const totalProperties = mockData.properties.length;
  const occupiedProperties = mockData.properties.filter(p => p.status === 'Ocupado').length;
  return totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
};

export default mockData;