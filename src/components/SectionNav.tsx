'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    observerRef.current?.disconnect();

    const visibleSections = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        }

        // Pick the section with highest intersection ratio
        let best = '';
        let bestRatio = 0;
        Array.from(visibleSections.entries()).forEach(([id, ratio]) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });

        if (best) setActiveId(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-80px 0px -40% 0px' }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [sections]);

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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
