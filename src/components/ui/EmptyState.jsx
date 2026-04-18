export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
          <Icon size={32} className="text-gray-300" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
