import { supabase } from "@/lib/supabase";
import { base64toBlob } from "@/utils/imageUtils";
import { v4 as uuidv4 } from 'uuid';

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

  const response = await fetch(file)
  const blobData = await response.blob()

  const fileName = `${metadataId}_${uuidv4()}.jpg`; 
  const { error } = await supabase.storage
    .from('generated_images')
    .upload(fileName, blobData, { contentType: 'image/jpeg' });
  if (error) {
    console.error("Error uploading image:", error);
    return null;
  } else {
    const {data} = supabase.storage.from('generated_images').getPublicUrl(fileName);
    console.log(data.publicUrl)
    return data?.publicUrl;
    
  }
}

export async function saveImageData(image: any, metadataId: any) {
  const imageBlob = await base64toBlob(image.base64String);
  console.log(imageBlob) 
   const imageUrl = await uploadImage(imageBlob, metadataId);
  const { data, error } = await supabase
    .from('image_data')
    .insert([
      {
        image_url: imageUrl, //this is where the url should be saved.
        seed: image.seed,
        metadata_id: metadataId,
      }
    ]).select()

    if(error){
      return console.error(error.message)
    }
  return data[0]
}