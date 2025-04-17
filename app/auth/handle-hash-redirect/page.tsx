"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function HandleHashRedirect() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // remove the # character
    );

    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const expiresIn = hashParams.get("expires_in");
    const tokenType = hashParams.get("token_type");

    if (!accessToken) {
      setError("No access token found in URL");
      return;
    }

    const handleSession = async () => {
      try {
        const supabase = createSupabaseClient();

        // Create a session object from the hash parameters
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });
        
        if (error) {
          throw error;
        }

        // Redirect to the specified next URL
        router.push(next);
      } catch (err: any) {
        console.error("Error setting session:", err);
        setError(err.message || "Failed to authenticate");
      }
    };

    handleSession();
  }, [next, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="p-8 rounded-lg bg-zinc-800 shadow-lg text-white max-w-md w-full">
        {error ? (
          <div className="text-red-400">
            <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="h-8 w-8 rounded-full border-2 border-r-transparent border-white animate-spin mx-auto"></div>
            </div>
            <p>Completing authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
} 