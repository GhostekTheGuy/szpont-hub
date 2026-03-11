'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
