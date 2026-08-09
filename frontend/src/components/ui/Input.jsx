import React from 'react';

export const Input = React.forwardRef(({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  fullWidth = true,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          {label} {required && <span className="text-negative">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`h-[42px] px-3.5 bg-white border border-border rounded-lg text-black font-sans text-[14px] transition-colors placeholder:text-muted focus:outline-none focus:border-black ${
          error ? 'border-negative' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="font-mono text-[11px] text-negative">{error}</span>}
      {helperText && !error && <span className="font-mono text-[11px] text-muted">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';
