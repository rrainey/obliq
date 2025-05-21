// components/editor/CanvasDebug.tsx
'use client';

import React from 'react';

interface CanvasDebugProps {
  onNodeSelect: (nodeId: string | null) => void;
  showProperties: boolean;
  onCloseProperties: () => void;
  isSimulationRunning?: boolean;
  simulationTime?: number;
  onSimulationStart?: () => void;
  onSimulationStop?: () => void;
  onSimulationReset?: () => void;
  onUpdateSimulationTime?: (time: number) => void;
}

export default function CanvasDebug(props: CanvasDebugProps) {
  // Simple component to debug Canvas mount issues
  return (
    <div className="flex flex-col h-full w-full bg-white p-4">
      <h2 className="text-lg font-bold text-red-600">Canvas Debug Mode</h2>
      <p className="mb-4">
        This is a simplified Canvas component for debugging. If you see this, the React component is mounting correctly.
      </p>
      
      <div className="p-4 border border-gray-300 rounded bg-gray-100">
        <h3 className="font-medium">Props received:</h3>
        <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(props, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-100">
        <h3 className="font-medium">Troubleshooting steps:</h3>
        <ol className="list-decimal pl-5 mt-2">
          <li>Check browser console for errors</li>
          <li>Verify ReactFlow is imported correctly</li>
          <li>Ensure all required CSS is loaded</li>
          <li>Check that the model store is initialized properly</li>
          <li>Examine any recent changes that might affect Canvas rendering</li>
        </ol>
      </div>
    </div>
  );
}