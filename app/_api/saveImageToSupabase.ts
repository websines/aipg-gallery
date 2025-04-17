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
    // Generate a unique filename
    const fileName = `${uuidv4()}.png`;
    const filePath = `${metadataId}/${fileName}`;
    
    console.log(`Uploading image to storage path: ${filePath}`);
    
    // Check if Blob is valid
    if (!file || file.size === 0) {
      console.error("Invalid blob provided for upload");
      return { success: false, error: "Invalid blob provided for upload" };
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error("Error uploading image to storage:", error);
      
      // Check if bucket exists
      if (error.message.includes("bucket") || error.message.includes("not found")) {
        return { 
          success: false, 
          error: "Storage bucket not found or not accessible. Please check your storage configuration." 
        };
      }
      
      // Check for permission issues
      if (error.message.includes("permission") || error.message.includes("not authorized")) {
        return { 
          success: false, 
          error: "Storage permission denied. Please check your storage bucket RLS policies." 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    if (!data) {
      console.error("No data returned from storage upload");
      return { success: false, error: "Upload failed - no data returned" };
    }
    
    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error("Failed to get public URL for uploaded image");
      return { success: false, error: "Failed to get public URL" };
    }
    
    console.log("Image uploaded successfully with URL:", publicUrlData.publicUrl);
    return { success: true, id: publicUrlData.publicUrl };
  } catch (error) {
    console.error("Exception in uploadImage:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function saveImageData(imageData: ImageDataInput): Promise<SaveResult> {
  try {
    console.log("saveImageData called with:", { 
      metadata_id: imageData.metadata_id,
      seed: imageData.seed,
      image_url_type: typeof imageData.image_url,
      image_url_length: typeof imageData.image_url === 'string' ? imageData.image_url.length : 0,
      is_base64: typeof imageData.image_url === 'string' && 
                (imageData.image_url.startsWith('data:image') || 
                 imageData.image_url.startsWith('data:application'))
    });
    
    if (!imageData.metadata_id) {
      console.error("No metadata ID provided to saveImageData");
      return { success: false, error: "No metadata ID provided" };
    }
    
    if (!imageData.image_url) {
      console.error("No image URL provided to saveImageData");
      return { success: false, error: "No image URL provided" };
    }
    
    let imageUrl = imageData.image_url;
    
    // Check if the image is a base64 string - we don't upload these anymore
    if (imageUrl.startsWith('data:image') || imageUrl.startsWith('data:application')) {
      console.log("Base64 image detected - not uploading to storage");
      // Since we're not uploading to Supabase anymore, just use the base64 image directly
      // or return an error if you don't want to store base64 data in the database
      console.warn("Saving base64 string directly to database. Consider using Cloudflare URL instead.");
      // Optionally truncate very long base64 strings to avoid database issues
    } else if (imageUrl.includes('cloudflarestorage.com')) {
      // Convert the temporary Cloudflare R2 URL to a permanent images.aipg.art URL
      console.log("Converting Cloudflare R2 URL to permanent URL");
      
      try {
        // Extract the filename from the R2 URL
        // Example: https://a9b7416008b496f49b0f021099cc4128.r2.cloudflarestorage.com/aipgcoregen/d95670ee-aa17-4690-9d70-ae3ad1197e0b.webp?X-Amz...
        // We want: d95670ee-aa17-4690-9d70-ae3ad1197e0b.webp
        
        // Parse the URL
        const url = new URL(imageUrl);
        // Get the pathname
        const pathname = url.pathname;
        // Split by '/' and get the last part (the filename)
        const pathParts = pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        
        if (filename) {
          // Construct the permanent URL
          imageUrl = `https://images.aipg.art/${filename}`;
          console.log("Converted to permanent URL:", imageUrl);
        } else {
          console.error("Failed to extract filename from R2 URL:", imageUrl);
        }
      } catch (err) {
        console.error("Error converting R2 URL to permanent URL:", err);
        // Continue with the original URL if conversion fails
      }
    } else if (imageUrl.startsWith('http')) {
      // This is some other external URL
      console.log("Using external URL directly:", imageUrl);
    } else {
      // Not a valid URL format
      console.error("Invalid image URL format:", imageUrl.substring(0, 50) + "...");
      return { success: false, error: "Invalid image URL format" };
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