

interface PageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Page({ children, title, subtitle, className = '' }: PageProps) {
  return (
    <main className={`flex-1 bg-bg-base ${className}`.trim()}>
      <div className="container py-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-semibold text-ink mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}