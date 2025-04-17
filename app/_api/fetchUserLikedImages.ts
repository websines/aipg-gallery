import { supabase } from "@/lib/supabase";

export async function fetchUserLikedImages(userId: string | undefined, pageParam: number) {
    if (!userId) {
      console.log("fetchUserLikedImages: No user ID provided, returning empty array.");
      return [];
    }

    try {
        // First join image_likes to image_data, then to image_metadata
        const { data, error } = await supabase
          .from("image_likes")
          .select(`
            *, 
            image_data:image_id(
              id, 
              image_url, 
              seed, 
              metadata_id, 
              image_metadata:metadata_id(
                id, 
                positive_prompt, 
                negative_prompt, 
                model, 
                sampler, 
                guidance, 
                public_view, 
                user_id, 
                created_at
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
          .range((pageParam - 1) * 10, pageParam * 10 - 1);

        if (error) {
            console.error("Error fetching liked images:", error);
            throw error;
        }

        // Transform the data to match the expected format in LikesPage component
        const transformedData = data.map(item => {
            if (!item.image_data || !item.image_data.image_metadata) {
                return null;
            }
            
            return {
                image_metadata: {
                    ...item.image_data.image_metadata,
                    // Add the image_data array as expected by the ImageCard component
                    image_data: [{
                        id: item.image_data.id,
                        image_url: item.image_data.image_url,
                        seed: item.image_data.seed,
                    }]
                }
            };
        }).filter(Boolean); // Remove any null entries
        
        return transformedData || []; 
    } catch (err) {
        console.error("Exception in fetchUserLikedImages:", err);
        throw err;
    }
}