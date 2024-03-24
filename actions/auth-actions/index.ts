"use server"

import createSupabaseServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation";

export async function signUpWithEmailAndPassword(data: {
    email: string,
    password: string,
    confirm: string
}){

   const supabase = await createSupabaseServerClient()

   const response = await supabase.auth.signUp({email:data.email, password:data.password})

   return JSON.stringify(response)

}

export async function signInWithEmailAndPassword(data: {
    email: string,
    password: string,
}){
    
}


export async function readUserSession(){
    const supabase = await createSupabaseServerClient()

    return supabase.auth.getSession()
}


export async function SignOutUser() {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();

    redirect("/");
}