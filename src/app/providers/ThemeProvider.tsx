import React, { createContext, useContext, ReactNode } from 'react';
import { store, AtlasMode } from '../../lib/store';
import { horizonTheme } from '../../theme/horizon';
import { pulseTheme } from '../../theme/pulse';

interface ThemeContextValue {
  mode: AtlasMode;
  setMode: (mode: AtlasMode) => void;
  theme: typeof horizonTheme | typeof pulseTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [state, setState] = React.useState(store.getState());
  
  React.useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const setMode = React.useCallback((mode: AtlasMode) => {
    store.setMode(mode);
  }, []);

  const theme = state.mode === 'horizon' ? horizonTheme : pulseTheme;

  const value: ThemeContextValue = {
    mode: state.mode,
    setMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}