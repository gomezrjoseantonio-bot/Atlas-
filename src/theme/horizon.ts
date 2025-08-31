// Horizon theme classes (Invest mode - Navy primary, Turquesa accent)
export const horizonTheme = {
  // Colors
  primary: 'bg-navy text-white',
  primaryHover: 'bg-navy-dark',
  accent: 'text-turquesa',
  accentBg: 'bg-turquesa',
  accentHover: 'bg-turquesa-dark',
  
  // Buttons
  button: {
    primary: 'bg-navy hover:bg-navy-dark text-white',
    secondary: 'border-navy text-navy hover:bg-navy hover:text-white',
    ghost: 'text-navy hover:bg-navy/10',
  },
  
  // Navigation
  nav: {
    border: 'border-t-4 border-navy',
    tabActive: 'text-navy border-b-2 border-navy',
    tabInactive: 'text-icon-inactive hover:text-navy',
    icon: 'text-navy',
  },
  
  // Cards and surfaces
  card: 'bg-surface border border-border',
  
  // Links
  link: 'text-navy-link hover:text-navy',
  
  // Badges
  badge: {
    primary: 'bg-navy text-white',
    accent: 'bg-turquesa text-white',
  },
} as const;

export type HorizonTheme = typeof horizonTheme;