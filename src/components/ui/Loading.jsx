import { Loader2, Sparkles } from 'lucide-react'

export function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-primary ${className}`}
    />
  )
}

export function LoadingDots({ className = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

export function LoadingPage({ message = '加载中...' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-glow-primary">
            <Sparkles className="text-white animate-pulse" size={32} />
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  )
}

export function LoadingOverlay({ show = true, children, message = '处理中...' }) {
  if (!show) return children

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-soft-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 size={40} className="animate-spin text-primary relative" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">{message}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default LoadingPage
