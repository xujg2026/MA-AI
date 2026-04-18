export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  )
}
