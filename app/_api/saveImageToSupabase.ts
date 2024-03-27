import { supabase } from "@/lib/supabase";

export async function saveMetadata(metadata:any, userId:any) {
    const { data, error } = await supabase
      .from('image_metadata')
      .insert([
        { 
          positive_prompt: metadata.positivePrompt, 
          negative_prompt: metadata.negativePrompt,
          sampler: metadata.sampler,
          model: metadata.model,
          guidance: metadata.guidance,
          public_view: metadata.publicView,  
          user_id: userId  
        }
      ]).select();
  
    if (error) {
      console.error("Error saving metadata:", error);
      return null
  }
  return data[0].id
}

export async function uploadImage(file: any, metadataId: any) {
  const fileName = `${metadataId}_${Date.now()}.jpg`; 
  const { data, error } = await supabase.storage
    .from('generated_images')
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  } else {
    const {data} = supabase.storage.from('generated_images').getPublicUrl(fileName);
    return data?.publicUrl;
  }
}

export async function saveImageData(image: any, metadataId: any) {
  const { data, error } = await supabase
    .from('image_data')
    .insert([
      {
        base64_string: image.base64String,
        seed: image.seed,
        metadata_id: metadataId,
      }
    ]).select()

    if(error){
      return console.error(error.message)
    }
  return data[0]
}