export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero header */}
      <div className="mb-3 flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <div className="h-8 w-72 bg-muted rounded-lg mb-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        {/* Left column */}
        <div className="min-w-0 space-y-3">
          {/* Net worth */}
          <div>
            <div className="h-4 w-32 bg-muted rounded mb-2" />
            <div className="h-10 w-56 bg-muted rounded" />
          </div>

          {/* Chart card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 w-40 bg-muted rounded" />
                  <div className="h-8 w-40 bg-muted rounded-lg" />
                </div>
                <div className="h-[300px] bg-muted/50 rounded-lg" />
              </div>
              <div className="lg:w-[200px] lg:border-l border-t lg:border-t-0 border-border flex lg:flex-col divide-x lg:divide-x-0 lg:divide-y divide-border">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 p-4">
                    <div className="h-3 w-20 bg-muted rounded mb-2" />
                    <div className="h-6 w-24 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <div className="h-6 w-40 bg-muted rounded mb-2" />
                <div className="h-4 w-56 bg-muted rounded mb-6" />
                <div className="h-[300px] bg-muted/50 rounded-lg" />
              </div>
            ))}
          </div>

          {/* BTC chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="h-6 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-40 bg-muted rounded mb-4" />
            <div className="h-[300px] bg-muted/50 rounded-lg" />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-3">
          {/* Wallets header */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
          {/* Wallet cards */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
          {/* Transactions */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="h-4 w-32 bg-muted rounded mb-3" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-muted rounded-full" />
                  <div>
                    <div className="h-3 w-20 bg-muted rounded mb-1" />
                    <div className="h-2.5 w-14 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
