// Issue Reporter Modal - Pre-filled issue template
import { useState } from 'react';

export default function IssueReporter({ isOpen, onClose, diagnostics }) {
  const [formData, setFormData] = useState({
    module: 'Tesorería',
    steps: '',
    expected: '',
    obtained: '',
    severity: 'P1'
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const modules = ['Tesorería', 'Inmuebles', 'Documentos', 'Proyección', 'Configuración'];
  const severities = [
    { value: 'P0', label: 'P0 - Crítico (caída, pérdida datos)', color: 'var(--error)' },
    { value: 'P1', label: 'P1 - Alto (funcionalidad incorrecta)', color: 'var(--warning)' },
    { value: 'P2', label: 'P2 - Medio (estética, textos)', color: 'var(--info)' },
    { value: 'FUTURO', label: 'FUTURO - Fuera de H0-H7', color: 'var(--gray)' }
  ];

  const generateIssueText = () => {
    const template = `## 🐛 Issue Report

**Módulo:** ${formData.module}
**Severidad:** ${formData.severity}
**Seed:** ${diagnostics?.seed || 'default'}

### 📍 Contexto
- **Ruta:** ${diagnostics?.route || window.location.pathname}
- **Versión:** ${diagnostics?.version || '0.1.3'}
- **Commit:** ${diagnostics?.commit || 'dev'}
- **Timestamp:** ${diagnostics?.timestamp || new Date().toISOString()}

### 🔄 Pasos para reproducir
${formData.steps || '1. \n2. \n3. '}

### ✅ Resultado esperado
${formData.expected || '(Describe qué debería pasar)'}

### ❌ Resultado obtenido
${formData.obtained || '(Describe qué pasa actualmente)'}

### 🏷️ Labels sugeridas
- bug
- ${formData.severity.toLowerCase()}
- ${formData.module.toLowerCase()}
${formData.severity === 'FUTURO' ? '- enhancement\n- future' : ''}

---
*Generado automáticamente por ATLAS QA Toolkit*`;

    return template;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateIssueText());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy issue text:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = generateIssueText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--navy)' }}>🐛 Reportar Issue</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--gray)'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Module */}
          <div>
            <label className="form-label">Módulo</label>
            <select 
              className="form-control"
              value={formData.module}
              onChange={(e) => setFormData({...formData, module: e.target.value})}
            >
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="form-label">Severidad</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {severities.map(severity => (
                <label 
                  key={severity.value}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: formData.severity === severity.value ? 'var(--bg-light)' : 'white'
                  }}
                >
                  <input 
                    type="radio" 
                    name="severity" 
                    value={severity.value}
                    checked={formData.severity === severity.value}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  />
                  <span style={{ color: severity.color, fontWeight: '500' }}>
                    {severity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Steps to reproduce */}
          <div>
            <label className="form-label">Pasos para reproducir</label>
            <textarea 
              className="form-control"
              rows="3"
              placeholder="1. Ir a la sección X&#10;2. Hacer click en Y&#10;3. Observar que Z..."
              value={formData.steps}
              onChange={(e) => setFormData({...formData, steps: e.target.value})}
            />
          </div>

          {/* Expected result */}
          <div>
            <label className="form-label">Resultado esperado</label>
            <textarea 
              className="form-control"
              rows="2"
              placeholder="Describe qué debería pasar..."
              value={formData.expected}
              onChange={(e) => setFormData({...formData, expected: e.target.value})}
            />
          </div>

          {/* Obtained result */}
          <div>
            <label className="form-label">Resultado obtenido</label>
            <textarea 
              className="form-control"
              rows="2"
              placeholder="Describe qué pasa actualmente..."
              value={formData.obtained}
              onChange={(e) => setFormData({...formData, obtained: e.target.value})}
            />
          </div>

          {/* Context info (readonly) */}
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'var(--bg-light)', 
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--gray)'
          }}>
            <strong>Contexto automático:</strong><br/>
            Ruta: {diagnostics?.route || window.location.pathname}<br/>
            Seed: {diagnostics?.seed || 'default'}<br/>
            Versión: {diagnostics?.version || '0.1.3'}<br/>
            Commit: {diagnostics?.commit || 'dev'}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleCopy}
              className="btn btn-primary"
              disabled={copied}
            >
              {copied ? '✓ Copiado al portapapeles' : '📋 Copiar Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}