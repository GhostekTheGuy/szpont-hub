'use client';

import dynamic from 'next/dynamic';

const OnboardingTutorial = dynamic(
  () => import('@/components/OnboardingTutorial').then(m => ({ default: m.OnboardingTutorial })),
  { ssr: false }
);

const WeeklyReportModal = dynamic(
  () => import('@/components/WeeklyReportModal').then(m => ({ default: m.WeeklyReportModal })),
  { ssr: false }
);

export function LazyOnboardingTutorial() {
  return <OnboardingTutorial />;
}

export function LazyWeeklyReportModal() {
  return <WeeklyReportModal />;
}
