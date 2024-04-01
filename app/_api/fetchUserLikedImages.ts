import { supabase } from "@/lib/supabase";


export async function fetchUserLikedImages(userId: string | undefined) {

    try{

        const {data, error} = await supabase.from("image_likes").select('*, image_metadata:image_metadata_id(positive_prompt, negative_prompt, model, sampler, id, guidance, public_view, image_data(*))').eq('user_id', userId)

        if (error) {
            console.error("Error fetching data:", error);
          } else {
            return data; 
          }
    }catch(err){
        console.log(err)
    }
}