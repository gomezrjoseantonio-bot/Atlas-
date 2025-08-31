import { useState, useEffect } from 'react';
import { CheckIcon, AlertTriangleIcon, XIcon, InfoIcon } from './icons';

let toastId = 0;
let addToastCallback = null;

export const showToast = (message, type = 'info', duration = 4000) => {
  if (addToastCallback) {
    addToastCallback({
      id: ++toastId,
      message,
      type,
      duration
    });
  }
};

// Make showToast globally available for backwards compatibility
if (typeof window !== 'undefined') {
  window.showToast = showToast;
}

export default function ToastSystem() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastCallback = (newToast) => {
      setToasts(prev => [...prev, newToast]);
      
      if (newToast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, newToast.duration);
      }
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckIcon size={16} />;
      case 'warning': return <AlertTriangleIcon size={16} />;
      case 'error': return <XIcon size={16} />;
      default: return <InfoIcon size={16} />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'error': return 'var(--danger)';
      default: return 'var(--accent)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '400px'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: 'var(--surface)',
            border: `1px solid var(--border)`,
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'toastSlideIn 0.3s ease-out'
          }}
        >
          <div style={{ color: getIconColor(toast.type), flexShrink: 0 }}>
            {getIcon(toast.type)}
          </div>
          <div style={{ 
            flex: 1, 
            fontSize: '14px', 
            color: 'var(--text)', 
            lineHeight: '1.4' 
          }}>
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--icon-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--border)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <XIcon size={12} />
          </button>

          <style jsx>{`
            @keyframes toastSlideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}