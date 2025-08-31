
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { Navbar } from '../../components/layout/Navbar';

// Import all pages
import { PanelPage } from '../../pages/panel/PanelPage';
import { 
  InmueblesPage, 
  ContratosPage, 
  PrestamosPage, 
  GastosPage, 
  AnalisisPage 
} from '../../pages/inmuebles/InmueblesPages';
import { 
  TesoreriaRadarPage, 
  TesoreriaMovimientosPage, 
  TesoreriaReglasPage, 
  TesoreriaAlertasPage 
} from '../../pages/tesoreria/TesoreriaPages';
import { FiscalidadPage } from '../../pages/FiscalidadPage';
import { 
  ProyeccionInmueblesPage, 
  ProyeccionPersonalPage, 
  ProyeccionConsolidadoPage 
} from '../../pages/proyeccion/ProyeccionPages';
import { 
  ConfiguracionBancosPage, 
  ConfiguracionPlanPage, 
  ConfiguracionUsuariosPage, 
  ConfiguracionPreferenciasPage 
} from '../../pages/configuracion/ConfiguracionPages';
import { 
  IngresosPage, 
  GastosPersonalesPage, 
  TesoreriaPersonalCuentasPage, 
  TesoreriaPersonalMovimientosPage, 
  TesoreriaPersonalAlertasPage, 
  ProyeccionPersonalMainPage 
} from '../../pages/pulse/PulsePages';

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/panel" replace />} />
          
          {/* Panel (both modes) */}
          <Route path="/panel" element={<PanelPage />} />
          
          {/* Horizon (Invest) routes */}
          <Route path="/inmuebles" element={<InmueblesPage />} />
          <Route path="/inmuebles/contratos" element={<ContratosPage />} />
          <Route path="/inmuebles/prestamos" element={<PrestamosPage />} />
          <Route path="/inmuebles/gastos" element={<GastosPage />} />
          <Route path="/inmuebles/analisis" element={<AnalisisPage />} />
          
          <Route path="/tesoreria/radar" element={<TesoreriaRadarPage />} />
          <Route path="/tesoreria/movimientos" element={<TesoreriaMovimientosPage />} />
          <Route path="/tesoreria/reglas" element={<TesoreriaReglasPage />} />
          <Route path="/tesoreria/alertas" element={<TesoreriaAlertasPage />} />
          <Route path="/tesoreria" element={<Navigate to="/tesoreria/radar" replace />} />
          
          <Route path="/fiscalidad" element={<FiscalidadPage />} />
          
          <Route path="/proyeccion/inmuebles" element={<ProyeccionInmueblesPage />} />
          <Route path="/proyeccion/personal" element={<ProyeccionPersonalPage />} />
          <Route path="/proyeccion/consolidado" element={<ProyeccionConsolidadoPage />} />
          <Route path="/proyeccion" element={<Navigate to="/proyeccion/inmuebles" replace />} />
          
          {/* Pulse (Personal) routes */}
          <Route path="/ingresos" element={<IngresosPage />} />
          <Route path="/gastos" element={<GastosPersonalesPage />} />
          
          <Route path="/tesoreria-personal/cuentas" element={<TesoreriaPersonalCuentasPage />} />
          <Route path="/tesoreria-personal/movimientos" element={<TesoreriaPersonalMovimientosPage />} />
          <Route path="/tesoreria-personal/alertas" element={<TesoreriaPersonalAlertasPage />} />
          <Route path="/tesoreria-personal" element={<Navigate to="/tesoreria-personal/cuentas" replace />} />
          
          <Route path="/proyeccion-personal" element={<ProyeccionPersonalMainPage />} />
          
          {/* Configuration (both modes) */}
          <Route path="/configuracion/bancos" element={<ConfiguracionBancosPage />} />
          <Route path="/configuracion/plan" element={<ConfiguracionPlanPage />} />
          <Route path="/configuracion/usuarios" element={<ConfiguracionUsuariosPage />} />
          <Route path="/configuracion/preferencias" element={<ConfiguracionPreferenciasPage />} />
          <Route path="/configuracion" element={<Navigate to="/configuracion/bancos" replace />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/panel" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export function AppProviders() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}