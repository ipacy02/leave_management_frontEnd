import React, { forwardRef } from 'react';

// Card Component
export const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg border shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// CardHeader Component
export const CardHeader = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 border-b ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// CardContent Component
export const CardContent = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// CardFooter Component
export const CardFooter = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// Button Component
export const Button = forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "underline-offset-4 hover:underline text-slate-900"
  };

  const sizes = {
    default: "h-10 py-2 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
});

// Avatar Component
export const Avatar = forwardRef(({ 
  className, 
  src, 
  alt, 
  fallback, 
  ...props 
}, ref) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      ref={ref}
      className={`relative flex shrink-0 overflow-hidden rounded-full ${className || ''}`}
      {...props}
    >
      {!imageError && src ? (
        <img
          className="h-full w-full object-cover"
          src={src}
          alt={alt || "Avatar"}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-900">
          {fallback || alt?.charAt(0) || "U"}
        </div>
      )}
    </div>
  );
});

// Spinner Component
export const Spinner = forwardRef(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      className={`animate-spin ${className || 'h-5 w-5 text-slate-900'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

// Badge Component
export const Badge = forwardRef(({ 
  className, 
  variant = 'default', 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    secondary: "bg-slate-200 text-slate-900",
    destructive: "bg-red-100 text-red-800",
    outline: "text-slate-900 border border-slate-200"
  };

  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  );
});