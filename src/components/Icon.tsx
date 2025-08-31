import { 
  LayoutDashboard,
  Building2,
  FileSignature,
  Banknote,
  BarChart2,
  FileText,
  Wallet,
  SlidersHorizontal,
  Bell,
  ArrowUpDown,
  Activity,
  Scale,
  LineChart,
  TrendingUp,
  Receipt,
  Settings,
  Search,
  User,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Download,
  Upload,
  Filter,
  Calendar,
  Mail,
  Tag,
  AlertTriangle,
  AlertOctagon,
  Info,
  ArrowLeftRight,
  Link2,
  Scan,
  CheckCircle,
  AlertCircle,
  Lock,
  LucideIcon
} from 'lucide-react';

// Icon mapping following the requirements
const iconMap = {
  // Navigation icons (required mapping)
  'layout-dashboard': LayoutDashboard,
  'building-2': Building2,
  'file-signature': FileSignature,
  'banknote': Banknote,
  'bar-chart-2': BarChart2,
  'file-text': FileText,
  'wallet': Wallet,
  'sliders-horizontal': SlidersHorizontal,
  'bell': Bell,
  'arrows-up-down': ArrowUpDown,
  'activity': Activity,
  'scale': Scale,
  'line-chart': LineChart,
  'trending-up': TrendingUp,
  'receipt': Receipt,
  'settings': Settings,
  
  // Global action icons (required mapping)
  'search': Search,
  'user': User,
  'plus': Plus,
  'pencil': Pencil,
  'trash-2': Trash2,
  'check': Check,
  'x': X,
  'download': Download,
  'upload': Upload,
  'filter': Filter,
  'calendar': Calendar,
  'mail': Mail,
  'tag': Tag,
  'alert-triangle': AlertTriangle,
  'alert-octagon': AlertOctagon,
  'info': Info,
  'arrow-left-right': ArrowLeftRight,
  'link-2': Link2,
  'scan': Scan,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'lock': Lock,
} as const;

export type IconName = keyof typeof iconMap;

export type IconState = 'active' | 'inactive' | 'disabled';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  name: IconName;
  size?: IconSize | number;
  state?: IconState;
  className?: string;
}

const sizeMap: Record<IconSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

const stateClasses: Record<IconState, string> = {
  active: '', // Uses theme primary color
  inactive: 'text-icon-inactive',
  disabled: 'text-icon-disabled',
};

export function Icon({ name, size = 'md', state = 'active', className = '' }: IconProps) {
  const IconComponent = iconMap[name] as LucideIcon;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found. Available icons:`, Object.keys(iconMap));
    return null;
  }

  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  const stateClass = stateClasses[state];
  
  return (
    <IconComponent 
      size={iconSize}
      strokeWidth={1.5}
      className={`${stateClass} ${className}`.trim()}
    />
  );
}