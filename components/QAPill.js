// QA Pill - Floating button for easy QA panel access
import { useState } from 'react';

export default function QAPill({ qaMode, onTogglePanel }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!qaMode) return null;

  return (
    <button
      onClick={onTogglePanel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '25px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 998,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }}
      title="Abrir Panel QA (Ctrl/⌘ + Alt + Q)"
    >
      QA
    </button>
  );
}