'use client';

import { useState } from 'react';
import { useModelStore } from '@/lib/store/modelStore';

export default function Toolbar() {
  const [showJson, setShowJson] = useState(false);
  const { model } = useModelStore();

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-2">
      <div className="flex items-center space-x-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Save
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
          Run
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
          Stop
        </button>
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm">
          Generate C Code
        </button>
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        <button 
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setShowJson(!showJson)}
        >
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </button>
      </div>

      {showJson && (
        <div className="mt-2 p-2 bg-gray-800 text-white rounded overflow-auto text-xs" style={{ maxHeight: '200px' }}>
          <pre>{JSON.stringify(model, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}