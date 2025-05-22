// components/debug/AuthDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthDebug() {
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      setAuthData({
        session: session,
        sessionError: sessionError,
        user: user,
        userError: userError,
        timestamp: new Date().toISOString()
      });
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authData) return <div>Loading auth debug...</div>;

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2 text-white">Auth Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Session:</strong> {authData.session ? '✓ Valid' : '✗ None'}
        </div>
        <div>
          <strong>User ID:</strong> {authData.user?.id || 'None'}
        </div>
        <div>
          <strong>User Email:</strong> {authData.user?.email || 'None'}
        </div>
        <div>
          <strong>Session Error:</strong> {authData.sessionError?.message || 'None'}
        </div>
        <div>
          <strong>User Error:</strong> {authData.userError?.message || 'None'}
        </div>
        <div>
          <strong>JWT:</strong> {authData.session?.access_token ? '✓ Present' : '✗ Missing'}
        </div>
        <div>
          <strong>Updated:</strong> {authData.timestamp}
        </div>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer">Raw Data</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-40">
          {JSON.stringify(authData, null, 2)}
        </pre>
      </details>
    </div>
  );
}