import { createSupabaseServerClient } from "@/lib/supabase/server";

import ImageGallery from "@/components/historypage-components/image-gallery";
import HistorySearch from "@/components/historypage-components/search-bar";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col justify-center items-center my-8">
      <HistorySearch />
      <ImageGallery userId={user?.id} />
    </div>
  );
};

export default page;
