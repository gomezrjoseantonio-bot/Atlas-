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
      alerts: [...(mockData.scheduledPayments || [])],
      missingInvoices: [...mockData.missingInvoices],
      users: [...mockData.users],
      treasuryRules: [...mockData.treasuryRules],
      scheduledPayments: [...mockData.scheduledPayments],
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
}

// Create singleton instance
const store = new AtlasStore();

// Initialize store on first import
if (typeof window !== 'undefined') {
  store.load();
}

export default store;