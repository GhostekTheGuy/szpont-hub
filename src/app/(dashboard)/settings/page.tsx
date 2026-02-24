import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/cached";
import { UserPanel } from "@/components/UserPanel";
import { getSubscription } from "@/app/actions";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Użytkownik';
  const userEmail = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || null;
  const subscription = await getSubscription();

  return (
    <UserPanel
      userName={userName}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      subscription={subscription}
    />
  );
}
