export default function TransactionsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="h-9 w-36 bg-muted rounded-lg" />
        <div className="flex gap-2">
          <div className="h-9 w-40 bg-muted rounded-lg" />
          <div className="h-9 w-40 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Wallet filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-8 bg-muted rounded-lg ${i === 0 ? 'w-24' : 'w-20'}`} />
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <div className="h-7 w-44 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full" />
                <div>
                  <div className="h-4 w-24 sm:w-32 bg-muted rounded mb-1.5" />
                  <div className="h-3 w-16 sm:w-24 bg-muted rounded" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-20 sm:w-24 bg-muted rounded mb-1.5" />
                <div className="h-3 w-14 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
