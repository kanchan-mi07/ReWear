export function Input({ className = '', ...props }) {
  return <input className={`rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 ${className}`} {...props} />;
} 