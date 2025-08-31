import { IconName } from '../../components/Icon';

export interface Route {
  path: string;
  label: string;
  icon: IconName;
  mode?: 'horizon' | 'pulse' | 'both';
  children?: Route[];
}

// Horizon (Invest) routes
export const horizonRoutes: Route[] = [
  {
    path: '/panel',
    label: 'Panel',
    icon: 'layout-dashboard',
    mode: 'both',
  },
  {
    path: '/inmuebles',
    label: 'Inmuebles',
    icon: 'building-2',
    mode: 'horizon',
    children: [
      { path: '/inmuebles', label: 'Cartera', icon: 'building-2' },
      { path: '/inmuebles/contratos', label: 'Contratos', icon: 'file-signature' },
      { path: '/inmuebles/prestamos', label: 'Préstamos', icon: 'banknote' },
      { path: '/inmuebles/gastos', label: 'Gastos & Docs', icon: 'file-text' },
      { path: '/inmuebles/analisis', label: 'Análisis', icon: 'bar-chart-2' },
    ],
  },
  {
    path: '/tesoreria',
    label: 'Tesorería',
    icon: 'wallet',
    mode: 'horizon',
    children: [
      { path: '/tesoreria/radar', label: 'Radar', icon: 'activity' },
      { path: '/tesoreria/movimientos', label: 'Movimientos', icon: 'arrows-up-down' },
      { path: '/tesoreria/reglas', label: 'Reglas & Sweeps', icon: 'sliders-horizontal' },
      { path: '/tesoreria/alertas', label: 'Alertas', icon: 'bell' },
    ],
  },
  {
    path: '/fiscalidad',
    label: 'Fiscalidad',
    icon: 'scale',
    mode: 'horizon',
  },
  {
    path: '/proyeccion',
    label: 'Proyección',
    icon: 'line-chart',
    mode: 'horizon',
    children: [
      { path: '/proyeccion/inmuebles', label: 'Inmuebles', icon: 'building-2' },
      { path: '/proyeccion/personal', label: 'Personal', icon: 'user' },
      { path: '/proyeccion/consolidado', label: 'Consolidado', icon: 'bar-chart-2' },
    ],
  },
  {
    path: '/configuracion',
    label: 'Configuración',
    icon: 'settings',
    mode: 'both',
    children: [
      { path: '/configuracion/bancos', label: 'Bancos & Cuentas', icon: 'wallet' },
      { path: '/configuracion/plan', label: 'Plan & Facturación', icon: 'receipt' },
      { path: '/configuracion/usuarios', label: 'Usuarios & Roles', icon: 'user' },
      { path: '/configuracion/preferencias', label: 'Preferencias & Datos', icon: 'settings' },
    ],
  },
];

// Pulse (Personal) routes
export const pulseRoutes: Route[] = [
  {
    path: '/panel',
    label: 'Panel',
    icon: 'layout-dashboard',
    mode: 'both',
  },
  {
    path: '/ingresos',
    label: 'Ingresos',
    icon: 'trending-up',
    mode: 'pulse',
  },
  {
    path: '/gastos',
    label: 'Gastos',
    icon: 'receipt',
    mode: 'pulse',
  },
  {
    path: '/tesoreria-personal',
    label: 'Tesorería Personal',
    icon: 'wallet',
    mode: 'pulse',
    children: [
      { path: '/tesoreria-personal/cuentas', label: 'Cuentas', icon: 'wallet' },
      { path: '/tesoreria-personal/movimientos', label: 'Movimientos', icon: 'arrows-up-down' },
      { path: '/tesoreria-personal/alertas', label: 'Alertas', icon: 'bell' },
    ],
  },
  {
    path: '/proyeccion-personal',
    label: 'Proyección Personal',
    icon: 'line-chart',
    mode: 'pulse',
  },
  {
    path: '/configuracion',
    label: 'Configuración',
    icon: 'settings',
    mode: 'both',
    children: [
      { path: '/configuracion/bancos', label: 'Bancos & Cuentas', icon: 'wallet' },
      { path: '/configuracion/plan', label: 'Plan & Facturación', icon: 'receipt' },
      { path: '/configuracion/usuarios', label: 'Usuarios & Roles', icon: 'user' },
      { path: '/configuracion/preferencias', label: 'Preferencias & Datos', icon: 'settings' },
    ],
  },
];

// Helper functions
export function getRoutesForMode(mode: 'horizon' | 'pulse'): Route[] {
  return mode === 'horizon' ? horizonRoutes : pulseRoutes;
}

export function findRoute(path: string, routes: Route[]): Route | undefined {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }
    if (route.children) {
      const found = findRoute(path, route.children);
      if (found) return found;
    }
  }
  return undefined;
}