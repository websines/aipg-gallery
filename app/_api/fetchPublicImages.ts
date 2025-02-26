import { supabase } from "@/lib/supabase";

export async function fetchPublicImages(pageParam: number, value: string) {
    try {
        // First, get the metadata IDs with pagination
        let metadataQuery = supabase
            .from("image_metadata")
            .select("id, positive_prompt, negative_prompt, model, sampler, guidance, created_at, public_view")
            .eq('public_view', true)
            .order('created_at', { ascending: false })
            .limit(10)
            .range((pageParam - 1) * 10, pageParam * 10 - 1);

        if (value) {
            metadataQuery = metadataQuery.textSearch("positive_prompt", `${value}`);
        }

        const { data: metadataData, error: metadataError } = await metadataQuery;

        if (metadataError) {
            console.error("Error fetching metadata:", metadataError);
            return [];
        }

        if (!metadataData || metadataData.length === 0) {
            return [];
        }

        // Get all metadata IDs
        const metadataIds = metadataData.map(item => item.id);

        // Now get all image_data for these metadata IDs
        const { data: imageData, error: imageError } = await supabase
            .from("image_data")
            .select("*")
            .in('metadata_id', metadataIds);

        if (imageError) {
            console.error("Error fetching image data:", imageError);
            return [];
        }

        // Combine the data
        const combinedData = metadataData.map(metadata => {
            const images = imageData.filter(img => img.metadata_id === metadata.id);
            return {
                ...metadata,
                image_data: images
            };
        });

        // Log the data for debugging
        console.log("Fetched public images:", combinedData.length, "with total images:", imageData.length);
        
        return combinedData;
    } catch(err) {
        console.log(err);
        return []; // Return empty array on exception
    }
}