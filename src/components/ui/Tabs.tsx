
import { useTheme } from '../../app/providers/ThemeProvider';
import { Icon, IconName } from '../Icon';

export interface Tab {
  key: string;
  label: string;
  icon?: IconName;
  href?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange?: (tabKey: string) => void;
  level?: 'primary' | 'secondary';
  className?: string;
}

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  level = 'primary',
  className = '' 
}: TabsProps) {
  const { theme } = useTheme();
  
  const handleTabClick = (tab: Tab, event: React.MouseEvent) => {
    if (onTabChange) {
      event.preventDefault();
      onTabChange(tab.key);
    }
  };

  const baseClasses = level === 'primary' 
    ? 'flex space-x-8 border-b border-border'
    : 'flex space-x-4 border-b border-border bg-bg-base px-4';

  return (
    <div className={`${baseClasses} ${className}`.trim()}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        
        const tabClasses = level === 'primary'
          ? `flex items-center space-x-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
              isActive 
                ? theme.nav.tabActive
                : `${theme.nav.tabInactive} border-transparent`
            }`
          : `flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
              isActive
                ? 'bg-surface text-ink border-b-2 border-transparent'
                : 'text-text-secondary hover:text-ink'
            }`;

        const content = (
          <>
            {tab.icon && (
              <Icon 
                name={tab.icon} 
                size="sm" 
                state={isActive ? 'active' : 'inactive'}
              />
            )}
            <span>{tab.label}</span>
          </>
        );

        if (tab.href && !onTabChange) {
          return (
            <a key={tab.key} href={tab.href} className={tabClasses}>
              {content}
            </a>
          );
        }

        return (
          <button
            key={tab.key}
            onClick={(e) => handleTabClick(tab, e)}
            className={tabClasses}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}