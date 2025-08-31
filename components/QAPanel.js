// QA Panel - Collapsible side dock with QA tools
import { useState } from 'react';

export default function QAPanel({ 
  qaMode, 
  qaEvents, 
  activeSeed, 
  lastSeedReset,
  onLoadSeed, 
  onResetDemo, 
  onReportIssue,
  onCreateUpcomingMovements,
  onCreateOverdueMovements,
  onGenerateInvoicesWithoutDocs,
  onSimulateLowBalance,
  onExecuteRulesEngine,
  onToggleTheme
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSeed, setSelectedSeed] = useState(activeSeed || 'A');

  if (!qaMode) return null;

  const modules = ['all', 'Tesorería', 'Inmuebles', 'Documentos', 'Proyección', 'Config', 'QA'];
  
  const filteredEvents = qaEvents?.filter(event => {
    if (activeFilter === 'all') return true;
    return event.module === activeFilter;
  }).slice(-10) || []; // Show last 10 events

  const handleLoadSeed = (seedType) => {
    setSelectedSeed(seedType);
    onLoadSeed(seedType);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      right: isCollapsed ? '-280px' : '0',
      top: qaMode ? '32px' : '0', // Account for QA bar
      width: '320px',
      height: qaMode ? 'calc(100vh - 32px)' : '100vh',
      backgroundColor: 'white',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      transition: 'right 0.3s ease',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          left: '-40px',
          top: '20px',
          width: '40px',
          height: '40px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '4px 0 0 4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}
      >
        {isCollapsed ? '◀' : '▶'}
      </button>

      {/* Scrollable Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Panel Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'var(--navy)', fontSize: '14px', fontWeight: 'bold' }}>
            🔧 Panel QA
          </h3>
          <div style={{ fontSize: '10px', color: 'var(--gray)' }}>
            Atajo: Ctrl/⌘ + Alt + Q
          </div>
        </div>

        {/* Seed Manager */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--gray)', textTransform: 'uppercase' }}>
            Gestor de Seeds
          </h4>
          
          {/* Current Status */}
          <div style={{ 
            backgroundColor: 'var(--bg-light)', 
            padding: '8px', 
            borderRadius: '4px', 
            marginBottom: '12px',
            fontSize: '11px'
          }}>
            <div><strong>Activo:</strong> Seed {activeSeed || 'default'}</div>
            {lastSeedReset && (
              <div><strong>Último reset:</strong> {formatTimestamp(lastSeedReset)}</div>
            )}
          </div>

          {/* Seed Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => handleLoadSeed('A')}
              className={`btn btn-sm ${selectedSeed === 'A' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '11px' }}
            >
              Seed A<br/>
              <small style={{ opacity: 0.7 }}>Básico</small>
            </button>
            <button
              onClick={() => handleLoadSeed('B')}
              className={`btn btn-sm ${selectedSeed === 'B' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '11px' }}
            >
              Seed B<br/>
              <small style={{ opacity: 0.7 }}>Multi-unit</small>
            </button>
            <button
              onClick={() => handleLoadSeed('C')}
              className={`btn btn-sm ${selectedSeed === 'C' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '11px' }}
            >
              Seed C<br/>
              <small style={{ opacity: 0.7 }}>Estrés</small>
            </button>
          </div>
          
          <button 
            onClick={onResetDemo}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', fontSize: '11px' }}
          >
            🔄 Reset Demo
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--gray)', textTransform: 'uppercase' }}>
            Acciones Rápidas
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={onCreateUpcomingMovements}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              📅 Crear 10 movimientos próximos
            </button>
            <button 
              onClick={onCreateOverdueMovements}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              ⏰ Crear 10 movimientos atrasados
            </button>
            <button 
              onClick={onGenerateInvoicesWithoutDocs}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              📄 Generar 3 facturas sin documento
            </button>
            <button 
              onClick={onSimulateLowBalance}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              💰 Simular saldo bajo en cuenta
            </button>
            <button 
              onClick={onExecuteRulesEngine}
              className="btn btn-warning btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              ⚙️ Ejecutar ahora motor de reglas
            </button>
            <button 
              onClick={onReportIssue}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              🐛 Reportar Issue
            </button>
            <button 
              onClick={onToggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', textAlign: 'left' }}
            >
              🎨 Cambiar Tema
            </button>
          </div>
        </div>

        {/* Event Filters */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--gray)', textTransform: 'uppercase' }}>
            Filtros por Módulo
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {modules.map(module => (
              <button
                key={module}
                onClick={() => setActiveFilter(module)}
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: activeFilter === module ? 'var(--primary)' : 'white',
                  color: activeFilter === module ? 'white' : 'var(--gray)',
                  cursor: 'pointer'
                }}
              >
                {module}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--gray)', textTransform: 'uppercase' }}>
            Eventos Recientes
          </h4>
          <div style={{ fontSize: '11px' }}>
            {filteredEvents.length === 0 ? (
              <div style={{ color: 'var(--gray)', fontStyle: 'italic' }}>
                No hay eventos recientes
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '6px 0', 
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500' }}>
                      {event.type?.replace(/_/g, ' ') || 'Evento'}
                    </span>
                    <span style={{ color: 'var(--gray)', fontSize: '10px' }}>
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.seedType && (
                    <div style={{ color: 'var(--gray)', fontSize: '10px' }}>
                      Seed: {event.seedType}
                    </div>
                  )}
                  {event.module && (
                    <div style={{ color: 'var(--primary)', fontSize: '10px' }}>
                      📍 {event.module}
                    </div>
                  )}
                  {event.count && (
                    <div style={{ color: 'var(--success)', fontSize: '10px' }}>
                      ✓ {event.count} elementos
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}