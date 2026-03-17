import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getUser } from "@/lib/supabase/cached";
import { getUserPreferences } from "@/app/actions";
import { BalanceMaskInit } from "@/components/BalanceMaskInit";
import { CurrencyInit } from "@/components/CurrencyInit";
import { OnboardingInit } from "@/components/OnboardingInit";
import { WeeklyReportInit } from "@/components/WeeklyReportInit";
import { LazyOnboardingTutorial, LazyWeeklyReportModal } from "@/components/LazyModals";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parallel fetch: user + preferences (getUserId inside prefs uses cached getUser)
  const [user, prefs] = await Promise.all([
    getUser(),
    getUserPreferences(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Użytkownik';
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
    <>
      <BalanceMaskInit value={prefs.balanceMasked} />
      <CurrencyInit value={prefs.preferredCurrency} />
      <OnboardingInit done={prefs.onboardingDone} />
      <LazyOnboardingTutorial />
      <WeeklyReportInit lastReport={prefs.lastWeeklyReport} />
      <LazyWeeklyReportModal />
      <DashboardLayout userName={userName} avatarUrl={avatarUrl} isPro={prefs.isPro}>
        {children}
      </DashboardLayout>
    </>
  );
}
