import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  as: Element = 'input',
  className = '',
  containerClassName = '',
  children,
  ...props
}, ref) => {
  const baseClasses = `
    w-full px-4 py-3
    bg-gray-50 border border-gray-200
    rounded-xl
    text-gray-900 placeholder-gray-400
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
    ${className}
  `

  const renderInput = () => {
    if (Element === 'textarea') {
      return (
        <textarea
          ref={ref}
          className={`${baseClasses} resize-none`}
          rows={props.rows || 3}
          {...props}
        />
      )
    }

    if (Element === 'select') {
      return (
        <select
          ref={ref}
          className={`${baseClasses} cursor-pointer`}
          {...props}
        >
          {children}
        </select>
      )
    }

    return (
      <input
        ref={ref}
        className={`
          ${baseClasses}
          ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
          ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
        `}
        {...props}
      />
    )
  }

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        {renderInput()}
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
