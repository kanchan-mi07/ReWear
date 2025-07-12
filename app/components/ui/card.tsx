export function Card({ className = '', ...props }) {
  return (
    <div className={`rounded-xl shadow bg-white hover:shadow-lg transition-shadow border ${className}`} {...props} />
  )
} 