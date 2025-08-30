// Brand Validator - Quick brand compliance checker
export default function BrandValidator({ qaMode }) {
  if (!qaMode) return null;

  const validateBrand = () => {
    const issues = [];

    // Check for ATLAS color palette
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary')?.trim();
    const navyColor = computedStyle.getPropertyValue('--navy')?.trim();
    
    if (!primaryColor || !navyColor) {
      issues.push('Paleta ATLAS no detectada');
    }

    // Check for purple colors (should not exist)
    const allElements = document.querySelectorAll('*');
    let foundPurple = false;
    allElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const bgColor = styles.backgroundColor;
      
      if (color.includes('purple') || bgColor.includes('purple') || 
          color.includes('rgb(128, 0, 128)') || bgColor.includes('rgb(128, 0, 128)')) {
        foundPurple = true;
      }
    });
    
    if (foundPurple) {
      issues.push('Color morado detectado (no permitido)');
    }

    // Check for right-aligned amounts (European format)
    const amountElements = document.querySelectorAll('[style*="textAlign: right"], [style*="text-align: right"]');
    if (amountElements.length === 0) {
      issues.push('Importes no alineados a la derecha');
    }

    // Check for monochrome icons (simplified check)
    // In a real implementation, you'd check actual icon elements
    // For now, we'll skip the icon check to avoid CSS selector issues

    return issues;
  };

  // Run validation on component mount and when qaMode changes
  const issues = validateBrand();

  if (issues.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: qaMode ? '40px' : '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--warning)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1001,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <div>
          <strong>No cumple brand (QA)</strong>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>
            {issues.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}