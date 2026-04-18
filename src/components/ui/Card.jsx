export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  gradient = null,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-white shadow-soft',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20',
    dark: 'bg-gray-900 text-white',
    gradient: gradient ? `bg-gradient-to-br ${gradient}` : 'bg-white',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        rounded-2xl
        ${variants[variant]}
        ${hover ? 'hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

// Card sub-components
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}
