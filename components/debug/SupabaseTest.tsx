// components/debug/SupabaseTest.tsx - LLM-generated code
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSave = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setTestResult({ error: 'No authenticated user', authError });
        return;
      }

      // Test data similar to what your app would send
      const testModel = {
        user_id: user.id,  // THIS WAS MISSING!
        name: 'Test Model',
        description: 'Debug test model',
        data: {
          id: 'test-model-id',
          name: 'Test Model',
          description: 'Debug test model',
          sheets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      console.log('Attempting to save with user_id:', user.id);
      console.log('Model data:', testModel);

      // Try to insert directly
      const { data, error } = await supabase
        .from('models')
        .insert([testModel])
        .select('id')
        .single();

      setTestResult({
        success: !error,
        data,
        error: error?.message,
        user: { id: user.id, email: user.email },
        sentData: testModel
      });

    } catch (err: any) {
      setTestResult({ 
        error: 'Unexpected error: ' + err.message,
        stack: err.stack 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-bold mb-2">Supabase Save Test</h3>
      <button 
        onClick={testSave}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Save to Supabase'}
      </button>
      
      {testResult && (
        <div className="mt-4">
          <h4 className="font-semibold">Test Result:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}