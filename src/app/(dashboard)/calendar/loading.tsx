export default function CalendarLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="h-9 w-36 bg-muted rounded-lg mb-1" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-10 sm:w-28 bg-muted rounded-lg" />
          <div className="h-9 w-10 sm:w-36 bg-muted rounded-lg" />
          <div className="flex items-center bg-secondary rounded-lg">
            <div className="w-9 h-9 bg-muted rounded-l-lg" />
            <div className="w-12 h-9 bg-muted" />
            <div className="w-9 h-9 bg-muted rounded-r-lg" />
          </div>
        </div>
      </div>

      {/* Calendar skeleton */}
      <div className="flex flex-col h-[calc(100vh-12rem)] bg-card border border-border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="flex border-b border-border shrink-0">
          <div className="w-10 shrink-0" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 text-center py-3 border-l border-border">
              <div className="h-3 w-8 bg-muted rounded mx-auto mb-1.5" />
              <div className="h-5 w-6 bg-muted rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex h-full">
            {/* Time labels */}
            <div className="w-10 shrink-0 relative">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute right-1.5"
                  style={{ top: `${i * 60 + 10}px` }}
                >
                  <div className="h-2.5 w-8 bg-muted rounded" />
                </div>
              ))}
            </div>

            {/* Day columns with event placeholders */}
            {[...Array(7)].map((_, dayIdx) => (
              <div key={dayIdx} className="flex-1 relative border-l border-border">
                {/* Hour grid lines */}
                {[...Array(10)].map((_, h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: `${h * 60}px`, height: 60 }}
                  />
                ))}

                {/* Fake events on some days */}
                {dayIdx < 5 && (
                  <>
                    <div
                      className="absolute left-0.5 right-0.5 bg-muted rounded"
                      style={{ top: `${60 + dayIdx * 15}px`, height: `${50 + dayIdx * 10}px` }}
                    />
                    {dayIdx % 2 === 0 && (
                      <div
                        className="absolute left-0.5 right-0.5 bg-muted rounded"
                        style={{ top: `${180 + dayIdx * 20}px`, height: 45 }}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
