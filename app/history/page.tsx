import { createSupabaseServerClient } from "@/lib/supabase/server";

import HistoryPage from "@/components/historypage-components/Historypage";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HistoryPage user={user} />;
};

export default page;
