'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

interface Section {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: Section[];
  className?: string;
}

export function SectionNav({ sections, className }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const navRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const clickLockRef = useRef(false);

  // Parents pass `sections` as an inline array literal — its reference changes
  // every render. Reduce to a stable string key so the scroll listener only
  // re-attaches when the set of section IDs actually changes.
  const sectionsKey = useMemo(() => sections.map(s => s.id).join('|'), [sections]);

  useEffect(() => {
    const sectionIds = sectionsKey.split('|');

    const handleScroll = () => {
      if (clickLockRef.current) return;

      // Near the top of the page — force first section
      if (window.scrollY < 100) {
        setActiveId(sectionIds[0]);
        return;
      }

      // Find the section closest to the top of the viewport (but not above it)
      let best = '';
      let bestDistance = Infinity;
      const offset = 120; // account for sticky nav height

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - offset);
        // Section is at or above the offset line (scrolled past the trigger point)
        if (rect.top <= offset + 50 && distance < bestDistance) {
          best = id;
          bestDistance = distance;
        }
      }

      // If nothing found above offset, pick the first visible one
      if (!best) {
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            best = id;
            break;
          }
        }
      }

      if (best) setActiveId(best);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionsKey]);

  // Auto-scroll active chip into view
  useEffect(() => {
    const chip = chipRefs.current.get(activeId);
    if (chip && navRef.current) {
      const nav = navRef.current;
      const chipLeft = chip.offsetLeft;
      const chipWidth = chip.offsetWidth;
      const navWidth = nav.offsetWidth;
      const scrollLeft = nav.scrollLeft;

      if (chipLeft < scrollLeft + 16) {
        nav.scrollTo({ left: chipLeft - 16, behavior: 'smooth' });
      } else if (chipLeft + chipWidth > scrollLeft + navWidth - 16) {
        nav.scrollTo({ left: chipLeft + chipWidth - navWidth + 16, behavior: 'smooth' });
      }
    }
  }, [activeId]);

  const handleClick = useCallback((id: string) => {
    setActiveId(id);
    clickLockRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Unlock after scroll settles
    setTimeout(() => { clickLockRef.current = false; }, 800);
  }, []);

  const setChipRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) chipRefs.current.set(id, el);
    else chipRefs.current.delete(id);
  }, []);

  return (
    <div
      ref={navRef}
      className={`sticky top-[60px] lg:top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 overflow-x-auto no-scrollbar mb-3${className ? ` ${className}` : ''}`}
    >
      <div className="flex gap-1 px-4 lg:px-0 py-2">
        {sections.map((section) => (
          <button
            key={section.id}
            ref={(el) => setChipRef(section.id, el)}
            onClick={() => handleClick(section.id)}
            className={`shrink-0 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeId === section.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
