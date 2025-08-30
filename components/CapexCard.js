// ATLAS H9B - CAPEX Card for Property Detail Modal
// Shows CAPEX summary, projects, and fiscal information

import { useState } from 'react';

export default function CapexCard({ 
  property, 
  capexProjects = [], 
  capexItems = [], 
  documents = [],
  fiscalConfig = {},
  onViewProject,
  onEditProject 
}) {
  const [viewMode, setViewMode] = useState('projects'); // 'projects', 'documents', 'fiscal'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  // Get CAPEX projects for this property
  const propertyProjects = capexProjects.filter(project => project.propertyId === property.id);
  
  // Get CAPEX documents for this property
  const capexDocuments = documents.filter(doc => 
    doc.capexProjectId && 
    propertyProjects.some(project => project.id === doc.capexProjectId)
  );

  // Calculate totals
  const totals = {
    totalCapex: propertyProjects.reduce((sum, project) => sum + (project.spentAmount || 0), 0),
    currentYearCapex: propertyProjects
      .filter(project => new Date(project.createdDate).getFullYear() === selectedYear)
      .reduce((sum, project) => sum + (project.spentAmount || 0), 0),
    pendingBudget: propertyProjects
      .filter(project => project.status === 'active')
      .reduce((sum, project) => sum + Math.max(0, (project.totalBudget || 0) - (project.spentAmount || 0)), 0),
    activeProjects: propertyProjects.filter(project => project.status === 'active').length,
    completedProjects: propertyProjects.filter(project => project.status === 'completed').length
  };

  // Calculate fiscal summary for selected year
  const getFiscalSummary = () => {
    const yearItems = capexItems.filter(item => {
      const document = documents.find(doc => doc.id === item.documentId);
      if (!document) return false;
      
      const itemYear = new Date(document.uploadDate || document.date).getFullYear();
      return itemYear === selectedYear && 
             propertyProjects.some(project => project.id === item.projectId);
    });

    const summary = {
      rcMaintenance: { used: 0, limit: fiscalConfig.rcAnnualLimit || 1000, available: 0 },
      improvements: { total: 0, capitalized: 0 },
      furniture: { total: 0, annualDepreciation: 0 },
      operational: { total: 0, deducted: 0 }
    };

    yearItems.forEach(item => {
      const document = documents.find(doc => doc.id === item.documentId);
      if (!document) return;

      let amount = 0;
      if (item.lineItemId) {
        const lineItem = document.lineItems?.find(line => line.id === item.lineItemId);
        amount = lineItem?.totalAmount || 0;
      } else {
        amount = document.amount || 0;
      }

      const fiscalTreatment = document.fiscalTreatment || 'rc_maintenance';

      switch (fiscalTreatment) {
        case 'rc_maintenance':
          summary.rcMaintenance.used += amount;
          break;
        case 'improvement_capitalizable':
          summary.improvements.total += amount;
          summary.improvements.capitalized += amount;
          break;
        case 'furniture_depreciable':
          summary.furniture.total += amount;
          summary.furniture.annualDepreciation += amount / (fiscalConfig.furnitureDepreciationYears || 10);
          break;
        case 'operational_expense':
          summary.operational.total += amount;
          summary.operational.deducted += amount;
          break;
      }
    });

    summary.rcMaintenance.available = Math.max(0, summary.rcMaintenance.limit - summary.rcMaintenance.used);

    return summary;
  };

  const fiscalSummary = getFiscalSummary();

  // Get available years
  const availableYears = [...new Set([
    ...propertyProjects.map(project => new Date(project.createdDate).getFullYear()),
    ...capexDocuments.map(doc => new Date(doc.uploadDate || doc.date).getFullYear()),
    new Date().getFullYear()
  ])].sort((a, b) => b - a);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h4 style={{margin: 0}}>🏗️ CAPEX / Reformas</h4>
        <div className="flex gap-2">
          <select
            className="form-control"
            style={{width: 'auto', fontSize: '12px', padding: '4px 8px'}}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray">Total CAPEX</div>
          <div className="font-bold text-lg">{formatCurrency(totals.totalCapex)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray">Este año</div>
          <div className="font-bold text-lg text-navy">{formatCurrency(totals.currentYearCapex)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray">Pendiente</div>
          <div className="font-bold text-lg text-warning">{formatCurrency(totals.pendingBudget)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray">Proyectos</div>
          <div className="font-bold text-lg">{totals.activeProjects}</div>
          <div className="text-xs text-gray">activos</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray">R/C disponible</div>
          <div className={`font-bold text-lg ${fiscalSummary.rcMaintenance.available > 500 ? 'text-success' : 'text-warning'}`}>
            {formatCurrency(fiscalSummary.rcMaintenance.available)}
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-1 mb-4">
        <button
          className={`btn btn-sm ${viewMode === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('projects')}
        >
          Por proyecto
        </button>
        <button
          className={`btn btn-sm ${viewMode === 'documents' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('documents')}
        >
          Por documento
        </button>
        <button
          className={`btn btn-sm ${viewMode === 'fiscal' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('fiscal')}
        >
          Fiscalidad
        </button>
      </div>

      {/* Projects View */}
      {viewMode === 'projects' && (
        <div>
          {propertyProjects.length === 0 ? (
            <div className="text-center p-4 text-gray">
              <div style={{fontSize: '32px', marginBottom: '8px'}}>🏗️</div>
              <div>No hay proyectos CAPEX registrados</div>
              <div className="text-sm">Los proyectos aparecerán al asignar documentos a CAPEX</div>
            </div>
          ) : (
            <div className="space-y-3">
              {propertyProjects.map(project => {
                const progress = project.totalBudget > 0 ? (project.spentAmount / project.totalBudget) * 100 : 0;
                const statusColor = project.status === 'active' ? 'text-success' : 
                                  project.status === 'completed' ? 'text-navy' : 'text-gray';
                
                return (
                  <div key={project.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{project.name}</div>
                        <div className="text-sm text-gray">{project.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`chip chip-sm ${statusColor}`}>
                          {project.status === 'active' ? 'Activo' : 
                           project.status === 'completed' ? 'Completado' : 'Cancelado'}
                        </span>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => onViewProject?.(project.id)}
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                      <div>
                        <div className="text-gray">Gastado</div>
                        <div className="font-semibold">{formatCurrency(project.spentAmount || 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray">Presupuesto</div>
                        <div className="font-semibold">{formatCurrency(project.totalBudget || 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray">Documentos</div>
                        <div className="font-semibold">{project.documentCount || 0}</div>
                      </div>
                    </div>
                    
                    {project.totalBudget > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${progress > 90 ? 'bg-warning' : 'bg-success'}`}
                          style={{width: `${Math.min(progress, 100)}%`}}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Documents View */}
      {viewMode === 'documents' && (
        <div>
          {capexDocuments.length === 0 ? (
            <div className="text-center p-4 text-gray">
              <div style={{fontSize: '32px', marginBottom: '8px'}}>📄</div>
              <div>No hay documentos CAPEX</div>
              <div className="text-sm">Asigna facturas a proyectos CAPEX desde Documentos</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Concepto</th>
                    <th style={{textAlign: 'right'}}>Importe</th>
                    <th>Proyecto</th>
                    <th>Fiscal</th>
                  </tr>
                </thead>
                <tbody>
                  {capexDocuments.map(doc => {
                    const project = propertyProjects.find(p => p.id === doc.capexProjectId);
                    return (
                      <tr key={doc.id}>
                        <td>{new Date(doc.uploadDate || doc.date).toLocaleDateString('es-ES')}</td>
                        <td className="font-semibold">{doc.provider}</td>
                        <td>{doc.concept || doc.description}</td>
                        <td style={{textAlign: 'right'}}>{formatCurrency(doc.amount)}</td>
                        <td>
                          <span className="chip chip-primary chip-sm">
                            {project?.name || 'Proyecto eliminado'}
                          </span>
                        </td>
                        <td>
                          <span className="chip chip-secondary chip-sm">
                            {doc.fiscalTreatment === 'rc_maintenance' ? 'R/C' :
                             doc.fiscalTreatment === 'improvement_capitalizable' ? 'Mejora' :
                             doc.fiscalTreatment === 'furniture_depreciable' ? 'Mobiliario' : 'Operacional'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fiscal View */}
      {viewMode === 'fiscal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* R/C Maintenance */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold">🔧 Reparación/Conservación</h5>
                <span className={`chip chip-sm ${fiscalSummary.rcMaintenance.available > 500 ? 'success' : 'warning'}`}>
                  R/C
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado {selectedYear}:</span>
                  <span className="font-semibold">{formatCurrency(fiscalSummary.rcMaintenance.used)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Límite anual:</span>
                  <span>{formatCurrency(fiscalSummary.rcMaintenance.limit)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Disponible:</span>
                  <span className={fiscalSummary.rcMaintenance.available > 500 ? 'text-success' : 'text-warning'}>
                    {formatCurrency(fiscalSummary.rcMaintenance.available)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${fiscalSummary.rcMaintenance.used / fiscalSummary.rcMaintenance.limit > 0.8 ? 'bg-warning' : 'bg-success'}`}
                    style={{width: `${Math.min((fiscalSummary.rcMaintenance.used / fiscalSummary.rcMaintenance.limit) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold">🏠 Mejoras</h5>
                <span className="chip chip-sm secondary">Capitalizable</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total {selectedYear}:</span>
                  <span className="font-semibold">{formatCurrency(fiscalSummary.improvements.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Capitalizado:</span>
                  <span>{formatCurrency(fiscalSummary.improvements.capitalized)}</span>
                </div>
                <div className="text-xs text-gray">
                  Se capitaliza al valor del inmueble
                </div>
              </div>
            </div>

            {/* Furniture */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold">🪑 Mobiliario</h5>
                <span className="chip chip-sm info">10 años</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total {selectedYear}:</span>
                  <span className="font-semibold">{formatCurrency(fiscalSummary.furniture.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amortización anual:</span>
                  <span>{formatCurrency(fiscalSummary.furniture.annualDepreciation)}</span>
                </div>
                <div className="text-xs text-gray">
                  Amortizable en {fiscalConfig.furnitureDepreciationYears || 10} años
                </div>
              </div>
            </div>

            {/* Operational */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold">⚙️ Operacional</h5>
                <span className="chip chip-sm success">Deducible</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total {selectedYear}:</span>
                  <span className="font-semibold">{formatCurrency(fiscalSummary.operational.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deducido:</span>
                  <span className="text-success">{formatCurrency(fiscalSummary.operational.deducted)}</span>
                </div>
                <div className="text-xs text-gray">
                  Deducible íntegramente
                </div>
              </div>
            </div>
          </div>

          {/* Fiscal Summary */}
          <div className="card">
            <h5 className="text-sm font-semibold mb-3">📊 Resumen fiscal {selectedYear}</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray">Total invertido</div>
                <div className="font-bold text-lg">
                  {formatCurrency(
                    fiscalSummary.rcMaintenance.used + 
                    fiscalSummary.improvements.total + 
                    fiscalSummary.furniture.total + 
                    fiscalSummary.operational.total
                  )}
                </div>
              </div>
              <div>
                <div className="text-gray">Deducible inmediato</div>
                <div className="font-bold text-lg text-success">
                  {formatCurrency(
                    Math.min(fiscalSummary.rcMaintenance.used, fiscalSummary.rcMaintenance.limit) +
                    fiscalSummary.operational.deducted
                  )}
                </div>
              </div>
              <div>
                <div className="text-gray">Capitalizado/Amortizable</div>
                <div className="font-bold text-lg text-navy">
                  {formatCurrency(
                    fiscalSummary.improvements.capitalized + 
                    fiscalSummary.furniture.total
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}