'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Unknown authentication error';
  const [cookiesPresent, setCookiesPresent] = useState<string[]>([]);
  
  useEffect(() => {
    // Get all cookies for debugging purposes
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    setCookiesPresent(cookies);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="max-w-2xl w-full bg-zinc-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Error Details</h2>
          <p className="text-zinc-300 p-3 bg-zinc-700 rounded">{errorMessage}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Possible Causes</h2>
          <ul className="list-disc pl-6 text-zinc-300 space-y-2">
            <li>Cookies are blocked or not being properly passed between client and server</li>
            <li>The HTTP/HTTPS setup with Cloudflare and/or Nginx is preventing proper authentication flow</li>
            <li>Supabase configuration issues with redirects or browser settings</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Debug Information</h2>
          <div className="bg-zinc-700 p-3 rounded">
            <h3 className="font-medium text-zinc-200 mb-1">Browser Cookies:</h3>
            {cookiesPresent.length > 0 ? (
              <ul className="text-xs text-zinc-400 space-y-1 pl-4">
                {cookiesPresent.map((cookie, index) => (
                  <li key={index}>{cookie}</li>
                ))}
              </ul>
            ) : (
              <p className="text-red-400 text-sm">No cookies found!</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition"
          >
            Return Home
          </Link>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
} 