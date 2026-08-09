import React from 'react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  fullWidth = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  onClick,
  type = 'button',
  ariaLabel,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-black text-white hover:bg-[#444444] active:bg-black',
    secondary: 'bg-white border border-border text-black hover:border-black active:bg-surface',
    danger: 'bg-transparent border border-negative text-negative hover:bg-negative/5 active:bg-negative/10',
    ghost: 'bg-transparent text-black hover:bg-surface'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-[44px] px-5 text-[14px]',
    lg: 'h-[48px] px-6 text-[15px]'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
