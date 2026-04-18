import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: `
    bg-gradient-to-r from-primary to-secondary text-white
    hover:from-secondary hover:to-primary
    shadow-soft hover:shadow-glow-primary
    hover:-translate-y-1 active:translate-y-0
  `,
  secondary: `
    bg-gradient-to-r from-secondary to-primary text-white
    hover:from-primary hover:to-secondary
    shadow-soft hover:shadow-glow-primary
    hover:-translate-y-1 active:translate-y-0
  `,
  accent: `
    bg-gradient-to-r from-accent to-amber-400 text-primary
    hover:from-amber-400 hover:to-accent
    shadow-glow hover:shadow-xl
    hover:-translate-y-1 active:translate-y-0
  `,
  outline: `
    border-2 border-primary/20 text-primary
    hover:bg-gradient-to-r hover:from-primary hover:to-secondary
    hover:text-white hover:border-transparent
    hover:-translate-y-1 active:translate-y-0
  `,
  ghost: `
    text-gray-600 hover:text-primary
    hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10
    hover:-translate-y-0.5
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 text-white
    hover:from-red-600 hover:to-red-500
    shadow-soft hover:shadow-lg
    hover:-translate-y-1 active:translate-y-0
  `,
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={18} className="ml-2 transition-transform group-hover:translate-x-1" />}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
