import { useState, useEffect } from 'react';
import { SearchIcon, FileTextIcon, RefreshCwIcon, BellIcon, SettingsIcon } from './icons';

export default function Header({ 
  currentTab = '', 
  subTabs = null,
  activeSubTab = '',
  onSubTabChange = null,
  alertCount = 0,
  isInboxPage = false,
  onDemoReset = null,
  showInmueblesSubTabs = false,
  currentInmueblesTab = ''
}) {

  // Define inmuebles subtabs consistently for all inmuebles pages
  const inmueblesSubTabs = [
    { key: 'cartera', label: 'Cartera', href: '/inmuebles' },
    { key: 'contratos', label: 'Contratos', href: '/inmuebles/contratos' },
    { key: 'prestamos', label: 'Préstamos', href: '/inmuebles/prestamos' },
    { key: 'gastos', label: 'Gastos', href: '/inmuebles/gastos' },
    { key: 'analisis', label: 'Análisis', href: '/inmuebles/analisis' }
  ];

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
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              ...(isInboxPage ? {
                background: 'var(--accent-subtle)', 
                color: 'var(--accent)'
              } : {})
            }}
          >
            <FileTextIcon size={12} /> Subir documentos
          </a>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (onDemoReset) {
                onDemoReset();
              }
            }}
            aria-label="Resetear datos demo"
            style={{marginRight: '12px', display: 'flex', alignItems: 'center', gap: '4px'}}
          >
            <RefreshCwIcon size={12} /> Demo
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (typeof window !== 'undefined' && window.showToast) {
                window.showToast('Búsqueda próximamente disponible', 'info');
              }
            }}
            aria-label="Buscar"
            style={{marginRight: '12px', background: 'none', border: 'none', padding: '4px'}}
          >
            <SearchIcon size={16} />
          </button>
          <a 
            href="/tesoreria" 
            className="notification-badge"
            aria-label={`Alertas${alertCount > 0 ? ` (${alertCount} activas)` : ''}`}
          >
            <BellIcon size={16} />
            {alertCount > 0 && (
              <span className="badge">
                {alertCount}
              </span>
            )}
          </a>
          <button 
            aria-label="Configuración"
            style={{background: 'none', border: 'none', padding: '4px'}}
            onClick={() => {
              if (typeof window !== 'undefined' && window.showToast) {
                window.showToast('Configuración próximamente disponible', 'info');
              }
            }}
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>
      
      {/* Inmuebles sub-navigation */}
      {showInmueblesSubTabs && (
        <div className="container" style={{ paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-1">
            {inmueblesSubTabs.map((tab) => (
              <a 
                key={tab.key}
                href={tab.href}
                className={`tab ${currentInmueblesTab === tab.key ? 'active' : ''}`}
                style={{
                  textDecoration: 'none',
                  color: currentInmueblesTab === tab.key ? 'var(--accent)' : 'var(--text-2)',
                  borderBottom: currentInmueblesTab === tab.key ? '2px solid var(--accent)' : 'none',
                  padding: '8px 16px'
                }}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* General sub-navigation if provided */}
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