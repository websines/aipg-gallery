import { supabase } from "@/lib/supabase";
import { defaultApiKey } from "@/constants";

export async function fetchApikey(userId: string | undefined) {
    try {
        if (!userId) {
            return defaultApiKey;
        }

        const { data, error } = await supabase
            .from("user_api_keys")
            .select("api_key")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching API key:", error);
            return defaultApiKey;
        }

        return data?.api_key || defaultApiKey;
    } catch (err) {
        console.error("Exception fetching API key:", err);
        return defaultApiKey;
    }
}