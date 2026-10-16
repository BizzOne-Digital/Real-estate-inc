/** Skeleton shown while catalog results stream in (used as a Suspense fallback). */
export function CatalogGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse bg-mist-deep" />
          <div className="mt-4 h-3 w-20 animate-pulse bg-mist-deep" />
          <div className="mt-3 h-6 w-40 animate-pulse bg-mist-deep" />
        </div>
      ))}
    </div>
  );
}
