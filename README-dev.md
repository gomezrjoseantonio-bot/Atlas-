# ATLAS - Documentación de Desarrollo

## HITO 4 - Conectar botones 

### Arquitectura del Sistema

**ATLAS** ahora utiliza un sistema de gestión de estado centralizado con persistencia en localStorage y un ActionBridge para manejar todas las interacciones de usuario.

### Componentes Principales

#### 1. Store (`/store/index.js`)
- **Propósito**: Gestión centralizada del estado con persistencia automática
- **Datos gestionados**: Cuentas, inmuebles, préstamos, documentos, movimientos, alertas, usuarios
- **Métodos principales**:
  - `getState()` - Obtener estado actual
  - `setState(updates)` - Actualizar estado parcial
  - `resetDemo()` - Cargar datos de ejemplo
  - `load()` / `save()` - Persistencia en localStorage

#### 2. ActionBridge (`/actions/bridge.js`)
- **Propósito**: Delegación de eventos centralizada usando data-action
- **Funcionamiento**: Escucha clicks a nivel de documento y ejecuta acciones basadas en atributos data-action
- **Ventajas**: Evita duplicar onClick handlers, centraliza toda la lógica de acciones

#### 3. Acciones (`/actions/index.js`)
- **Documentos**: process-ocr, edit, validate, delete, export (CSV/PDF)
- **Tesorería**: transfer, toggle-rule, register-income
- **Préstamos**: create, amortize, edit, delete, link-property
- **Inmuebles**: view-detail, view-pl, delete
- **Demo**: load (resetear a datos de ejemplo)

#### 4. Componentes UI (`/components/`)
- **Modal.js**: Sistema de modales reutilizable con formularios integrados
- **Toast.js**: Notificaciones temporales para feedback de usuario

### Cómo Usar el Sistema

#### Añadir Botones Funcionales
```html
<button 
  data-action="invoice:edit"
  data-id="123"
  data-extra='{"category": "maintenance"}'
  className="btn btn-primary"
>
  Editar Factura
</button>
```

#### Añadir Nuevas Acciones
1. **Agregar al ActionBridge** (`actions/bridge.js`):
```javascript
case 'mi-nueva-accion':
  actions.miNuevaAccion(id, extraData);
  break;
```

2. **Implementar la acción** (`actions/index.js`):
```javascript
export const miNuevaAccion = (id, data) => {
  // Lógica de la acción
  showToast('success', 'Acción completada');
};
```

#### Crear Nuevos Modales
1. **Añadir título** en `getModalTitle()`:
```javascript
miModal: 'Mi Modal Title'
```

2. **Añadir renderizado** en `renderModalContent()`:
```javascript
case 'miModal':
  return <MiModalForm data={data} onClose={closeModal} showToast={showToast} />;
```

3. **Implementar componente** del modal al final del archivo.

### Acciones Disponibles

#### Documentos/Facturas
- `invoice:process-ocr` - Procesar archivos con OCR simulado
- `invoice:clear-upload` - Limpiar cola de subida
- `invoice:edit` - Editar factura (abre modal)
- `invoice:view` - Ver documento
- `invoice:assign-property` - Asignar inmueble
- `invoice:delete` - Eliminar factura
- `invoice:validate` - Marcar como validada
- `export:deductibles-csv` - Exportar gastos deducibles (CSV real)
- `export:fiscal-pdf` - Exportar informe fiscal (PDF imprimible)

#### Tesorería
- `treasury:transfer` - Transferencia entre cuentas
- `treasury:toggle-rule` - Activar/desactivar regla
- `treasury:register-income` - Registrar ingreso
- `movement:assign-document` - Asignar documento a movimiento

#### Préstamos
- `loan:create` - Crear nuevo préstamo
- `loan:amortize` - Amortización parcial
- `loan:edit` - Editar préstamo
- `loan:delete` - Eliminar préstamo
- `loan:link-property` - Vincular a inmueble

#### Inmuebles
- `property:view-detail` - Ver detalle del inmueble
- `property:view-pl` - Ver análisis P&L
- `property:delete` - Eliminar inmueble

### Resetear Datos Demo

**Opción 1**: Usar botón "🔄 Demo" en cualquier página
**Opción 2**: Ejecutar manualmente:
```javascript
import store from './store/index';
store.resetDemo();
```

**Opción 3**: Desde DevTools del navegador:
```javascript
localStorage.removeItem('atlas-store');
window.location.reload();
```

### Persistencia de Datos

- **Storage**: localStorage con clave 'atlas-store'
- **Formato**: JSON con todos los slices del estado
- **Auto-guardado**: Cada cambio se guarda automáticamente
- **Backup**: Los datos demo siempre están disponibles para restaurar

### Funcionalidades Implementadas

#### ✅ Completamente Funcional
- Gestión de documentos (subida, OCR, validación, exportación)
- Transferencias de tesorería con actualización de saldos
- CRUD completo de préstamos con amortización
- Exportación real CSV y PDF imprimible
- Sistema de notificaciones (Toast)
- Modales reutilizables con formularios

#### 🔄 En Desarrollo/Próximamente
- Edición de reglas de tesorería
- Conexión de nuevas cuentas bancarias
- Análisis P&L detallado de inmuebles
- Generación de informes avanzados

### Estructura de Archivos

```
/actions/
  ├── bridge.js      # ActionBridge - delegación de eventos
  └── index.js       # Implementaciones de acciones

/components/
  ├── Modal.js       # Sistema de modales
  └── Toast.js       # Notificaciones

/store/
  └── index.js       # Store centralizado

/pages/
  ├── documentos.js  # Gestión documental
  ├── tesoreria.js   # Tesorería y cuentas
  ├── inmuebles.js   # Gestión inmobiliaria
  └── inmuebles/
      └── prestamos.js # Gestión de préstamos
```

### Testing Básico

Para probar la funcionalidad:

1. **Cargar datos demo**: Usar botón "🔄 Demo"
2. **Probar acciones**: Cada botón debe mostrar feedback vía Toast
3. **Verificar persistencia**: Recargar página y verificar que datos se mantienen
4. **Probar modales**: Abrir modales de edición y verificar formularios
5. **Probar exportaciones**: CSV debe descargarse, PDF debe abrir para impresión

### Errores Comunes

**"Action not found"**: Verificar que la acción esté definida en ActionBridge
**"Modal no abre"**: Verificar que el tipo de modal esté en getModalTitle() y renderModalContent()
**"Datos no persisten"**: Verificar que localStorage esté habilitado en el navegador
**"Build error"**: Verificar imports y exports en actions/index.js

### Desarrollo Futuro

Para extender el sistema:
1. Añadir nuevos slices al store para más entidades
2. Crear nuevas acciones siguiendo el patrón existente
3. Implementar validaciones más robustas en formularios
4. Añadir más tipos de exportación (Excel, PDF con gráficos)
5. Integrar con APIs reales cuando esté disponible el backend