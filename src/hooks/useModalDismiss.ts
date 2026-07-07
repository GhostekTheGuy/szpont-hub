'use client';

import { useEffect } from 'react';

// Zamyka modal klawiszem Escape, gdy jest otwarty. Wspólny hook, żeby wszystkie
// modale zachowywały się tak samo (dostępność + spójny model „jak uciec z modala").
export function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
}
