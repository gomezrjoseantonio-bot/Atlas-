// Utility function for conditional classes
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// Format currency in Spanish format
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '—';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number in Spanish format
export function formatNumber(value: number): string {
  if (isNaN(value)) return '—';
  
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Display fallback for missing data
export function displayFallback(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '' || 
      (typeof value === 'number' && isNaN(value))) {
    return fallback;
  }
  return String(value);
}