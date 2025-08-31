import '../styles/layout.css'
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ToastSystem from '../components/ToastSystem';
import QABar from '../components/QABar';
import QAPanel from '../components/QAPanel';
import QAPill from '../components/QAPill';
import BrandValidator from '../components/BrandValidator';
import IssueReporter from '../components/IssueReporter';
import actionBridge from '../actions/bridge';
import store from '../store/index';

export default function MyApp({ Component, pageProps }) {
  const [storeState, setStoreState] = useState(() => store.getState());
  const [showIssueReporter, setShowIssueReporter] = useState(false);
  const [qaPanelCollapsed, setQAPanelCollapsed] = useState(false);
  const [qaMode, setQAMode] = useState(() => {
    // Initialize QA mode from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atlas.qa') === 'true';
    }
    return false;
  });
  const [demoMode, setDemoMode] = useState(() => {
    // Initialize Demo mode from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atlas.demo') === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = store.subscribe(setStoreState);
    
    // Initialize ActionBridge when app mounts
    actionBridge.init();
    
    // Add global toast utility
    if (typeof window !== 'undefined') {
      window.showToast = (message, type = 'info') => {
        const event = new CustomEvent('atlas:toast', {
          detail: { message, type }
        });
        document.dispatchEvent(event);
      };

      // Apply theme class to body
      document.body.className = 'theme-invest';

      // Add global theme utility for QA
      window.setTheme = (theme) => {
        document.body.className = theme === 'personal' ? 'theme-personal' : 'theme-invest';
      };

      // Listen for QA panel toggle events
      const handleToggleQAPanel = () => {
        setQAPanelCollapsed(!qaPanelCollapsed);
      };

      document.addEventListener('atlas:toggleQAPanel', handleToggleQAPanel);
      
      return () => {
        // Cleanup on unmount
        unsubscribe();
        actionBridge.destroy();
        document.removeEventListener('atlas:toggleQAPanel', handleToggleQAPanel);
        delete window.showToast;
        delete window.setTheme;
      };
    }
    
    return () => {
      // Cleanup on unmount
      unsubscribe();
      actionBridge.destroy();
    };
  }, [qaPanelCollapsed]);

  // Persist QA mode in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atlas.qa', qaMode.toString());
    }
  }, [qaMode]);

  // Persist Demo mode in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atlas.demo', demoMode.toString());
    }
  }, [demoMode]);

  const handleLoadSeed = (seedType) => {
    store.loadSeed(seedType);
  };

  const handleResetDemo = () => {
    store.resetDemo();
  };

  const handleReportIssue = () => {
    setShowIssueReporter(true);
  };

  const handleExitQA = () => {
    setQAMode(false);
    // Also turn off store QA mode if it exists
    if (store.toggleQAMode) {
      store.toggleQAMode();
    }
  };

  const handleTogglePill = () => {
    setQAPanelCollapsed(!qaPanelCollapsed);
  };

  // QA Quick Actions
  const handleCreateUpcomingMovements = () => {
    store.createUpcomingMovements();
  };

  const handleCreateOverdueMovements = () => {
    store.createOverdueMovements();
  };

  const handleGenerateInvoicesWithoutDocs = () => {
    store.generateInvoicesWithoutDocuments();
  };

  const handleSimulateLowBalance = () => {
    store.simulateLowBalance();
  };

  const handleExecuteRulesEngine = () => {
    store.executeRulesEngine();
  };

  // QA Theme toggle
  const handleToggleTheme = () => {
    const currentTheme = document.body.className;
    const newTheme = currentTheme === 'theme-invest' ? 'theme-personal' : 'theme-invest';
    window.setTheme && window.setTheme(newTheme === 'theme-personal' ? 'personal' : 'invest');
    window.showToast && window.showToast(`Tema cambiado a ${newTheme === 'theme-personal' ? 'Pulse (Turquesa)' : 'Horizon (Navy)'}`, 'info');
  };

  // QA Minimal Menu Handlers (Brief v2)
  const handleToggleDemo = () => {
    setDemoMode(!demoMode);
    window.showToast && window.showToast(`Modo Demo ${!demoMode ? 'activado' : 'desactivado'}`, 'info');
  };

  const handleSeedMinimal = () => {
    if (demoMode) {
      store.loadSeed('A'); // Minimal demo seed
      window.showToast && window.showToast('Demo mínima cargada', 'success');
    }
  };

  const handleSeedComplete = () => {
    if (demoMode) {
      store.loadSeed('B'); // Complete demo seed
      window.showToast && window.showToast('Demo completa cargada', 'success');
    }
  };

  const handleVaciarData = () => {
    const confirmation = prompt('Para vaciar todos los datos, escriba: VACIAR');
    if (confirmation === 'VACIAR') {
      store.setState(store.getInitialState());
      window.showToast && window.showToast('Datos vaciados', 'success');
    } else if (confirmation !== null) {
      window.showToast && window.showToast('Confirmación incorrecta. Datos no vaciados.', 'warning');
    }
  };

  const diagnostics = (qaMode || storeState.qaMode) ? store.generateDiagnostics() : null;

  return (
    <>
      {/* QA Badge - visible when QA mode is active */}
      {qaMode && (
        <div className="qa-badge">
          QA
        </div>
      )}

      {/* QA Components - only visible in QA mode */}
      <QABar 
        qaMode={qaMode || storeState.qaMode}
        activeSeed={storeState.activeSeed}
        onCopyDiagnostics={() => store.getDiagnosticsText()}
        onExitQA={handleExitQA}
        diagnostics={diagnostics}
        demoMode={demoMode}
        onToggleDemo={handleToggleDemo}
        onSeedMinimal={handleSeedMinimal}
        onSeedComplete={handleSeedComplete}
        onVaciarData={handleVaciarData}
        onToggleTheme={handleToggleTheme}
      />
      
      <BrandValidator qaMode={qaMode || storeState.qaMode} />
      
      {/* QAPanel removed in Brief v2 - using minimal menu in QABar instead */}

      {/* QAPill removed in Brief v2 - using minimal menu in QABar instead */}

      {/* Main app content - adjust for QA bar */}
      <div style={{ marginTop: (qaMode || storeState.qaMode) ? '32px' : '0' }}>
        <Component {...pageProps} />
      </div>

      {/* Global components */}
      <Modal />
      <Toast />
      <ToastSystem />
      
      <IssueReporter 
        isOpen={showIssueReporter}
        onClose={() => setShowIssueReporter(false)}
        diagnostics={diagnostics}
      />
    </>
  );
}
