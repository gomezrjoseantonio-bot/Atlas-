// ATLAS H9B - CAPEX Assignment Modal
// Assign documents/line items to CAPEX projects

import { useState, useEffect } from 'react';

export default function CapexAssignmentModal({ 
  document, 
  property,
  capexProjects = [],
  isOpen, 
  onClose, 
  onAssign,
  onCreateProject
}) {
  const [selectedProject, setSelectedProject] = useState('');
  const [createNewProject, setCreateNewProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    totalBudget: '',
    category: 'improvement', // improvement, maintenance, furniture
    fiscalTreatment: 'improvement_capitalizable'
  });
  const [selectedLineItems, setSelectedLineItems] = useState([]);

  // Initialize line item selection
  useEffect(() => {
    if (isOpen && document?.lineItems) {
      setSelectedLineItems(document.lineItems.map(item => item.id));
    }
  }, [isOpen, document]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const getProjectAmount = () => {
    if (!document) return 0;
    
    if (document.lineItems && selectedLineItems.length > 0) {
      return document.lineItems
        .filter(item => selectedLineItems.includes(item.id))
        .reduce((sum, item) => sum + ((item.baseAmount || 0) + (item.vatAmount || 0)), 0);
    }
    
    return document.amount || 0;
  };

  const handleCreateProject = () => {
    if (!newProjectData.name.trim()) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    const budget = parseFloat(newProjectData.totalBudget) || 0;
    if (budget < 0) {
      alert('El presupuesto no puede ser negativo');
      return;
    }

    const project = {
      name: newProjectData.name.trim(),
      description: newProjectData.description.trim(),
      totalBudget: budget,
      category: newProjectData.category,
      fiscalTreatment: newProjectData.fiscalTreatment,
      propertyId: property?.id,
      propertyName: property?.address || property?.name
    };

    const createdProject = onCreateProject(project);
    if (createdProject) {
      setSelectedProject(createdProject.id);
      setCreateNewProject(false);
      setNewProjectData({
        name: '',
        description: '',
        totalBudget: '',
        category: 'improvement',
        fiscalTreatment: 'improvement_capitalizable'
      });
    }
  };

  const handleAssign = () => {
    if (!selectedProject) {
      alert('Selecciona un proyecto CAPEX');
      return;
    }

    const assignment = {
      projectId: selectedProject,
      documentId: document.id,
      lineItemIds: document.lineItems ? selectedLineItems : null,
      amount: getProjectAmount()
    };

    onAssign(assignment);
  };

  const toggleLineItem = (itemId) => {
    if (selectedLineItems.includes(itemId)) {
      setSelectedLineItems(selectedLineItems.filter(id => id !== itemId));
    } else {
      setSelectedLineItems([...selectedLineItems, itemId]);
    }
  };

  const propertyProjects = capexProjects.filter(project => 
    project.propertyId === property?.id && project.status === 'active'
  );

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{margin: 0}}>
              🏗️ Asignar a CAPEX — {document?.provider}
            </h3>
            <div className="text-sm text-gray mt-1">
              {property?.address || property?.name}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            ✕
          </button>
        </div>

        {/* Document Summary */}
        <div className="card mb-4">
          <h4 style={{margin: '0 0 12px 0'}}>📋 Documento a asignar</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray">Proveedor</div>
              <div className="font-semibold">{document?.provider}</div>
            </div>
            <div>
              <div className="text-sm text-gray">Fecha</div>
              <div>{document?.uploadDate ? new Date(document.uploadDate).toLocaleDateString('es-ES') : '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray">Concepto</div>
              <div>{document?.concept || document?.description || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray">Importe total</div>
              <div className="font-semibold">{formatCurrency(document?.amount)}</div>
            </div>
          </div>

          {/* Line Items Selection */}
          {document?.lineItems && document.lineItems.length > 0 && (
            <div>
              <h5 style={{margin: '12px 0 8px 0'}}>Seleccionar líneas para CAPEX:</h5>
              <div className="space-y-2">
                {document.lineItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                    <input
                      type="checkbox"
                      checked={selectedLineItems.includes(item.id)}
                      onChange={() => toggleLineItem(item.id)}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{item.description}</div>
                      <div className="text-sm text-gray">
                        Base: {formatCurrency(item.baseAmount)} + IVA: {formatCurrency(item.vatAmount)}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency((item.baseAmount || 0) + (item.vatAmount || 0))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <div className="font-semibold">
                  Total seleccionado: {formatCurrency(getProjectAmount())}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Selection */}
        <div className="mb-4">
          <h4 style={{margin: '0 0 12px 0'}}>🎯 Proyecto CAPEX</h4>
          
          <div className="flex gap-2 mb-4">
            <button
              className={`btn ${!createNewProject ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCreateNewProject(false)}
            >
              Proyecto existente
            </button>
            <button
              className={`btn ${createNewProject ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCreateNewProject(true)}
            >
              Nuevo proyecto
            </button>
          </div>

          {!createNewProject ? (
            <div>
              {propertyProjects.length === 0 ? (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-gray mb-2">No hay proyectos activos para esta propiedad</div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setCreateNewProject(true)}
                  >
                    Crear primer proyecto
                  </button>
                </div>
              ) : (
                <div>
                  <select
                    className="form-control mb-3"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">Seleccionar proyecto...</option>
                    {propertyProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} — {formatCurrency(project.spentAmount || 0)}/{formatCurrency(project.totalBudget || 0)}
                      </option>
                    ))}
                  </select>

                  {selectedProject && (
                    <div className="card">
                      {(() => {
                        const project = propertyProjects.find(p => p.id == selectedProject);
                        if (!project) return null;
                        
                        const remaining = (project.totalBudget || 0) - (project.spentAmount || 0);
                        const assignmentAmount = getProjectAmount();
                        const exceedsBudget = assignmentAmount > remaining;
                        
                        return (
                          <div>
                            <div className="font-semibold mb-2">{project.name}</div>
                            <div className="text-sm text-gray mb-2">{project.description}</div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray">Gastado</div>
                                <div className="font-semibold">{formatCurrency(project.spentAmount || 0)}</div>
                              </div>
                              <div>
                                <div className="text-gray">Presupuesto</div>
                                <div className="font-semibold">{formatCurrency(project.totalBudget || 0)}</div>
                              </div>
                              <div>
                                <div className="text-gray">Disponible</div>
                                <div className={`font-semibold ${exceedsbudget ? 'text-error' : 'text-success'}`}>
                                  {formatCurrency(remaining)}
                                </div>
                              </div>
                            </div>
                            {exceedsbudget && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-error">
                                ⚠️ La asignación ({formatCurrency(assignmentAmount)}) supera el presupuesto disponible
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nombre del proyecto *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})}
                  placeholder="ej: Reforma cocina 2024"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="form-control"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})}
                  placeholder="Descripción detallada del proyecto..."
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Presupuesto total</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={newProjectData.totalBudget}
                    onChange={(e) => setNewProjectData({...newProjectData, totalBudget: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    className="form-control"
                    value={newProjectData.category}
                    onChange={(e) => setNewProjectData({...newProjectData, category: e.target.value})}
                  >
                    <option value="improvement">Mejora/CAPEX</option>
                    <option value="maintenance">Reparación/Conservación</option>
                    <option value="furniture">Mobiliario</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tratamiento fiscal por defecto</label>
                <select
                  className="form-control"
                  value={newProjectData.fiscalTreatment}
                  onChange={(e) => setNewProjectData({...newProjectData, fiscalTreatment: e.target.value})}
                >
                  <option value="improvement_capitalizable">Mejora capitalizable</option>
                  <option value="rc_maintenance">Reparación/Conservación (R/C)</option>
                  <option value="furniture_depreciable">Mobiliario amortizable</option>
                  <option value="operational_expense">Gasto operacional</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          {createNewProject ? (
            <button 
              onClick={handleCreateProject}
              className="btn btn-primary"
              disabled={!newProjectData.name.trim()}
            >
              ✅ Crear proyecto
            </button>
          ) : (
            <button 
              onClick={handleAssign}
              className="btn btn-primary"
              disabled={!selectedProject || getProjectAmount() <= 0}
            >
              🏗️ Asignar a CAPEX ({formatCurrency(getProjectAmount())})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}