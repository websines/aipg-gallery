import ImageGeneratorComponent from "@/components/image-gen-components/ImageGenForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const page = async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 tracking-tight">
            AI Image Generator
          </h1>
          <p className="text-zinc-300 mt-4 max-w-2xl mx-auto text-lg">
            Create stunning AI-generated images with powerful customization options
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="flex items-center space-x-2 bg-zinc-800/50 rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-zinc-300 text-sm">AI Horde Powered</span>
            </div>
            <div className="flex items-center space-x-2 bg-zinc-800/50 rounded-full px-4 py-1.5">
              <span className="text-zinc-300 text-sm">Free to Use</span>
            </div>
          </div>
        </div>
        
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-7xl bg-zinc-900/30 backdrop-blur-lg rounded-2xl border border-zinc-800/50 shadow-2xl overflow-hidden">
            <div className="p-1">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1 w-full rounded-t-xl"></div>
              <ImageGeneratorComponent user={user} />
            </div>
          </div>
          
          <div className="mt-8 text-center text-zinc-500 text-sm">
            <p>Images are generated using the AI Horde distributed network.</p>
            <p>Please be patient as generation times may vary based on network load.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
