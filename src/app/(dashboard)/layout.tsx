import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getUser } from "@/lib/supabase/cached";
import { getBalanceMasked, getOnboardingDone, isProUser, getLastWeeklyReport } from "@/app/actions";
import { BalanceMaskInit } from "@/components/BalanceMaskInit";
import { OnboardingInit } from "@/components/OnboardingInit";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { WeeklyReportInit } from "@/components/WeeklyReportInit";
import { WeeklyReportModal } from "@/components/WeeklyReportModal";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Użytkownik';
  const avatarUrl = user.user_metadata?.avatar_url || null;
  const [balanceMasked, onboardingDone, isPro, lastWeeklyReport] = await Promise.all([
    getBalanceMasked(),
    getOnboardingDone(),
    isProUser(),
    getLastWeeklyReport(),
  ]);

  return (
    <>
      <BalanceMaskInit value={balanceMasked} />
      <OnboardingInit done={onboardingDone} />
      <OnboardingTutorial />
      <WeeklyReportInit lastReport={lastWeeklyReport} />
      <WeeklyReportModal />
      <DashboardLayout userName={userName} avatarUrl={avatarUrl} isPro={isPro}>
        {children}
      </DashboardLayout>
    </>
  );
}
