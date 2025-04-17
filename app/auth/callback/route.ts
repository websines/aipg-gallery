import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract the code, hash fragment, and next path from the URL
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  const supabase = await createSupabaseServerClient();

  if (code) {
    // Regular OAuth code flow
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  } else {
    // If no code is present, the hash fragment might contain tokens
    // In this case, we need to redirect to a client page that can process the hash
    // This is a common pattern with OAuth implicit grant
    return NextResponse.redirect(new URL(`/auth/handle-hash-redirect?next=${encodeURIComponent(next)}`, requestUrl.origin));
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
} 