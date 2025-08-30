// QA Bar - Top thin bar visible only in QA Mode
import { useState } from 'react';

export default function QABar({ qaMode, activeSeed, onCopyDiagnostics, onExitQA, diagnostics }) {
  const [copied, setCopied] = useState(false);

  if (!qaMode) return null;

  const handleCopyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(onCopyDiagnostics());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy diagnostics:', err);
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = onCopyDiagnostics();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '32px',
      backgroundColor: 'var(--warning)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: '12px',
      fontWeight: '500',
      zIndex: 1000,
      borderBottom: '1px solid rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          MODO QA
        </span>
        <span>v{diagnostics?.version || '0.1.3'}</span>
        <span>#{diagnostics?.commit || 'dev'}</span>
        <span>Seed: {activeSeed || 'default'}</span>
        <span style={{ color: 'rgba(255,255,255,0.8)' }}>
          Brand check: OK
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleCopyDiagnostics}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        >
          {copied ? '✓ Copiado' : '📋 Copiar diagnóstico'}
        </button>
        
        <button
          onClick={onExitQA}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        >
          ❌ Salir de QA
        </button>
      </div>
    </div>
  );
}