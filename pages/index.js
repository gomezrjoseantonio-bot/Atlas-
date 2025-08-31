import { BarChart3Icon, HomeIcon, FileTextIcon, TrendingUpIcon, SettingsIcon, EuroIcon, RocketIcon, SparklesIcon } from '../components/icons';

export default function Home() {
  return (
    <main className="container" style={{padding: '48px 16px'}}>
      <div style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
        <div className="logo" style={{justifyContent: 'center', fontSize: '24px', marginBottom: '24px'}}>
          <div className="logo-mark">
            <div className="bar short"></div>
            <div className="bar mid"></div>
            <div className="bar tall"></div>
          </div>
          <div>ATLAS</div>
        </div>
        
        <h1 style={{color: 'var(--navy)', marginBottom: '16px'}}>
          Tu plataforma de gestión inmobiliaria
        </h1>
        
        <p style={{color: 'var(--gray)', marginBottom: '32px', fontSize: '18px'}}>
          Gestiona tu cartera de inmuebles, controla ingresos y gastos, y optimiza la rentabilidad de tus inversiones desde una sola plataforma.
        </p>

        <div className="grid gap-4 mb-8" style={{textAlign: 'left'}}>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3Icon size={24} color="var(--accent)" />
              <h3 style={{margin: 0}}>Panel de Control</h3>
            </div>
            <p className="text-sm text-gray">
              Vista consolidada de tu portfolio con KPIs clave, toggle PERSONAL para finanzas integradas, y alertas inteligentes.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <EuroIcon size={24} color="var(--accent)" />
              <h3 style={{margin: 0}}>Tesorería</h3>
            </div>
            <p className="text-sm text-gray">
              Radar de cuentas con estado de salud, seguimiento de flujos de caja y alertas de saldos bajos.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <HomeIcon size={24} color="var(--accent)" />
              <h3 style={{margin: 0}}>Portfolio Inmuebles</h3>
            </div>
            <p className="text-sm text-gray">
              Gestión completa de propiedades con ocupación, rentabilidad y seguimiento de inquilinos.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <FileTextIcon size={24} color="var(--accent)" />
              <h3 style={{margin: 0}}>Documentos (HITO 2)</h3>
            </div>
            <p className="text-sm text-gray">
              Inbox inteligente, gestión de facturas con OCR, y "Cierre rápido" para resolver pendientes en 5 minutos.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUpIcon size={24} color="var(--accent)" />
              <h3 style={{margin: 0}}>Proyección</h3>
            </div>
            <p className="text-sm text-gray">
              3 escenarios de forecast (Base/Optimista/Pesimista) con proyecciones a 12-24 meses.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <SettingsIcon size={24} color="var(--accent)" />
              <h3 style={{margin: 0}}>Configuración</h3>
            </div>
            <p className="text-sm text-gray">
              Configuración fiscal, categorías de gastos, integraciones bancarias y preferencias personales.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <a href="/panel" className="btn btn-primary">
            <RocketIcon size={16} style={{marginRight: '6px'}} />
            Acceder al Panel
          </a>
          <a href="/documentos" className="btn btn-secondary">
            <FileTextIcon size={16} style={{marginRight: '6px'}} />
            Ver Documentos
          </a>
        </div>

        <div className="mt-8 p-4" style={{background: '#EFF6FF', borderRadius: '8px', border: '1px solid var(--navy)'}}>
          <div className="font-medium mb-2" style={{color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <SparklesIcon size={16} />
            Implementación HITO 2 Completada
          </div>
          <div className="text-sm text-gray">
            Sistema completo de gestión documental con Inbox, tabla de facturas, Cierre rápido, 
            y cumplimiento total del brand book ATLAS.
          </div>
        </div>
      </div>
    </main>
  );
}
