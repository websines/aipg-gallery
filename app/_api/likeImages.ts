import { supabase } from "@/lib/supabase";

export async function likeorUnlikeImages(userId: string | undefined, metadataId: string | undefined) {
    console.log("[likeorUnlikeImages] Function called with:", { userId, metadataId });
    
    if (!userId || !metadataId) {
      console.error("[likeorUnlikeImages] Missing required parameters:", { userId, metadataId });
      throw new Error("Missing required parameters: userId or metadataId");
    }

    try {
        // First get the correct image_data id that corresponds to this metadata
        console.log("[likeorUnlikeImages] Fetching corresponding image_data.id for metadata ID:", metadataId);
        const { data: imageData, error: imageDataError } = await supabase
          .from('image_data')
          .select('id')
          .eq('metadata_id', metadataId)
          .limit(1);

        if (imageDataError) {
          console.error("[likeorUnlikeImages] Error fetching image_data:", imageDataError);
          throw imageDataError;
        }

        if (!imageData || imageData.length === 0) {
          console.error("[likeorUnlikeImages] No image_data found for metadata ID:", metadataId);
          throw new Error("No image data found for this metadata");
        }

        const imageDataId = imageData[0].id;
        console.log("[likeorUnlikeImages] Found image_data.id:", imageDataId);

        console.log("[likeorUnlikeImages] Checking if image is already liked...");
        const { data: existingLike, error } = await supabase
          .from('image_likes')
          .select('id')
          .eq('user_id', userId)
          .eq('image_id', imageDataId); // Use image_data.id instead of metadata ID
  
        console.log("[likeorUnlikeImages] Existing like check result:", { existingLike, error });
        
        if (error) {
          console.error("[likeorUnlikeImages] Error checking like status:", error);
          throw error;
        }
        
        let actionPerformed = '';
        
        if (existingLike && existingLike.length > 0) {
            // Unlike
            console.log("[likeorUnlikeImages] Image already liked, removing like with ID:", existingLike[0].id);
            const { error: deleteError } = await supabase
              .from('image_likes')
              .delete()
              .eq('id', existingLike[0].id);
            
            if (deleteError) {
              console.error("[likeorUnlikeImages] Error unliking image:", deleteError);
              throw deleteError;
            }
            actionPerformed = 'unliked';
            console.log("[likeorUnlikeImages] Successfully unliked image");
  
        } else {
            // Like
            console.log("[likeorUnlikeImages] Image not liked yet, adding like");
            const { data: insertData, error: insertError } = await supabase
              .from('image_likes')
              .insert({ 
                user_id: userId, 
                image_id: imageDataId // Use image_data.id instead of metadata ID
              })
              .select();
            
            if (insertError) {
              console.error("[likeorUnlikeImages] Error liking image:", insertError);
              throw insertError;
            }
            actionPerformed = 'liked';
            console.log("[likeorUnlikeImages] Successfully liked image, new record:", insertData);
        }

        // Return the new status (true if liked, false if unliked)
        const newStatus = actionPerformed === 'liked';
        console.log("[likeorUnlikeImages] Returning new like status:", newStatus);
        return newStatus;
      } catch (error) {
        console.error("[likeorUnlikeImages] Exception occurred:", error);
        throw error;
      }
}

export async function fetchLikedStatus(imageMetadataId: string | undefined, userId: string | undefined) {
    console.log("[fetchLikedStatus] Function called with:", { imageMetadataId, userId });
    
    if (!userId || !imageMetadataId) {
      console.error("[fetchLikedStatus] Missing required parameters:", { userId, imageMetadataId });
      return false; // If no user or image ID, can't be liked
    }

    try {
      // First get the correct image_data id that corresponds to this metadata
      console.log("[fetchLikedStatus] Fetching corresponding image_data.id for metadata ID:", imageMetadataId);
      const { data: imageData, error: imageDataError } = await supabase
        .from('image_data')
        .select('id')
        .eq('metadata_id', imageMetadataId)
        .limit(1);

      if (imageDataError) {
        console.error("[fetchLikedStatus] Error fetching image_data:", imageDataError);
        throw imageDataError;
      }

      if (!imageData || imageData.length === 0) {
        console.error("[fetchLikedStatus] No image_data found for metadata ID:", imageMetadataId);
        return false; // No image data found, so can't be liked
      }

      const imageDataId = imageData[0].id;
      console.log("[fetchLikedStatus] Found image_data.id:", imageDataId);

      console.log("[fetchLikedStatus] Querying database for like status");
      const { data: existingLike, error } = await supabase
        .from('image_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageDataId); // Use image_data.id instead of metadata ID
  
      if (error) {
        console.error("[fetchLikedStatus] Error fetching like status:", error);
        throw error;
      }
      
      const isLiked = existingLike && existingLike.length > 0;
      console.log("[fetchLikedStatus] Like status result:", { isLiked, recordCount: existingLike?.length });
      return isLiked;
    } catch (error) {
      console.error("[fetchLikedStatus] Exception occurred:", error);
      throw error;
    }
  }