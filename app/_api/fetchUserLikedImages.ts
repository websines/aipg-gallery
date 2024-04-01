import { supabase } from "@/lib/supabase";


export async function fetchUserLikedImages(userId: string | undefined, pageParam: number) {

    try{

        const {data, error} = await supabase.from("image_likes").select('*, image_metadata:image_metadata_id(positive_prompt, negative_prompt, model, sampler, id, guidance, public_view, image_data(*))').eq('user_id', userId).order('created_at', { ascending: false }).limit(10).range((pageParam - 1) * 10, pageParam * 10 - 1)

        if (error) {
            console.error("Error fetching data:", error);
          } else {
            return data; 
          }
    }catch(err){
        console.log(err)
    }
}