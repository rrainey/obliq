// components/editor/Toolbar.tsx
'use client';

import { useState } from 'react';
import { useModelStore } from '@/lib/store/modelStore';

interface ToolbarProps {
  selectedNodeId: string | null;
  onShowProperties: () => void;
  isSimulationRunning: boolean;
  simulationTime: number;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
  onStepSimulation: () => void;
  onSetTimeStep: (step: number) => void;
}

export default function Toolbar({
  selectedNodeId,
  onShowProperties,
  isSimulationRunning,
  simulationTime,
  onStartSimulation,
  onStopSimulation,
  onResetSimulation,
  onStepSimulation,
  onSetTimeStep
}: ToolbarProps) {
  const [showJson, setShowJson] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { model, validateCurrentModel } = useModelStore();

  const handleValidate = () => {
    const isValid = validateCurrentModel();
    if (isValid) {
      setValidationMessage('Model structure is valid!');
    } else {
      setValidationMessage('Model validation failed. Check connections and block configuration.');
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setValidationMessage(null);
    }, 3000);
  };

  // Format simulation time to show 2 decimal places
  const formattedTime = simulationTime.toFixed(2);

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-2">
      <div className="flex items-center space-x-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Save
        </button>

        {/* Simulation controls */}
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        {isSimulationRunning ? (
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            onClick={onStopSimulation}
          >
            Stop
          </button>
        ) : (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            onClick={onStartSimulation}
          >
            Run
          </button>
        )}
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
          onClick={onStepSimulation}
        >
          Step
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
          onClick={onResetSimulation}
        >
          Reset
        </button>
        
        {/* Simulation time display */}
        <div className="bg-gray-200 px-3 py-1 rounded text-sm flex items-center">
          <span className="text-gray-600 mr-2">Time:</span>
          <span className="font-mono">{formattedTime}s</span>
        </div>

        <div className="border-l border-gray-300 h-6 mx-2"></div>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm">
          Generate C Code
        </button>
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        <button
          className={`px-3 py-1 rounded text-sm ${
            selectedNodeId
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={onShowProperties}
          disabled={!selectedNodeId}
        >
          Properties
        </button>
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setShowJson(!showJson)}
        >
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </button>
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm ml-2"
          onClick={handleValidate}
        >
          Validate
        </button>
        
        {validationMessage && (
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            validationMessage.includes('valid') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {validationMessage}
          </span>
        )}
      </div>

      {showJson && (
        <div className="mt-2 p-2 bg-gray-800 text-white rounded overflow-auto text-xs" style={{ maxHeight: '200px' }}>
          <pre>{JSON.stringify(model, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}