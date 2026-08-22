import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon: Icon
}) {
  const baseStyles = "font-semibold transition-all duration-150 inline-flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-600/20 border border-transparent",
    secondary: "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-250",
    outline: "bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-100 font-bold",
    danger: "bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-100 font-bold",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 active:bg-slate-200"
  };

  const sizes = {
    sm: "text-xs py-1.5 px-3 rounded-lg",
    md: "text-xs py-2.5 px-4 rounded-xl",
    lg: "text-sm py-3 px-5 rounded-xl"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 mr-1.5" />}
      {children}
    </button>
  );
}
