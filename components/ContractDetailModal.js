import { useState } from 'react';

export default function ContractDetailModal({ 
  isOpen, 
  onClose, 
  contract = null,
  property = null,
  onEdit,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('datos');

  if (!isOpen || !contract) return null;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '€0,00';
    return `€${parseFloat(amount).toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES');
    } catch {
      return dateStr;
    }
  };

  // Generate rent calendar for next 12 months
  const generateRentCalendar = () => {
    const calendar = [];
    const startDate = new Date(contract.fechas?.fecha_inicio || contract.startDate);
    const rentAmount = parseFloat(contract.renta?.importe_base_mes || contract.monthlyAmount);
    const paymentDay = contract.renta?.dia_vencimiento || 1;
    
    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);
      paymentDate.setDate(paymentDay);
      
      // Handle month overflow
      if (paymentDate.getDate() !== paymentDay) {
        paymentDate.setDate(0); // Last day of previous month
      }
      
      calendar.push({
        month: paymentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        date: paymentDate.toLocaleDateString('es-ES'),
        amount: rentAmount,
        status: i === 0 ? 'Pendiente' : 'Programado'
      });
    }
    return calendar;
  };

  const rentCalendar = generateRentCalendar();

  // Calculate contract KPIs
  const getContractKPIs = () => {
    const monthlyRent = parseFloat(contract.renta?.importe_base_mes || contract.monthlyAmount || 0);
    const deposit = parseFloat(contract.fianza?.importe || contract.deposit || 0);
    const startDate = new Date(contract.fechas?.fecha_inicio || contract.startDate);
    const endDate = contract.fechas?.fecha_fin_prevista || contract.endDate;
    
    let durationMonths = 0;
    if (endDate) {
      const end = new Date(endDate);
      durationMonths = Math.round((end - startDate) / (1000 * 60 * 60 * 24 * 30.44));
    }
    
    return {
      monthlyRent,
      annualRent: monthlyRent * 12,
      deposit,
      durationMonths,
      totalValue: durationMonths > 0 ? monthlyRent * durationMonths : monthlyRent * 12
    };
  };

  const kpis = getContractKPIs();

  const tabs = [
    { key: 'datos', label: 'Datos', icon: '📋' },
    { key: 'calendario', label: 'Calendario', icon: '📅' },
    { key: 'cobros', label: 'Cobros', icon: '💶' },
    { key: 'documentos', label: 'Documentos', icon: '📄' },
    { key: 'alertas', label: 'Alertas', icon: '⚠️' }
  ];

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal contract-detail-modal">
        <div className="modal-header">
          <div>
            <h2>Contrato de Alquiler</h2>
            <p className="text-sm text-gray">
              {property?.address || 'Inmueble'} - {contract.arrendatarios?.[0]?.nombre || contract.tenant}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit && onEdit(contract)}
            >
              ✏️ Editar
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este contrato?')) {
                  onDelete && onDelete(contract.id);
                  onClose();
                }
              }}
            >
              🗑️ Eliminar
            </button>
            <button className="modal-close" onMouseDown={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Contract KPIs */}
        <div className="contract-kpis">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Renta mensual</div>
              <div className="kpi-value">{formatCurrency(kpis.monthlyRent)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Renta anual</div>
              <div className="kpi-value">{formatCurrency(kpis.annualRent)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Fianza</div>
              <div className="kpi-value">{formatCurrency(kpis.deposit)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Estado</div>
              <div className="kpi-value">
                <span className={`chip ${contract.status === 'Activo' ? 'success' : 'warning'}`}>
                  {contract.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map(tab => {
            return (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          {/* Datos Tab */}
          {activeTab === 'datos' && (
            <div className="tab-content">
              <div className="data-sections">
                <div className="data-section">
                  <h4>Información básica</h4>
                  <div className="data-grid">
                    <div className="data-item">
                      <label>Tipo de contrato</label>
                      <div>{contract.tipo || 'Vivienda completa'}</div>
                    </div>
                    <div className="data-item">
                      <label>Inmueble</label>
                      <div>{property?.address || 'Sin asignar'}</div>
                    </div>
                    {contract.unidadId && (
                      <div className="data-item">
                        <label>Unidad</label>
                        <div>{contract.unidadId}</div>
                      </div>
                    )}
                    <div className="data-item">
                      <label>Fecha inicio</label>
                      <div>{formatDate(contract.fechas?.fecha_inicio || contract.startDate)}</div>
                    </div>
                    <div className="data-item">
                      <label>Fecha fin</label>
                      <div>{formatDate(contract.fechas?.fecha_fin_prevista || contract.endDate)}</div>
                    </div>
                    <div className="data-item">
                      <label>Prórroga automática</label>
                      <div>
                        <span className={`chip ${contract.fechas?.prorroga_auto ? 'success' : 'secondary'}`}>
                          {contract.fechas?.prorroga_auto ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="data-section">
                  <h4>Arrendador</h4>
                  <div className="data-grid">
                    <div className="data-item">
                      <label>Nombre</label>
                      <div>{contract.arrendador?.nombre || 'José Antonio Gómez'}</div>
                    </div>
                    <div className="data-item">
                      <label>DNI</label>
                      <div>{contract.arrendador?.dni || '—'}</div>
                    </div>
                    <div className="data-item">
                      <label>Teléfono</label>
                      <div>{contract.arrendador?.telefono || '—'}</div>
                    </div>
                    <div className="data-item">
                      <label>Email</label>
                      <div>{contract.arrendador?.email || '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="data-section">
                  <h4>Arrendatarios</h4>
                  {contract.arrendatarios?.map((arrendatario, index) => (
                    <div key={index} className="arrendatario-card">
                      <h5>Arrendatario {index + 1}</h5>
                      <div className="data-grid">
                        <div className="data-item">
                          <label>Nombre</label>
                          <div>{arrendatario.nombre}</div>
                        </div>
                        <div className="data-item">
                          <label>DNI</label>
                          <div>{arrendatario.dni || '—'}</div>
                        </div>
                        <div className="data-item">
                          <label>Teléfono</label>
                          <div>{arrendatario.telefono || '—'}</div>
                        </div>
                        <div className="data-item">
                          <label>Email</label>
                          <div>{arrendatario.email || '—'}</div>
                        </div>
                        <div className="data-item">
                          <label>Responsabilidad</label>
                          <div>
                            <span className="chip secondary">
                              {arrendatario.tipo_responsabilidad}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="data-grid">
                      <div className="data-item">
                        <label>Inquilino</label>
                        <div>{contract.tenant || '—'}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="data-section">
                  <h4>Condiciones económicas</h4>
                  <div className="data-grid">
                    <div className="data-item">
                      <label>Renta mensual</label>
                      <div className="font-semibold">{formatCurrency(contract.renta?.importe_base_mes || contract.monthlyAmount)}</div>
                    </div>
                    <div className="data-item">
                      <label>Día de vencimiento</label>
                      <div>Día {contract.renta?.dia_vencimiento || 1}</div>
                    </div>
                    <div className="data-item">
                      <label>Prorrateo entrada</label>
                      <div>
                        <span className={`chip ${contract.renta?.prorrateo_entrada ? 'success' : 'secondary'}`}>
                          {contract.renta?.prorrateo_entrada ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="data-item">
                      <label>Prorrateo salida</label>
                      <div>
                        <span className={`chip ${contract.renta?.prorrateo_salida ? 'success' : 'secondary'}`}>
                          {contract.renta?.prorrateo_salida ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="data-item">
                      <label>Actualización</label>
                      <div>
                        {contract.actualizacion?.metodo === 'Indice' && (
                          <span>Índice {contract.actualizacion.indice_label}</span>
                        )}
                        {contract.actualizacion?.metodo === 'Fijo_pct' && (
                          <span>{contract.actualizacion.porcentaje_anual}% anual</span>
                        )}
                        {(!contract.actualizacion?.metodo || contract.actualizacion?.metodo === 'Ninguno') && (
                          <span>Sin actualización</span>
                        )}
                      </div>
                    </div>
                    <div className="data-item">
                      <label>Fianza</label>
                      <div className="font-semibold">{formatCurrency(contract.fianza?.importe || contract.deposit)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendario Tab */}
          {activeTab === 'calendario' && (
            <div className="tab-content">
              <div className="calendar-header">
                <h4>Calendario de rentas</h4>
                <p className="text-sm text-gray mb-4">
                  Próximos 12 pagos programados
                </p>
              </div>

              <div className="rent-calendar">
                {rentCalendar.map((payment, index) => (
                  <div key={index} className="payment-row">
                    <div className="payment-date">
                      <div className="payment-month">{payment.month}</div>
                      <div className="payment-day">{payment.date}</div>
                    </div>
                    <div className="payment-amount">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="payment-status">
                      <span className={`chip ${payment.status === 'Pendiente' ? 'warning' : 'secondary'}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="payment-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.showToast) {
                            window.showToast('Función de recibo próximamente disponible', 'info');
                          }
                        }}
                      >
                        💾 Recibo
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="calendar-summary">
                <div className="summary-card">
                  <h5>Resumen anual</h5>
                  <div className="summary-item">
                    <span>Total previsto:</span>
                    <span className="font-semibold">{formatCurrency(kpis.annualRent)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Cobrado:</span>
                    <span className="font-semibold">€0,00</span>
                  </div>
                  <div className="summary-item">
                    <span>Pendiente:</span>
                    <span className="font-semibold">{formatCurrency(kpis.annualRent)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cobros Tab */}
          {activeTab === 'cobros' && (
            <div className="tab-content">
              <div className="cobros-header">
                <h4>Historial de cobros</h4>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm">
                    Registrar cobro manual
                  </button>
                  <button className="btn btn-primary btn-sm">
                    Conectar cuenta bancaria
                  </button>
                </div>
              </div>

              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h4>Verificación automática no configurada</h4>
                <p>Conecta una cuenta bancaria para verificar automáticamente los cobros de alquiler</p>
                <button className="btn btn-primary">
                  Configurar verificación
                </button>
              </div>
            </div>
          )}

          {/* Documentos Tab */}
          {activeTab === 'documentos' && (
            <div className="tab-content">
              <div className="documentos-header">
                <h4>Documentos del contrato</h4>
                <button className="btn btn-primary btn-sm">
                  📄 Subir documento
                </button>
              </div>

              <div className="document-categories">
                <div className="document-category">
                  <h5>Contrato principal</h5>
                  <div className="document-list">
                    <div className="document-item">
                      <div className="document-icon">📄</div>
                      <div className="document-info">
                        <div className="document-name">Contrato de arrendamiento</div>
                        <div className="document-meta">PDF • 245 KB • Generado automáticamente</div>
                      </div>
                      <div className="document-actions">
                        <button className="btn btn-secondary btn-sm">
                          💾
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="document-category">
                  <h5>Anexos y modificaciones</h5>
                  <div className="empty-state-small">
                    <div className="text-sm text-gray">No hay anexos registrados</div>
                    <button className="btn btn-secondary btn-sm">
                      + Añadir anexo
                    </button>
                  </div>
                </div>

                <div className="document-category">
                  <h5>Documentación inquilino</h5>
                  <div className="empty-state-small">
                    <div className="text-sm text-gray">No hay documentos del inquilino</div>
                    <button className="btn btn-secondary btn-sm">
                      + Subir documentos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alertas Tab */}
          {activeTab === 'alertas' && (
            <div className="tab-content">
              <div className="alertas-header">
                <h4>Alertas y notificaciones</h4>
                <button className="btn btn-secondary btn-sm">
                  Configurar alertas
                </button>
              </div>

              <div className="alert-categories">
                <div className="alert-category">
                  <h5>🔔 Vencimientos</h5>
                  <div className="alert-item">
                    <div className="alert-content">
                      <div className="alert-title">Vencimiento de contrato</div>
                      <div className="alert-desc">
                        {contract.fechas?.fecha_fin_prevista || contract.endDate ? 
                          `El contrato vence el ${formatDate(contract.fechas?.fecha_fin_prevista || contract.endDate)}` :
                          'Contrato indefinido'
                        }
                      </div>
                    </div>
                    <div className="alert-badge">
                      <span className="chip secondary">Informativo</span>
                    </div>
                  </div>
                </div>

                <div className="alert-category">
                  <h5>💰 Cobros</h5>
                  <div className="alert-item">
                    <div className="alert-content">
                      <div className="alert-title">Próximo pago</div>
                      <div className="alert-desc">
                        Vence el día {contract.renta?.dia_vencimiento || 1} de cada mes
                      </div>
                    </div>
                    <div className="alert-badge">
                      <span className="chip warning">Pendiente</span>
                    </div>
                  </div>
                </div>

                <div className="alert-category">
                  <h5>📈 Actualizaciones</h5>
                  <div className="alert-item">
                    <div className="alert-content">
                      <div className="alert-title">Actualización de renta</div>
                      <div className="alert-desc">
                        {contract.actualizacion?.metodo === 'Indice' && 
                          `Próxima revisión por ${contract.actualizacion.indice_label}: ${contract.actualizacion.proxima_revision || 'Por determinar'}`
                        }
                        {contract.actualizacion?.metodo === 'Fijo_pct' && 
                          `Subida automática del ${contract.actualizacion.porcentaje_anual}%`
                        }
                        {(!contract.actualizacion?.metodo || contract.actualizacion?.metodo === 'Ninguno') && 
                          'Sin actualizaciones programadas'
                        }
                      </div>
                    </div>
                    <div className="alert-badge">
                      <span className="chip secondary">Programado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}