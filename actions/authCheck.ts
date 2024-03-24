import createSupabaseServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation";

export async function readUserSession(){
    const supabase = await createSupabaseServerClient()

    return supabase.auth.getSession()
}
