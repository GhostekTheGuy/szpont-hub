export default function AssetsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 lg:px-0">
        <div className="h-9 w-24 bg-muted rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-10 sm:w-32 bg-muted rounded-lg" />
          <div className="h-9 w-10 sm:w-32 bg-muted rounded-lg" />
          <div className="h-9 w-10 sm:w-28 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Asset list card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden p-4 sm:p-6">
        <div className="h-7 w-32 bg-muted rounded mb-4" />

        {/* Table header (desktop) */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 mb-2">
          <div className="h-3 w-24 bg-muted rounded flex-1" />
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>

        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full" />
                <div>
                  <div className="h-4 w-20 sm:w-28 bg-muted rounded mb-1.5" />
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="hidden sm:block">
                  <div className="h-4 w-16 bg-muted rounded mb-1" />
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
                <div className="text-right">
                  <div className="h-4 w-24 bg-muted rounded mb-1.5" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax summary */}
      <div className="mt-6 bg-card border border-border rounded-xl p-6">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="h-3 w-20 bg-muted rounded mb-2" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
