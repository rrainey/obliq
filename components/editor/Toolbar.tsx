// components/editor/Toolbar.tsx - LLM-generated code
'use client';

import { useState } from 'react';
import { useModelStore } from '@/lib/store/modelStore';
import SaveModelDialog from '@/components/dialogs/SaveModelDialog';
import LoadModelDialog from '@/components/dialogs/LoadModelDialog';
import { ModelData } from '@/lib/supabase/supabaseClient';

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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [userModels, setUserModels] = useState<ModelData[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const { 
    model, 
    validateCurrentModel, 
    saveModel, 
    loadModel,
    loadUserModels,
    deleteModel,
    isSaving, 
    hasUnsavedChanges,
    lastSaveTime
  } = useModelStore();

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

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const handleLoadClick = async () => {
    setIsLoadingModels(true);
    try {
      const models = await loadUserModels();
      setUserModels(models);
      setShowLoadDialog(true);
    } catch (error) {
      setSaveMessage('Error loading models');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSaveModel = async (name: string, description: string) => {
    try {
      const result = await saveModel(name, description);
      
      if (result.success) {
        setSaveMessage('Model saved successfully!');
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } else {
        setSaveMessage(`Error: ${result.error}`);
        setTimeout(() => {
          setSaveMessage(null);
        }, 5000);
        throw new Error(result.error || 'Failed to save model');
      }
    } catch (error) {
      // Error handling is done in the try block above
      throw error; // Re-throw to let the dialog handle it
    }
  };

  const handleLoadModel = async (modelData: ModelData) => {
    try {
      const success = await loadModel(modelData);
      
      if (success) {
        setSaveMessage('Model loaded successfully!');
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } else {
        throw new Error('Failed to load model');
      }
    } catch (error) {
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Failed to load model'}`);
      setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
      throw error; // Re-throw to let the dialog handle it
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      const success = await deleteModel(modelId);
      
      if (success) {
        // Remove from local list
        setUserModels(prev => prev.filter(m => m.id !== modelId));
        setSaveMessage('Model deleted successfully!');
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } else {
        throw new Error('Failed to delete model');
      }
    } catch (error) {
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Failed to delete model'}`);
      setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
      throw error; // Re-throw to let the dialog handle it
    }
  };

  // Format simulation time to show 2 decimal places
  const formattedTime = simulationTime.toFixed(2);

  // Format last save time for display
  const formatLastSaveTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    
    const saveTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - saveTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) {
      return 'Just saved';
    } else if (diffMinutes < 60) {
      return `Saved ${diffMinutes}m ago`;
    } else {
      return `Saved at ${saveTime.toLocaleTimeString()}`;
    }
  };

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-300 p-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`px-3 py-1 rounded text-sm ${
              isSaving 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : hasUnsavedChanges
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save*' : 'Save'}
          </button>

          <button 
            onClick={handleLoadClick}
            disabled={isLoadingModels}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {isLoadingModels ? 'Loading...' : 'Load'}
          </button>

          {/* Save status indicator */}
          {lastSaveTime && (
            <span className="text-xs text-gray-500">
              {formatLastSaveTime(lastSaveTime)}
            </span>
          )}

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

          {saveMessage && (
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              saveMessage.includes('successfully') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {saveMessage}
            </span>
          )}
        </div>

        {showJson && (
          <div className="mt-2 p-2 bg-gray-800 text-white rounded overflow-auto text-xs" style={{ maxHeight: '200px' }}>
            <pre>{JSON.stringify(model, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Save Model Dialog */}
      <SaveModelDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveModel}
        initialName={model.name}
        initialDescription={model.description}
        isLoading={isSaving}
      />

      {/* Load Model Dialog */}
      <LoadModelDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        onLoad={handleLoadModel}
        onDelete={handleDeleteModel}
        isLoading={isLoadingModels}
        models={userModels}
      />
    </>
  );
}