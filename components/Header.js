import { useState, useEffect } from 'react';

export default function Header({ 
  currentTab = '', 
  subTabs = null,
  activeSubTab = '',
  onSubTabChange = null,
  alertCount = 0,
  isInboxPage = false,
  onDemoReset = null
}) {

  return (
    <header className="header">
      <div className="container nav">
        <div className="logo">
          <div className="logo-mark">
            <div className="bar short"></div>
            <div className="bar mid"></div>
            <div className="bar tall"></div>
          </div>
          <div>ATLAS</div>
        </div>
        <nav className="tabs">
          <a className={`tab ${currentTab === 'panel' ? 'active' : ''}`} href="/panel">Panel</a>
          <a className={`tab ${currentTab === 'inmuebles' ? 'active' : ''}`} href="/inmuebles">Inmuebles</a>
          <a className={`tab ${currentTab === 'tesoreria' ? 'active' : ''}`} href="/tesoreria">Tesorería</a>
          <a className={`tab ${currentTab === 'proyeccion' ? 'active' : ''}`} href="/proyeccion">Proyección</a>
          <a className={`tab ${currentTab === 'configuracion' ? 'active' : ''}`} href="/configuracion">Configuración</a>
        </nav>
        <div className="actions">
          <a 
            href="/inbox" 
            className="btn btn-secondary btn-sm" 
            style={{
              fontSize: '12px', 
              marginRight: '8px',
              ...(isInboxPage ? {
                background: 'var(--accent-subtle)', 
                color: 'var(--accent)'
              } : {})
            }}
          >
            📄 Subir documentos
          </a>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (onDemoReset) {
                onDemoReset();
              }
            }}
            style={{marginRight: '12px'}}
          >
            🔄 Demo
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (typeof window !== 'undefined' && window.showToast) {
                window.showToast('Búsqueda próximamente disponible', 'info');
              }
            }}
            style={{marginRight: '12px', background: 'none', border: 'none', fontSize: '18px'}}
          >
            🔍
          </button>
          <a href="/tesoreria" className="notification-badge">
            <span>🔔</span>
            {alertCount > 0 && (
              <span className="badge">
                {alertCount}
              </span>
            )}
          </a>
          <span>⚙️</span>
        </div>
      </div>
      
      {/* Sub-navigation if provided */}
      {subTabs && (
        <div className="container" style={{ paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-1">
            {subTabs.map((tab) => (
              <button 
                key={tab.key}
                onClick={() => onSubTabChange && onSubTabChange(tab.key)}
                className={`btn ${activeSubTab === tab.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}