import { supabase } from "@/lib/supabase";


export async function fetchUserGeneratedImages(userId: string | undefined, pageParam: number, value: string) {

    try{

        let query = supabase.from("image_metadata").select("*, image_data(id, image_url, seed)").eq('user_id', userId).order('created_at', { ascending: false }).limit(10).range((pageParam - 1) * 10, pageParam * 10 - 1)

        if(value){
          query = query.textSearch("positive_prompt", `${value}`);
        }

        const {data, error} = await query
        
        if (error) {
            console.error("Error fetching data:", error);
          } else {
            return data; 
          }
    }catch(err){
        console.log(err)
    }
}