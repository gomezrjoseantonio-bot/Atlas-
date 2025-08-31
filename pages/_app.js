import '../styles/layout.css'
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
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
      };
    }
    
    return () => {
      // Cleanup on unmount
      unsubscribe();
      actionBridge.destroy();
    };
  }, [qaPanelCollapsed]);

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
    store.toggleQAMode(); // This will turn off QA mode
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

  const diagnostics = storeState.qaMode ? store.generateDiagnostics() : null;

  return (
    <>
      {/* QA Components - only visible in QA mode */}
      <QABar 
        qaMode={storeState.qaMode}
        activeSeed={storeState.activeSeed}
        onCopyDiagnostics={() => store.getDiagnosticsText()}
        onExitQA={handleExitQA}
        diagnostics={diagnostics}
      />
      
      <BrandValidator qaMode={storeState.qaMode} />
      
      <QAPanel 
        qaMode={storeState.qaMode}
        qaEvents={storeState.qaEvents}
        activeSeed={storeState.activeSeed}
        lastSeedReset={storeState.lastSeedReset}
        onLoadSeed={handleLoadSeed}
        onResetDemo={handleResetDemo}
        onReportIssue={handleReportIssue}
        onCreateUpcomingMovements={handleCreateUpcomingMovements}
        onCreateOverdueMovements={handleCreateOverdueMovements}
        onGenerateInvoicesWithoutDocs={handleGenerateInvoicesWithoutDocs}
        onSimulateLowBalance={handleSimulateLowBalance}
        onExecuteRulesEngine={handleExecuteRulesEngine}
      />

      <QAPill 
        qaMode={storeState.qaMode}
        onTogglePanel={handleTogglePill}
      />

      {/* Main app content - adjust for QA bar */}
      <div style={{ marginTop: storeState.qaMode ? '32px' : '0' }}>
        <Component {...pageProps} />
      </div>

      {/* Global components */}
      <Modal />
      <Toast />
      
      <IssueReporter 
        isOpen={showIssueReporter}
        onClose={() => setShowIssueReporter(false)}
        diagnostics={diagnostics}
      />
    </>
  );
}
