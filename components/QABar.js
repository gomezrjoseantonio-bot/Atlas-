// QA Bar - Minimal QA menu (Brief v2) - without sidebars/overlays
import { useState } from 'react';

export default function QABar({ 
  qaMode, 
  activeSeed, 
  onCopyDiagnostics, 
  onExitQA, 
  diagnostics,
  demoMode,
  onToggleDemo,
  onSeedMinimal,
  onSeedComplete,
  onVaciarData,
  onToggleTheme
}) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            QA {showMenu ? '▼' : '▶'}
          </button>
          
          {/* Minimal QA Menu - no sidebar/overlay */}
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: 'white',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              minWidth: '240px',
              zIndex: 1001,
              marginTop: '4px'
            }}>
              <div style={{ padding: '8px 0' }}>
                {/* Demo Toggle */}
                <button
                  onClick={onToggleDemo}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <span>Modo Demo</span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    backgroundColor: demoMode ? 'var(--success)' : 'var(--border)',
                    color: demoMode ? 'white' : 'var(--text-2)'
                  }}>
                    {demoMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

                {/* Seed Options - only if Demo=ON */}
                {demoMode && (
                  <>
                    <button
                      onClick={onSeedMinimal}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 12px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🌱 Sembrar demo mínima
                    </button>
                    <button
                      onClick={onSeedComplete}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 12px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🌿 Sembrar demo completa
                    </button>
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                  </>
                )}

                {/* Empty Data */}
                <button
                  onClick={onVaciarData}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--danger)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🗑️ Vaciar datos (VACIAR)
                </button>

                {/* Theme Toggle - optional by flag */}
                {onToggleTheme && (
                  <>
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={onToggleTheme}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 12px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🎨 Cambiar tema
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {demoMode && (
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            DEMO
          </span>
        )}
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