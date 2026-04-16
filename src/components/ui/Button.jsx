export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = "w-full rounded-xl py-3 px-4 font-semibold text-center transition-all disabled:opacity-50 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-farm-600 text-white hover:bg-farm-700 shadow-md",
    secondary: "bg-white text-farm-700 border-2 border-farm-200 hover:bg-farm-50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
