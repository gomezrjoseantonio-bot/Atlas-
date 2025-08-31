// QA Badge - Small status indicators visible only in QA mode
export default function QABadge({ qaMode, type, children, style }) {
  if (!qaMode) return children;

  const badgeStyles = {
    'default': { backgroundColor: 'var(--success)', color: 'white' },
    'override': { backgroundColor: 'var(--warning)', color: 'white' },
    'simulated': { backgroundColor: 'var(--info)', color: 'white' },
    'futuro': { backgroundColor: 'var(--gray)', color: 'white' }
  };

  const badgeLabels = {
    'default': 'DEFAULT aplicado',
    'override': 'OVERRIDE',
    'simulated': 'SIMULADO',
    'futuro': 'FUTURO'
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      {children}
      {type && (
        <span style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          fontSize: '8px',
          padding: '1px 4px',
          borderRadius: '2px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          zIndex: 10,
          ...badgeStyles[type]
        }}>
          {badgeLabels[type]}
        </span>
      )}
    </div>
  );
}