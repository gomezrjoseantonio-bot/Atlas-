import '../styles/layout.css'
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import QABar from '../components/QABar';
import QAPanel from '../components/QAPanel';
import BrandValidator from '../components/BrandValidator';
import IssueReporter from '../components/IssueReporter';
import actionBridge from '../actions/bridge';
import store from '../store/index';

export default function MyApp({ Component, pageProps }) {
  const [storeState, setStoreState] = useState(() => store.getState());
  const [showIssueReporter, setShowIssueReporter] = useState(false);

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
    }
    
    return () => {
      // Cleanup on unmount
      unsubscribe();
      actionBridge.destroy();
      if (typeof window !== 'undefined') {
        delete window.showToast;
      }
    };
  }, []);

  const handleLoadSeed = (seedType) => {
    store.loadSeed(seedType);
    store.addQAEvent({ type: 'seed_changed', seedType, module: 'QA' });
  };

  const handleResetDemo = () => {
    store.resetDemo();
    store.addQAEvent({ type: 'demo_reset', module: 'QA' });
  };

  const handleReportIssue = () => {
    setShowIssueReporter(true);
  };

  const diagnostics = storeState.qaMode ? store.generateDiagnostics() : null;

  return (
    <>
      {/* QA Components - only visible in QA mode */}
      <QABar 
        qaMode={storeState.qaMode}
        activeSeed={storeState.activeSeed}
        onCopyDiagnostics={() => store.getDiagnosticsText()}
        diagnostics={diagnostics}
      />
      
      <BrandValidator qaMode={storeState.qaMode} />
      
      <QAPanel 
        qaMode={storeState.qaMode}
        qaEvents={storeState.qaEvents}
        activeSeed={storeState.activeSeed}
        onLoadSeed={handleLoadSeed}
        onResetDemo={handleResetDemo}
        onReportIssue={handleReportIssue}
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
