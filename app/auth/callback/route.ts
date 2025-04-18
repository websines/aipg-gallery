import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract the code, hash fragment, and next path from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    try {
      const supabase = await createSupabaseServerClient();
      
      if (code) {
        // Regular OAuth code flow
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          // Log the error and return a more helpful error response
          console.error("Supabase exchangeCodeForSession error:", error);
          return new NextResponse(
            JSON.stringify({ 
              error: "Authentication error", 
              message: error.message,
              hint: "Check Supabase configuration and valid redirects" 
            }), 
            { status: 400 }
          );
        }
      } else {
        // If no code is present, the hash fragment might contain tokens
        // In this case, we need to redirect to a client page that can process the hash
        return NextResponse.redirect(new URL(`/auth/handle-hash-redirect?next=${encodeURIComponent(next)}`, requestUrl.origin));
      }

      // URL to redirect to after sign in process completes
      return NextResponse.redirect(new URL(next, requestUrl.origin));
      
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError);
      return new NextResponse(
        JSON.stringify({ 
          error: "Supabase client error", 
          message: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
          stack: supabaseError instanceof Error ? supabaseError.stack : undefined
        }), 
        { status: 500 }
      );
    }
  } catch (generalError) {
    console.error("General callback route error:", generalError);
    return new NextResponse(
      JSON.stringify({ 
        error: "Server error", 
        message: generalError instanceof Error ? generalError.message : String(generalError),
        stack: generalError instanceof Error ? generalError.stack : undefined
      }), 
      { status: 500 }
    );
  }
} 