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
          {/* Keep only functional actions: Alertas (if exist) and Configuración */}
          {alertCount > 0 && (
            <a 
              href="/tesoreria" 
              className="notification-badge"
              aria-label={`Alertas (${alertCount} activas)`}
              style={{marginRight: '12px'}}
            >
              <BellIcon size={16} />
              <span className="badge">
                {alertCount}
              </span>
            </a>
          )}
          <button 
            aria-label="Configuración"
            style={{background: 'none', border: 'none', padding: '4px'}}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/configuracion';
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