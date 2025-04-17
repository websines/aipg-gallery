import { supabase } from "@/lib/supabase";


export async function likeorUnlikeImages(userId: string | undefined, metadataId: string | undefined){
    try {
        const { data: existingLike, error } = await supabase
          .from('image_likes')
          .select('id')
          .eq('user_id', userId)
          .eq('metadata_id', metadataId);
  
        if (error) {
          // Handle error
          console.error(error);
        } else {
          if (existingLike.length > 0) {
            // Unlike
            await supabase.from('image_likes').delete().eq('id', existingLike[0].id);
  
          } else {
            // Like
            await supabase.from('image_likes').insert({ 
              user_id: userId, 
              metadata_id: metadataId 
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
}


export async function fetchLikedStatus(imageMetadataId: string | undefined, userId: string | undefined) {
    try {
      const { data: existingLike, error } = await supabase
        .from('image_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('metadata_id', imageMetadataId);
  
      if (error) {
        throw error; // Allow React Query to handle errors
      }  
      return existingLike.length > 0; // Return boolean
    } catch (error) {
      throw error; // Propagate errors for handling
    }
  }