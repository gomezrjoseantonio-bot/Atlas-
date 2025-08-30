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
    }
  ],

  // Rental contracts
  contracts: [
    {
      id: 1,
      propertyId: 1,
      type: 'Alquiler',
      tenant: 'María García',
      startDate: '2023-06-01',
      endDate: '2025-05-31',
      monthlyAmount: 1200,
      deposit: 2400,
      status: 'Activo'
    },
    {
      id: 2,
      propertyId: 2,
      type: 'Alquiler',
      tenant: 'João Silva',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      monthlyAmount: 850,
      deposit: 1700,
      status: 'Activo'
    },
    {
      id: 3,
      propertyId: 1,
      type: 'Seguro Hogar',
      company: 'Mapfre',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyAmount: 45,
      status: 'Activo'
    },
    {
      id: 4,
      propertyId: 2,
      type: 'Seguro Hogar',
      company: 'AXA',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      monthlyAmount: 38,
      status: 'Próx. vencimiento'
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
      isDeductible: true
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
      isDeductible: true
    },
    {
      id: 3,
      uploadDate: '2024-01-12',
      fileName: 'factura_luz_diciembre.pdf',
      provider: 'Iberdrola',
      concept: 'Suministro eléctrico',
      amount: 89,
      propertyId: 2,
      category: 'Suministros',
      status: 'Error',
      hasOcr: true,
      isDeductible: true
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
      isDeductible: true
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