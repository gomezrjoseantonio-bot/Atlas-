import '../styles/layout.css'
import { useEffect } from 'react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import actionBridge from '../actions/bridge';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize ActionBridge when app mounts
    actionBridge.init();
    
    return () => {
      // Cleanup on unmount
      actionBridge.destroy();
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
