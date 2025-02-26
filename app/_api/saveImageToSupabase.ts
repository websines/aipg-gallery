import { supabase } from "@/lib/supabase";
import { base64toBlob } from "@/utils/imageUtils";
import { v4 as uuidv4 } from 'uuid';

interface MetadataInput {
  positive_prompt: string;
  negative_prompt: string;
  sampler: string;
  model: string;
  guidance: number;
  public_view: boolean;
  user_id: string;
}

interface ImageDataInput {
  image_url: string;
  seed: string;
  metadata_id: string;
}

interface SaveResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function saveMetadata(metadata: MetadataInput): Promise<SaveResult> {
  try {
    console.log("saveMetadata called with:", { metadata });
    
    if (!metadata.user_id) {
      console.error("No userId provided to saveMetadata");
      return { success: false, error: "No user ID provided" };
    }
    
    if (!metadata.positive_prompt) {
      console.error("Invalid metadata provided to saveMetadata:", metadata);
      return { success: false, error: "No positive prompt provided" };
    }
    
    console.log("Inserting metadata into database:", metadata);
    
    const { data, error } = await supabase
      .from('image_metadata')
      .insert([metadata])
      .select();
  
    if (error) {
      console.error("Error saving metadata:", error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned from metadata insert");
      return { success: false, error: "No data returned from insert" };
    }
    
    console.log("Metadata saved successfully with ID:", data[0].id);
    return { success: true, id: data[0].id };
  } catch (error) {
    console.error("Exception in saveMetadata:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function uploadImage(file: Blob, metadataId: string): Promise<SaveResult> {
  try {
    const fileName = `${uuidv4()}.png`;
    const filePath = `${metadataId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        contentType: 'image/png',
      });
      
    if (error) {
      console.error("Error uploading image to storage:", error);
      return { success: false, error: error.message };
    }
    
    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    return { success: true, id: publicUrlData.publicUrl };
  } catch (error) {
    console.error("Exception in uploadImage:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function saveImageData(imageData: ImageDataInput): Promise<SaveResult> {
  try {
    console.log("saveImageData called with:", { imageData });
    
    if (!imageData.metadata_id) {
      console.error("No metadata ID provided to saveImageData");
      return { success: false, error: "No metadata ID provided" };
    }
    
    if (!imageData.image_url) {
      console.error("No image URL provided to saveImageData");
      return { success: false, error: "No image URL provided" };
    }
    
    let imageUrl = imageData.image_url;
    
    // Check if the image is a base64 string
    if (imageUrl.startsWith('data:image') || imageUrl.startsWith('data:application')) {
      console.log("Converting base64 to blob for upload");
      try {
        // Extract the base64 part if it's a data URL
        const base64Data = imageUrl.split(',')[1] || imageUrl;
        const blob = await base64toBlob(base64Data, 'image/png');
        
        // Upload the blob to Supabase storage
        const uploadResult = await uploadImage(blob, imageData.metadata_id);
        
        if (!uploadResult.success) {
          return uploadResult;
        }
        
        // Update the imageUrl to the new storage URL
        imageUrl = uploadResult.id || '';
      } catch (error) {
        console.error("Error processing base64 image:", error);
        return { success: false, error: "Failed to process base64 image" };
      }
    } else if (imageUrl.includes('cloudflarestorage.com')) {
      // This is already a valid Cloudflare R2 URL, use it directly
      console.log("Using Cloudflare R2 URL directly:", imageUrl);
      // No need to upload to Supabase storage in this case
    }
    
    // Save the image data to the database
    const { data, error } = await supabase
      .from('image_data')
      .insert([
        {
          metadata_id: imageData.metadata_id,
          image_url: imageUrl,
          seed: imageData.seed || '',
        }
      ])
      .select();
      
    if (error) {
      console.error("Error saving image data to database:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Image data saved successfully:", data);
    return { success: true, id: data?.[0]?.id };
  } catch (error) {
    console.error("Exception in saveImageData:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}