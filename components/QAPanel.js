// QA Panel - Collapsible side dock with QA tools
import { useState } from 'react';

export default function QAPanel({ qaMode, qaEvents, activeSeed, onLoadSeed, onResetDemo, onReportIssue }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  if (!qaMode) return null;

  const modules = ['all', 'Tesorería', 'Inmuebles', 'Documentos', 'Proyección', 'Config'];
  
  const filteredEvents = qaEvents?.filter(event => {
    if (activeFilter === 'all') return true;
    return event.module === activeFilter;
  }).slice(-10) || []; // Show last 10 events

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
      flexDirection: 'column'
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

      {/* Panel Content */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--navy)', fontSize: '14px', fontWeight: 'bold' }}>
          🔧 Panel QA
        </h3>
      </div>

      {/* Seed Manager */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--gray)', textTransform: 'uppercase' }}>
          Gestor de Seeds
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => onLoadSeed('A')}
            className={`btn btn-sm ${activeSeed === 'A' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px' }}
          >
            Seed A<br/>
            <small style={{ opacity: 0.7 }}>Sencillo</small>
          </button>
          <button
            onClick={() => onLoadSeed('B')}
            className={`btn btn-sm ${activeSeed === 'B' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px' }}
          >
            Seed B<br/>
            <small style={{ opacity: 0.7 }}>Multi-unit</small>
          </button>
          <button
            onClick={() => onLoadSeed('C')}
            className={`btn btn-sm ${activeSeed === 'C' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px' }}
          >
            Seed C<br/>
            <small style={{ opacity: 0.7 }}>Bordes</small>
          </button>
        </div>
        <button 
          onClick={onResetDemo}
          className="btn btn-secondary btn-sm"
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
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', textAlign: 'left' }}
            onClick={() => alert('Función simulada: Marcar TODO como FUTURO')}
          >
            🏷️ Marcar TODO como FUTURO
          </button>
          <button 
            onClick={onReportIssue}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', textAlign: 'left' }}
          >
            🐛 Reportar Issue
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
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {event.seedType && (
                  <div style={{ color: 'var(--gray)', fontSize: '10px' }}>
                    Seed: {event.seedType}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}