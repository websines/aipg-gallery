import { createSupabaseClient } from "@/lib/supabase/client";


export async function readUserSession(){
    const supabase = await createSupabaseClient()

    return supabase.auth.getSession()
}
