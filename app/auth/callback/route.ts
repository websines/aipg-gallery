import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract code from URL query parameters
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    console.log('Auth callback received', {
      path: requestUrl.pathname,
      code: code ? 'Present' : 'Not present',
      cookies: request.cookies.getAll().map(c => c.name)
    });

    // If no code found in the URL, try to handle hash fragment case
    if (!code) {
      // Redirect to client-side handler for hash fragments
      return NextResponse.redirect(new URL(`/auth/handle-hash-redirect?next=${encodeURIComponent(next)}`, requestUrl.origin));
    }

    try {
      // Create server-side Supabase client
      const supabase = await createSupabaseServerClient();
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return handleAuthError(error, requestUrl);
      }

      // Successful - redirect to the target URL
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error('Supabase client error:', error);
      return handleAuthError(error, requestUrl);
    }
  } catch (error) {
    console.error('General callback error:', error);
    return handleAuthError(error, new URL(request.url));
  }
}

// Helper function to handle auth errors and create appropriate responses
function handleAuthError(error: any, requestUrl: URL) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // For flow state errors, we might need special handling
  if (errorMessage.includes('flow state')) {
    console.warn('Flow state error - possible cookie issues or PKCE problem');
    
    // Redirect to an error page with details
    return NextResponse.redirect(
      new URL(`/auth-error?message=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }
  
  // Generic error handling - return JSON with error details
  return NextResponse.json({
    error: "Authentication error",
    message: errorMessage,
    stack: errorStack
  }, { status: 400 });
} 