import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfilePage from "@/components/profile-components/ProfilePage";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ProfilePage user={user} />;
};

export default page;
