export default function WalletsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 lg:px-0">
        <div className="h-9 w-32 bg-muted rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div className="h-9 w-24 bg-muted rounded-lg" />
          <div className="h-9 w-32 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Wallet cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 px-4 lg:px-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 px-4 lg:px-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded-lg" style={{ width: `${60 + i * 16}px` }} />
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden px-4 lg:px-0">
        <div className="px-4 py-4 lg:px-6 lg:py-6 pb-0 flex items-center justify-between">
          <div className="h-7 w-44 bg-muted rounded" />
          <div className="h-8 w-28 bg-muted rounded-lg" />
        </div>
        <div className="px-4 py-4 lg:px-6 lg:py-6 space-y-2 sm:space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full" />
                <div>
                  <div className="h-4 w-24 sm:w-28 bg-muted rounded mb-1.5" />
                  <div className="h-3 w-32 sm:w-40 bg-muted rounded" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-24 bg-muted rounded mb-1.5" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
