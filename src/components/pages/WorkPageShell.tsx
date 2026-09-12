'use client';

import { useState, type ReactNode } from 'react';
import { CalendarDays, Briefcase, Users } from 'lucide-react';

interface Props {
  calendarView: ReactNode;
  projectsView: ReactNode;
  teamView: ReactNode;
  /** Widok startowy, np. z ?view=team po akceptacji zaproszenia. */
  initialView?: View;
  /** Liczba oczekujących zaproszeń — badge na zakładce Ekipa. */
  pendingInvites?: number;
}

export type View = 'calendar' | 'projects' | 'team';

export function WorkPageShell({ calendarView, projectsView, teamView, initialView = 'calendar', pendingInvites = 0 }: Props) {
  const [view, setView] = useState<View>(initialView);

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
          <button
            onClick={() => setView('team')}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'team'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Ekipa
            {pendingInvites > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {pendingInvites}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Views — hide inactive view via CSS to preserve state (avoids re-sync on switch).
          Oba widoki pozostają zamontowane; odmontowanie Projektów resetowało store do
          snapshotu SSR, przez co świeżo dodane zlecenie znikało do pełnego reloadu. */}
      <div className="px-4 lg:px-0">
        <div className={view !== 'calendar' ? 'hidden' : undefined}>{calendarView}</div>
        <div className={view !== 'projects' ? 'hidden' : undefined}>{projectsView}</div>
        <div className={view !== 'team' ? 'hidden' : undefined}>{teamView}</div>
      </div>
    </>
  );
}
