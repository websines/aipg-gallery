import Homepage from "@/components/homepage-components/HomePage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Homepage user={user} />;
};

export default page;
