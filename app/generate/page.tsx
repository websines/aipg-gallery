import ImageGeneratorComponent from "@/components/image-gen-components/ImageGenForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // const metadataID = await saveMetadata(metadata, user?.id)

  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center p-4">
      <div className="text-center my-8">
        <h1 className="text-3xl md:text-4xl font-semibold ">
          AIPG IMAGE GENERATOR
        </h1>
      </div>
      <div className="w-full items-center flex flex-col justify-center">
        <ImageGeneratorComponent user={user} />
      </div>
    </div>
  );
};

export default page;
