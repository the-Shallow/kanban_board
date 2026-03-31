import { supabase } from "./supabase";

export async function guestSession() {
    const {data: {session},error: sessionError} = await supabase.auth.getSession()
    if (sessionError){
        throw sessionError
    }

    if (session){
        return session
    }

    const {data, error} = await supabase.auth.signInAnonymously()

    if(error){
        throw error
    }

    return data.session
}

export async function getAccessToken(): Promise<string> {
    const session = await guestSession()

    if(!session?.access_token){
        throw new Error("No access token found")
    }

    return session.access_token
}