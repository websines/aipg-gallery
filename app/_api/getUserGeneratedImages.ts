import { supabase } from "@/lib/supabase";


export async function fetchUserGeneratedImages(userId: string | undefined) {

    try{

        const {data, error} = await supabase.from("image_metadata").select("*, image_data(id, base64_string, seed)").eq('user_id', userId)

        if (error) {
            console.error("Error fetching data:", error);
          } else {
            return data; 
          }
    }catch(err){
        console.log(err)
    }
}