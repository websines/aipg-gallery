import { supabase } from "@/lib/supabase";

export async function fetchPublicImages(pageParam: number, value: string) {
    try {
        let query = supabase.from("image_metadata").select("*, image_data(id, image_url, seed)").eq('public_view', true).order('created_at', { ascending: false }).limit(10).range((pageParam - 1) * 10, pageParam * 10 - 1)

        if (value) {
            query = query.textSearch("positive_prompt", `${value}`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching data:", error);
            return []; // Return empty array on error
        } else {
            return data || []; // Return data or empty array if data is null/undefined
        }
    } catch(err) {
        console.log(err);
        return []; // Return empty array on exception
    }
}