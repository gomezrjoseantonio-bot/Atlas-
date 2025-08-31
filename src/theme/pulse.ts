// Pulse theme classes (Personal mode - Turquesa primary, Navy accent)
export const pulseTheme = {
  // Colors
  primary: 'bg-turquesa text-white',
  primaryHover: 'bg-turquesa-dark',
  accent: 'text-navy',
  accentBg: 'bg-navy',
  accentHover: 'bg-navy-dark',
  
  // Buttons
  button: {
    primary: 'bg-turquesa hover:bg-turquesa-dark text-white',
    secondary: 'border-turquesa text-turquesa hover:bg-turquesa hover:text-white',
    ghost: 'text-turquesa hover:bg-turquesa/10',
  },
  
  // Navigation
  nav: {
    border: 'border-t-4 border-turquesa',
    tabActive: 'text-turquesa border-b-2 border-turquesa',
    tabInactive: 'text-icon-inactive hover:text-turquesa',
    icon: 'text-turquesa',
  },
  
  // Cards and surfaces
  card: 'bg-surface border border-border',
  
  // Links
  link: 'text-turquesa hover:text-turquesa-dark',
  
  // Badges
  badge: {
    primary: 'bg-turquesa text-white',
    accent: 'bg-navy text-white',
  },
} as const;

export type PulseTheme = typeof pulseTheme;