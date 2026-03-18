'use client';

import { useState, type ReactNode } from 'react';
import { CalendarDays, Briefcase } from 'lucide-react';

interface Props {
  calendarView: ReactNode;
  projectsView: ReactNode;
}

type View = 'calendar' | 'projects';

export function WorkPageShell({ calendarView, projectsView }: Props) {
  const [view, setView] = useState<View>('calendar');

  return (
    <>
      {/* Header with switch */}
      <div className="mb-4 px-4 lg:px-0 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Praca</h1>
        <div className="flex items-center bg-secondary rounded-lg p-1">
          <button
            onClick={() => setView('projects')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'projects'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Projekty
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Kalendarz
          </button>
        </div>
      </div>

      {/* Views — hide inactive view via CSS to preserve state (avoids re-sync on switch) */}
      <div className="px-4 lg:px-0">
        <div className={view !== 'calendar' ? 'hidden' : undefined}>{calendarView}</div>
        {view === 'projects' && projectsView}
      </div>
    </>
  );
}
