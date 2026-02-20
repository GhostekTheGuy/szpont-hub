export default function HabitsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-4 space-y-3 px-4 lg:px-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-28 bg-muted rounded-lg mb-1" />
            <div className="h-4 w-44 bg-muted rounded" />
          </div>
          <div className="flex items-center bg-secondary rounded-lg">
            <div className="w-9 h-9 bg-muted rounded-l-lg" />
            <div className="w-12 h-9 bg-muted" />
            <div className="w-9 h-9 bg-muted rounded-r-lg" />
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-0 space-y-4">
        {/* Habits table card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Mobile: habit icons header */}
          <div className="md:hidden">
            <div className="flex border-b border-border">
              <div className="w-20 shrink-0 p-2">
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[52px] shrink-0 flex flex-col items-center gap-1 p-2">
                  <div className="w-full h-1 bg-muted rounded-full" />
                  <div className="w-9 h-9 bg-muted rounded-lg" />
                  <div className="h-2.5 w-6 bg-muted rounded" />
                </div>
              ))}
            </div>
            {/* Day rows */}
            {[...Array(7)].map((_, d) => (
              <div key={d} className="flex border-b border-border last:border-b-0">
                <div className="w-20 shrink-0 p-2">
                  <div className="h-4 w-14 bg-muted rounded mb-0.5" />
                  <div className="w-full h-1 bg-muted rounded-full" />
                </div>
                {[...Array(4)].map((_, h) => (
                  <div key={h} className="w-[52px] shrink-0 flex items-center justify-center py-2">
                    <div className="w-9 h-9 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Desktop: habits in rows, days in columns */}
          <div className="hidden md:block">
            <div className="flex border-b border-border">
              <div className="w-48 shrink-0 p-3">
                <div className="h-3 w-14 bg-muted rounded" />
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 p-2 flex flex-col items-center gap-1">
                  <div className="w-full h-1 bg-muted rounded-full" />
                  <div className="h-3 w-8 bg-muted rounded" />
                  <div className="h-5 w-5 bg-muted rounded" />
                </div>
              ))}
              <div className="w-24 shrink-0 p-2 flex items-end justify-center">
                <div className="h-3 w-14 bg-muted rounded" />
              </div>
            </div>
            {[...Array(4)].map((_, r) => (
              <div key={r} className="flex border-b border-border last:border-b-0">
                <div className="w-48 shrink-0 p-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-muted rounded-md" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                {[...Array(7)].map((_, d) => (
                  <div key={d} className="flex-1 flex items-center justify-center py-2">
                    <div className="w-8 h-8 bg-muted rounded-lg" />
                  </div>
                ))}
                <div className="w-24 shrink-0 flex items-center px-3">
                  <div className="w-full">
                    <div className="h-2.5 w-8 bg-muted rounded mb-1" />
                    <div className="w-full h-2 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add button */}
          <div className="p-3 flex items-center justify-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>

        {/* Radar chart card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 flex items-center justify-between">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-4 w-4 bg-muted rounded" />
          </div>
          <div className="p-4 pt-0 flex justify-center">
            <div className="w-[280px] h-[280px] bg-muted/50 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
