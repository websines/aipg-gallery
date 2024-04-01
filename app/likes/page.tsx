import LikesPage from "@/components/likespage-components/LikesPage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LikesPage user={user} />;
};

export default page;
