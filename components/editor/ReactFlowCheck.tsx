// components/editor/ReactFlowCheck.tsx
'use client';

import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

// Simple component to test if ReactFlow renders correctly
export default function ReactFlowCheck() {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      data: { label: 'Test Node' },
      position: { x: 250, y: 150 }
    }
  ]);
  
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      // Any initialization can go here
      console.log('ReactFlow test component mounted');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Error in ReactFlow test:', err);
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">ReactFlow Error:</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}