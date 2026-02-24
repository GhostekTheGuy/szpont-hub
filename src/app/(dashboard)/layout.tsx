import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getUser } from "@/lib/supabase/cached";
import { getBalanceMasked } from "@/app/actions";
import { BalanceMaskInit } from "@/components/BalanceMaskInit";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [userName, avatarUrl, balanceMasked] = [
    user.user_metadata?.name || user.email?.split('@')[0] || 'Użytkownik',
    user.user_metadata?.avatar_url || null,
    await getBalanceMasked(),
  ];

  return (
    <>
      <BalanceMaskInit value={balanceMasked} />
      <DashboardLayout userName={userName} avatarUrl={avatarUrl}>
        {children}
      </DashboardLayout>
    </>
  );
}
