// Minimal state management with localStorage persistence
export type AtlasMode = 'horizon' | 'pulse';

interface AtlasState {
  mode: AtlasMode;
}

class AtlasStore {
  private state: AtlasState = {
    mode: 'horizon',
  };
  
  private subscribers: Array<(state: AtlasState) => void> = [];
  private readonly STORAGE_KEY = 'atlas:mode';

  constructor() {
    this.loadFromStorage();
  }

  // Load state from localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const savedMode = localStorage.getItem(this.STORAGE_KEY);
      if (savedMode === 'horizon' || savedMode === 'pulse') {
        this.state.mode = savedMode;
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  // Save state to localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, this.state.mode);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Get current state
  getState(): AtlasState {
    return { ...this.state };
  }

  // Set mode
  setMode(mode: AtlasMode): void {
    this.state.mode = mode;
    this.saveToStorage();
    this.notifySubscribers();
  }

  // Subscribe to state changes
  subscribe(callback: (state: AtlasState) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.getState());
      } catch (error) {
        console.error('Error in store subscriber:', error);
      }
    });
  }
}

// Create and export singleton instance
export const store = new AtlasStore();