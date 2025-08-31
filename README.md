# ATLAS — Gestión Inmobiliaria

Plataforma de gestión inmobiliaria con dos módulos: **Horizon** (Invest) y **Pulse** (Personal), construida desde cero con tecnologías modernas.

## Stack Tecnológico

- **Frontend**: Vite + React + TypeScript
- **Estilos**: TailwindCSS
- **Iconos**: lucide-react (exclusivamente)
- **Routing**: React Router v6
- **Deployment**: Netlify (SPA ready)

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:3000

# Construcción
npm run build        # Construye para producción
npm run preview      # Previsualiza build de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
npm run check-icons  # Audita iconos (solo permite lucide-react)
```

## Arquitectura

### Estructura de Carpetas

```
/src/
  app/
    providers/      ← ThemeProvider, Router
    routes/         ← Definición de rutas
  components/
    layout/         ← Navbar, Page
    ui/             ← Button, Input, Tabs, Card, Badge, Chip
    Icon.tsx        ← Punto único de iconos (lucide-react)
  pages/           ← Páginas organizadas por módulo
  theme/           ← Sistema de tokens y temas
  lib/             ← Store y utilidades
  styles/          ← CSS global
```

### Sistema de Temas Dual

La aplicación utiliza un sistema de temas que cambia dinámicamente:

- **Horizon (Invest)**: Primario Navy (#022D5E), Acento Turquesa (#2EB0CB)
- **Pulse (Personal)**: Primario Turquesa (#2EB0CB), Acento Navy (#022D5E)

El tema se persiste en `localStorage` con la clave `atlas:mode`.

### Navegación por Módulos

#### Horizon (Invest) — Visible solo en modo Horizon
- Panel
- Inmuebles (Cartera, Contratos, Préstamos, Gastos & Docs, Análisis)
- Tesorería (Radar, Movimientos, Reglas & Sweeps, Alertas)
- Fiscalidad
- Proyección (Inmuebles, Personal, Consolidado)
- Configuración

#### Pulse (Personal) — Visible solo en modo Pulse
- Panel
- Ingresos
- Gastos
- Tesorería Personal (Cuentas, Movimientos, Alertas)
- Proyección Personal
- Configuración

**Panel** y **Configuración** son visibles en ambos modos.

## Cambio de Modo

Utiliza el toggle en la esquina superior derecha del header para cambiar entre Horizon y Pulse. El cambio es instantáneo sin recarga y persiste la selección.

## Normas de Iconografía

**⚠️ IMPORTANTE**: Solo se permiten iconos de `lucide-react`.

- Importa iconos únicamente a través de `/src/components/Icon.tsx`
- Estados: `active` | `inactive` | `disabled`
- Tamaños: `sm` (14px) | `md` (16px) | `lg` (20px) | `xl` (24px)
- Stroke width fijo: 1.5

### Ejemplo de uso:
```tsx
import { Icon } from '@/components/Icon';

<Icon name="building-2" size="md" state="active" />
```

### Auditoría automática:
```bash
npm run check-icons  # Falla si detecta iconos de otros packs
```

## Despliegue en Netlify

La aplicación está configurada como SPA con:

1. **Redirects**: `public/_redirects` con `/* /index.html 200`
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. **Node version**: 18+

### Pasos para desplegar:

1. Conecta el repositorio en Netlify
2. Configura build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy automático desde la rama principal

## Desarrollo

### Añadir nueva página:
1. Crea el componente en `/src/pages/[modulo]/`
2. Añade la ruta en `/src/app/providers/AppProviders.tsx`
3. Actualiza la definición en `/src/app/routes/routes.ts` si necesita navegación

### Añadir nuevo icono:
1. Importa desde `lucide-react` en `/src/components/Icon.tsx`
2. Añade al `iconMap` con el nombre kebab-case
3. Actualiza el tipo `IconName`

### Añadir nueva página de configuración:
Las páginas de configuración se comparten entre modos. Añade lógica condicional en el componente para mostrar/ocultar secciones según el modo actual.

## Estado Actual

Todas las rutas están implementadas con placeholders informativos. La funcionalidad específica de cada módulo se desarrollará en hitos posteriores (H1-H9).

---

**Versión**: 1.0.0 — H0 Reboot Atlas  
**Contacto**: Desarrollo interno
