export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-farm-500 bg-white shadow-sm transition-all text-gray-900 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
