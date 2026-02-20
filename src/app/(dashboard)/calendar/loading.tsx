export default function CalendarLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-4 px-4 lg:px-0">
        <div className="h-9 w-24 bg-muted rounded-lg" />
      </div>

      <div className="px-4 lg:px-0 space-y-3">
        {/* Timer + action buttons row */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-28 bg-muted rounded-lg" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted rounded-lg" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
          </div>
        </div>

        {/* Month calendar card */}
        <div className="bg-card border border-border rounded-xl p-3">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="flex items-center bg-secondary rounded-lg">
              <div className="w-8 h-8 bg-muted rounded-l-lg" />
              <div className="w-10 h-8 bg-muted" />
              <div className="w-8 h-8 bg-muted rounded-r-lg" />
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded mx-auto w-8" />
            ))}
          </div>

          {/* Day grid (5 weeks) */}
          {[...Array(5)].map((_, w) => (
            <div key={w} className="grid grid-cols-7 gap-1 mb-1">
              {[...Array(7)].map((_, d) => (
                <div key={d} className="h-8 bg-muted/50 rounded" />
              ))}
            </div>
          ))}
        </div>

        {/* Mobile: day events list */}
        <div className="lg:hidden bg-card border border-border rounded-xl p-4">
          <div className="h-5 w-40 bg-muted rounded mb-3" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-1 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-1" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: week time grid */}
        <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="flex border-b border-border">
            <div className="w-14 shrink-0 p-3">
              <div className="h-4 w-8 bg-muted rounded" />
            </div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 text-center py-3 border-l border-border">
                <div className="h-3 w-8 bg-muted rounded mx-auto mb-1" />
                <div className="h-5 w-6 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="h-[500px] relative">
            <div className="flex h-full">
              <div className="w-14 shrink-0 relative">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute right-2" style={{ top: `${i * 56 + 8}px` }}>
                    <div className="h-3 w-8 bg-muted rounded" />
                  </div>
                ))}
              </div>
              {[...Array(7)].map((_, dayIdx) => (
                <div key={dayIdx} className="flex-1 relative border-l border-border">
                  {[...Array(8)].map((_, h) => (
                    <div key={h} className="absolute w-full border-t border-border/30" style={{ top: `${h * 56}px` }} />
                  ))}
                  {dayIdx < 5 && (
                    <div
                      className="absolute left-0.5 right-0.5 bg-muted rounded"
                      style={{ top: `${56 + dayIdx * 20}px`, height: `${40 + dayIdx * 8}px` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
