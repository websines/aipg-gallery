import ImageCarousel from "@/components/image-gen-components/ImageCarousel";
import ImageGenForm from "@/components/image-gen-components/ImageGenForm";
import AlertDialogComponent from "@/components/misc-components/AlertDialogComponent";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center p-4">
      {!user && <AlertDialogComponent />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full ">
        <div className="flex flex-col justify-center items-center my-8 w-full ">
          <ImageGenForm user={user} />
        </div>
        <div className="md:my-8 p-4 ">
          <ImageCarousel user={user} />
        </div>
      </div>
    </div>
  );
};

export default page;
