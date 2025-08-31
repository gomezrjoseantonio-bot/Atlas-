// ATLAS H9B - Invoice Breakdown Modal
// Two-step process: Lines breakdown + Fiscal assignment

import { useState, useEffect } from 'react';

export default function InvoiceBreakdownModal({ 
  document, 
  isOpen, 
  onClose, 
  onSave,
  fiscalTreatments = []
}) {
  const [step, setStep] = useState(1); // 1: Lines, 2: Fiscal
  const [lineItems, setLineItems] = useState([]);
  const [totals, setTotals] = useState({ base: 0, vat: 0, total: 0 });

  // Initialize with OCR data or create first line
  useEffect(() => {
    if (isOpen && document) {
      if (document.hasOCR) {
        // Pre-fill with simulated OCR data
        setLineItems([
          {
            id: 1,
            description: document.concept || 'Concepto principal',
            baseAmount: document.amount ? Math.round(document.amount * 0.826) : 0, // Assuming 21% VAT
            vatAmount: document.amount ? Math.round(document.amount * 0.174) : 0,
            fiscalTreatment: 'rc_maintenance'
          }
        ]);
      } else {
        // Create empty line
        setLineItems([
          {
            id: 1,
            description: '',
            baseAmount: document.amount || 0,
            vatAmount: 0,
            fiscalTreatment: 'rc_maintenance'
          }
        ]);
      }
    }
  }, [isOpen, document]);

  // Recalculate totals when line items change
  useEffect(() => {
    const newTotals = lineItems.reduce((acc, item) => ({
      base: acc.base + (item.baseAmount || 0),
      vat: acc.vat + (item.vatAmount || 0),
      total: acc.total + (item.baseAmount || 0) + (item.vatAmount || 0)
    }), { base: 0, vat: 0, total: 0 });
    
    setTotals(newTotals);
  }, [lineItems]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }
    return `€${amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
  };

  const addLine = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, {
      id: newId,
      description: '',
      baseAmount: 0,
      vatAmount: 0,
      fiscalTreatment: 'rc_maintenance'
    }]);
  };

  const duplicateLine = (index) => {
    const originalLine = lineItems[index];
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    const newLine = {
      ...originalLine,
      id: newId,
      description: `${originalLine.description} (copia)`
    };
    
    const newItems = [...lineItems];
    newItems.splice(index + 1, 0, newLine);
    setLineItems(newItems);
  };

  const divideLine = (index, method) => {
    const originalLine = lineItems[index];
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    
    let division;
    if (method === 'half') {
      division = 0.5;
    } else if (method === 'percent') {
      const percent = prompt('¿Qué porcentaje para la nueva línea? (ej: 30 para 30%)');
      if (!percent || isNaN(percent)) return;
      division = Math.min(Math.max(parseFloat(percent) / 100, 0.01), 0.99);
    } else if (method === 'amount') {
      const amount = prompt(`¿Qué importe para la nueva línea? Total disponible: ${formatCurrency(originalLine.baseAmount)}`);
      if (!amount || isNaN(amount)) return;
      division = Math.min(Math.max(parseFloat(amount) / originalLine.baseAmount, 0.01), 0.99);
    }
    
    const newLine = {
      ...originalLine,
      id: newId,
      description: `${originalLine.description} (dividido)`,
      baseAmount: Math.round(originalLine.baseAmount * division),
      vatAmount: Math.round(originalLine.vatAmount * division)
    };
    
    // Update original line
    const updatedOriginal = {
      ...originalLine,
      baseAmount: originalLine.baseAmount - newLine.baseAmount,
      vatAmount: originalLine.vatAmount - newLine.vatAmount
    };
    
    const newItems = [...lineItems];
    newItems[index] = updatedOriginal;
    newItems.splice(index + 1, 0, newLine);
    setLineItems(newItems);
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const deleteLine = (index) => {
    if (lineItems.length > 1) {
      const newItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newItems);
    }
  };

  const addAdjustmentLine = () => {
    const difference = (document.amount || 0) - totals.total;
    if (Math.abs(difference) <= 0.02) return; // No adjustment needed
    
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, {
      id: newId,
      description: 'Ajuste de redondeo',
      baseAmount: difference,
      vatAmount: 0,
      fiscalTreatment: 'operational_expense',
      isAdjustment: true
    }]);
  };

  const canProceedToStep2 = () => {
    const totalDifference = Math.abs((document.amount || 0) - totals.total);
    return totalDifference <= 0.02 && lineItems.every(item => 
      item.description.trim() && 
      !isNaN(item.baseAmount) && 
      item.baseAmount > 0
    );
  };

  const handleSave = () => {
    if (step === 1 && canProceedToStep2()) {
      setStep(2);
    } else if (step === 2) {
      // Validate fiscal assignments
      const hasInvalidFiscal = lineItems.some(item => !item.fiscalTreatment);
      if (hasInvalidFiscal) {
        alert('Todas las líneas deben tener un tratamiento fiscal asignado');
        return;
      }
      
      // Calculate total amounts by fiscal treatment
      const fiscalSummary = lineItems.reduce((acc, item) => {
        const treatment = item.fiscalTreatment;
        const amount = (item.baseAmount || 0) + (item.vatAmount || 0);
        acc[treatment] = (acc[treatment] || 0) + amount;
        return acc;
      }, {});
      
      onSave({
        lineItems: lineItems.map(item => ({
          ...item,
          totalAmount: (item.baseAmount || 0) + (item.vatAmount || 0)
        })),
        fiscalSummary,
        totals
      });
    }
  };

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
          maxWidth: '900px',
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
              📋 Desglosar factura — {document?.provider}
            </h3>
            <div className="text-sm text-gray mt-1">
              Paso {step}/2: {step === 1 ? 'Líneas de detalle' : 'Asignación fiscal'}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex mb-6">
          <div className={`flex-1 text-center py-2 px-4 rounded-l-lg ${step === 1 ? 'bg-navy text-white' : 'bg-gray-100 text-gray'}`}>
            1. Líneas
          </div>
          <div className={`flex-1 text-center py-2 px-4 rounded-r-lg ${step === 2 ? 'bg-navy text-white' : 'bg-gray-100 text-gray'}`}>
            2. Fiscal
          </div>
        </div>

        {/* Step 1: Lines */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray mb-2">
                Total factura: <strong>{formatCurrency(document?.amount)}</strong>
              </div>
              {document?.hasOCR && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  💡 Datos pre-rellenados con OCR simulado. Revisa y ajusta según necesites.
                </div>
              )}
            </div>

            {/* Lines table */}
            <div className="table-responsive mb-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{textAlign: 'right'}}>Base (€)</th>
                    <th style={{textAlign: 'right'}}>IVA (€)</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Descripción del concepto"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          style={{textAlign: 'right'}}
                          value={item.baseAmount || ''}
                          onChange={(e) => updateLineItem(index, 'baseAmount', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          style={{textAlign: 'right'}}
                          value={item.vatAmount || ''}
                          onChange={(e) => updateLineItem(index, 'vatAmount', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                        {formatCurrency((item.baseAmount || 0) + (item.vatAmount || 0))}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button 
                            className="btn btn-secondary btn-xs"
                            onClick={() => duplicateLine(index)}
                            title="Duplicar línea"
                          >
                            📋
                          </button>
                          <div className="dropdown">
                            <button className="btn btn-secondary btn-xs">📐</button>
                            <div className="dropdown-content">
                              <button onClick={() => divideLine(index, 'half')}>Dividir 50/50</button>
                              <button onClick={() => divideLine(index, 'percent')}>Por %</button>
                              <button onClick={() => divideLine(index, 'amount')}>Por importe</button>
                            </div>
                          </div>
                          {lineItems.length > 1 && (
                            <button 
                              className="btn btn-error btn-xs"
                              onClick={() => deleteLine(index)}
                              title="Eliminar línea"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{fontWeight: 'bold', background: '#f9f9f9'}}>
                    <td>TOTALES</td>
                    <td style={{textAlign: 'right'}}>{formatCurrency(totals.base)}</td>
                    <td style={{textAlign: 'right'}}>{formatCurrency(totals.vat)}</td>
                    <td style={{textAlign: 'right'}}>{formatCurrency(totals.total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={addLine}
                >
                  ➕ Añadir línea
                </button>
                {Math.abs((document?.amount || 0) - totals.total) > 0.02 && (
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={addAdjustmentLine}
                  >
                    ⚖️ Línea de ajuste ({formatCurrency((document?.amount || 0) - totals.total)})
                  </button>
                )}
              </div>
              
              <div className="text-sm">
                Diferencia: <span className={Math.abs((document?.amount || 0) - totals.total) > 0.02 ? 'text-error' : 'text-success'}>
                  {formatCurrency((document?.amount || 0) - totals.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Fiscal Assignment */}
        {step === 2 && (
          <div>
            <div className="mb-4">
              <div className="bg-yellow-50 p-3 rounded-lg text-sm mb-4">
                💰 Asigna el tratamiento fiscal correcto a cada línea para optimizar tu declaración.
              </div>
            </div>

            <div className="table-responsive mb-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{textAlign: 'right'}}>Importe</th>
                    <th>Tratamiento Fiscal</th>
                    <th>Prorrateo</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => {
                    const treatment = fiscalTreatments.find(t => t.id === item.fiscalTreatment);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="font-semibold">{item.description}</div>
                          {item.isAdjustment && (
                            <div className="text-xs text-gray">Línea de ajuste</div>
                          )}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'semibold'}}>
                          {formatCurrency((item.baseAmount || 0) + (item.vatAmount || 0))}
                        </td>
                        <td>
                          <select
                            className="form-control"
                            value={item.fiscalTreatment}
                            onChange={(e) => updateLineItem(index, 'fiscalTreatment', e.target.value)}
                          >
                            {fiscalTreatments.map(treatment => (
                              <option key={treatment.id} value={treatment.id}>
                                {treatment.name}
                              </option>
                            ))}
                          </select>
                          {treatment && (
                            <div className="text-xs text-gray mt-1">{treatment.description}</div>
                          )}
                        </td>
                        <td>
                          <span className="chip chip-secondary">Por unidad</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fiscal Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {fiscalTreatments.map(treatment => {
                const amount = lineItems
                  .filter(item => item.fiscalTreatment === treatment.id)
                  .reduce((sum, item) => sum + (item.baseAmount || 0) + (item.vatAmount || 0), 0);
                
                if (amount === 0) return null;
                
                return (
                  <div key={treatment.id} className="card">
                    <div className="text-sm font-semibold">{treatment.name}</div>
                    <div className="text-lg font-bold">{formatCurrency(amount)}</div>
                    <div className="text-xs text-gray">{treatment.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-end">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="btn btn-secondary"
            >
              ← Volver a líneas
            </button>
          )}
          <button 
            onClick={handleSave}
            className={`btn ${step === 1 && !canProceedToStep2() ? 'btn-secondary' : 'btn-primary'}`}
            disabled={step === 1 && !canProceedToStep2()}
          >
            {step === 1 ? 'Continuar →' : '✅ Guardar desglose'}
          </button>
        </div>
      </div>
    </div>
  );
}