

export type InputType = 'text' | 'number' | 'date' | 'email' | 'password';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  label?: string;
  help?: string;
  error?: string;
}

export function Input({ 
  type = 'text',
  label,
  help,
  error,
  className = '',
  id,
  ...props 
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'block w-full px-3 py-2 border border-border rounded-md shadow-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = error ? 'border-danger focus:ring-danger' : 'focus:ring-info';

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`${baseClasses} ${errorClasses} ${className}`.trim()}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
      {help && !error && (
        <p className="text-sm text-text-secondary">{help}</p>
      )}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  help?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ 
  label,
  help,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props 
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'block w-full px-3 py-2 border border-border rounded-md shadow-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = error ? 'border-danger focus:ring-danger' : 'focus:ring-info';

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${baseClasses} ${errorClasses} ${className}`.trim()}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
      {help && !error && (
        <p className="text-sm text-text-secondary">{help}</p>
      )}
    </div>
  );
}