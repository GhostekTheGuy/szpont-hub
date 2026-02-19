export default function WalletsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="h-9 w-32 bg-muted rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div className="h-9 w-36 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Wallet cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <div className="h-7 w-44 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div>
                  <div className="h-4 w-28 bg-muted rounded mb-1.5" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-24 bg-muted rounded mb-1.5" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
