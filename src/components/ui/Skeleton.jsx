export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-lg mb-3" />
      <Skeleton className="w-1/2 h-4 rounded-lg mb-4" />
      <div className="space-y-2">
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-soft">
          <Skeleton className="w-14 h-14 rounded-2xl mb-5" />
          <Skeleton className="w-24 h-8 rounded-lg mb-2" />
          <Skeleton className="w-16 h-4 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
