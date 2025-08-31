
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../app/providers/ThemeProvider';
import { getRoutesForMode, findRoute } from '../../app/routes/routes';
import { Tabs, Tab } from '../ui/Tabs';

export function Navbar() {
  const { mode, setMode, theme } = useTheme();
  const location = useLocation();
  
  const routes = getRoutesForMode(mode);
  const currentRoute = findRoute(location.pathname, routes);
  
  // Convert routes to tabs
  const tabs: Tab[] = routes.map(route => ({
    key: route.path,
    label: route.label,
    icon: route.icon,
    href: route.path,
  }));

  const handleModeToggle = (newMode: 'horizon' | 'pulse') => {
    setMode(newMode);
  };

  return (
    <header className={`bg-surface shadow-sm ${theme.nav.border}`}>
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo-atlas.png" 
              alt="ATLAS" 
              className="h-8 w-auto"
              onError={(e) => {
                // Fallback if logo doesn't exist yet
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-turquesa rounded-full"></div>
                <div className="w-1 h-6 bg-turquesa rounded-full"></div>
                <div className="w-1 h-8 bg-turquesa rounded-full"></div>
              </div>
              <span className="text-xl font-semibold text-navy">ATLAS</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-bg-base rounded-lg p-1">
            <button
              onClick={() => handleModeToggle('horizon')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'horizon'
                  ? 'bg-surface shadow-sm text-navy'
                  : 'text-text-secondary hover:text-ink'
              }`}
            >
              Horizon
            </button>
            <button
              onClick={() => handleModeToggle('pulse')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'pulse'
                  ? 'bg-surface shadow-sm text-turquesa'
                  : 'text-text-secondary hover:text-ink'
              }`}
            >
              Pulse
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="overflow-x-auto tabs-mobile">
          <Tabs
            tabs={tabs}
            activeTab={currentRoute?.path || location.pathname}
            level="primary"
            className="min-w-max"
          />
        </div>
      </div>
    </header>
  );
}