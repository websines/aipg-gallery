"use server"

import {createSupabaseServerClient} from "@/lib/supabase/server"
import { redirect } from "next/navigation";

export async function signUpWithEmailAndPassword(data: {
    email: string,
    password: string,
    confirm: string,
    // username: string
}){

   const supabase = await createSupabaseServerClient()

   const response = await supabase.auth.signUp({email:data.email, password:data.password})

   return JSON.stringify(response)

}

export async function signInWithEmailAndPassword(data: {
    email: string,
    password: string,
}){
    const supabase = await createSupabaseServerClient()

   const response = await supabase.auth.signInWithPassword({email:data.email, password:data.password})

   return JSON.stringify(response)
}


export async function SignOutUser() {
    console.log("running")
    const supabase = await createSupabaseServerClient();

    const response = await supabase.auth.signOut();

    const {error} = response

    if(error){
        return console.log(error)
    }

    redirect("/");
}