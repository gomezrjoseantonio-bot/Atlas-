// ATLAS Toast Component - Notification system
// HITO 4 - Connect buttons functionality

import { useState, useEffect } from 'react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const { type, message } = event.detail;
      const id = Date.now() + Math.random();
      
      const toast = {
        id,
        type,
        message,
        timestamp: Date.now()
      };

      setToasts(current => [...current, toast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, 5000);
    };

    document.addEventListener('atlas:toast', handleToastEvent);
    return () => document.removeEventListener('atlas:toast', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts(current => current.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">
            <span className="toast-icon">{getToastIcon(toast.type)}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={(e) => {
            e.stopPropagation();
            removeToast(toast.id);
          }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || 'ℹ';
}