export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 px-4 lg:px-0">
        <div className="h-8 w-48 bg-muted rounded-lg mb-1" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      {/* Net worth card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 mx-4 lg:mx-0">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg" />
        </div>
        <div className="h-10 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 px-4 lg:px-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div>
                <div className="h-4 w-24 bg-muted rounded mb-1" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Transactions + Goals grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-0">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div>
                    <div className="h-4 w-28 bg-muted rounded mb-1" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-6 w-24 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-2 w-full bg-muted rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
