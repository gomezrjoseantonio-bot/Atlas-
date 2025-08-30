import '../styles/layout.css'
import { useEffect } from 'react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import actionBridge from '../actions/bridge';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
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
      actionBridge.destroy();
      if (typeof window !== 'undefined') {
        delete window.showToast;
      }
    };
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Modal />
      <Toast />
    </>
  );
}
