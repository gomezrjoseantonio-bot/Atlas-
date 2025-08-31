export default function LoadingSkeleton({ 
  lines = 3, 
  height = '20px', 
  className = '', 
  style = {} 
}) {
  return (
    <div className={`loading-skeleton ${className}`} style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-line"
          style={{
            height: height,
            background: 'linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.5s infinite',
            borderRadius: '4px',
            marginBottom: index < lines - 1 ? '8px' : '0',
            width: index === lines - 1 ? `${70 + Math.random() * 20}%` : '100%'
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .loading-skeleton {
          animation: skeleton-fade-in 0.3s ease-out;
        }
        
        @keyframes skeleton-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}