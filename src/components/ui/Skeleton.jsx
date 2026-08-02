
export const Skeleton = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`}></div>
);

// A specific skeleton for Job Cards
export const JobCardSkeleton = () => (
  <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div>
      <div className="flex justify-between mb-3">
        <Skeleton className="w-2/3 h-6" />
        <Skeleton className="w-10 h-6" />
      </div>
      <Skeleton className="w-full h-4 mt-2" />
      <Skeleton className="w-4/5 h-4 mt-2" />
    </div>
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-24 h-8 rounded-xl" />
    </div>
  </div>
);

// A themed page shell used as the Suspense fallback during route transitions.
// Mirrors the app layout so navigation never flashes a blank/dark page.
export const PageSkeleton = () => (
  <div className="flex min-h-screen flex-col bg-[var(--hc-bg)]">
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>

    <div className="flex-1 px-4 pb-24">
      <Skeleton className="h-32 w-full rounded-2xl sm:h-40" />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
              i === 2 ? 'sm:col-span-2' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <Skeleton className="mt-2 h-3 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
