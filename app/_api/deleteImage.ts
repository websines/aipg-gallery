import { supabase } from "@/lib/supabase";


export async function deleteUserImages(itemID: string){
    try{

        await supabase.from('image_data').delete().eq('metadata_id', itemID);

        const {error} = await supabase.from('image_metadata').delete().eq('id', itemID)

        if (error) {
            return {
              statusCode: 400,
              message: 'Error deleting image: ' + error.message,
            }; 
        }
          return {
            statusCode: 200,
            message: 'Image deleted successfully',
          }; 

    }catch(err){
        console.log(err)
    }
}