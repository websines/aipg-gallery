import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  // If no code found in the URL, handle hash fragment case
  if (!code) {
    return NextResponse.redirect(new URL(`/auth/handle-hash-redirect?next=${encodeURIComponent(next)}`, requestUrl.origin));
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    // Let the SSR library handle the cookie extraction and PKCE verification internally
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth error:', error);
      
      // Simple error redirect
      return NextResponse.redirect(
        new URL(`/auth-error?message=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }
    
    // Success - redirect to the intended destination with hardcoded origin
    return NextResponse.redirect(new URL(next, 'https://aipg.art'));
  } catch (error) {
    console.error('Auth callback unexpected error:', error);
    
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(
      new URL(`/auth-error?message=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }
} 