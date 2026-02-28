import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getUser } from "@/lib/supabase/cached";
import { getUserPreferences } from "@/app/actions";
import { BalanceMaskInit } from "@/components/BalanceMaskInit";
import { CurrencyInit } from "@/components/CurrencyInit";
import { OnboardingInit } from "@/components/OnboardingInit";
import { WeeklyReportInit } from "@/components/WeeklyReportInit";

// Lazy load heavy modals (framer-motion, AI report logic)
const OnboardingTutorial = dynamic(() => import("@/components/OnboardingTutorial").then(m => ({ default: m.OnboardingTutorial })), { ssr: false });
const WeeklyReportModal = dynamic(() => import("@/components/WeeklyReportModal").then(m => ({ default: m.WeeklyReportModal })), { ssr: false });

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
      <OnboardingTutorial />
      <WeeklyReportInit lastReport={prefs.lastWeeklyReport} />
      <WeeklyReportModal />
      <DashboardLayout userName={userName} avatarUrl={avatarUrl} isPro={prefs.isPro}>
        {children}
      </DashboardLayout>
    </>
  );
}
