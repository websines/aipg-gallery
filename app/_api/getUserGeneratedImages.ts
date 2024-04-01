import { supabase } from "@/lib/supabase";


export async function fetchUserGeneratedImages(userId: string | undefined, pageParam: number) {

    try{

        const {data, error} = await supabase.from("image_metadata").select("*, image_data(id, base64_string, seed)").eq('user_id', userId).order('created_at', { ascending: false }).limit(10).range((pageParam - 1) * 10, pageParam * 10 - 1)

        if (error) {
            console.error("Error fetching data:", error);
          } else {
            return data; 
          }
    }catch(err){
        console.log(err)
    }
}