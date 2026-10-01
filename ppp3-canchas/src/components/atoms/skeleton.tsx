export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function SkeletonTableRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5 border-b border-slate-100/80">
              <Skeleton className={`h-4 ${j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'w-full'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}


export function SkeletonCanchaCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}
