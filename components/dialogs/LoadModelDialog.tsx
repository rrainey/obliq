// components/dialogs/LoadModelDialog.tsx - LLM-generated code
'use client';

import { useState, useEffect } from 'react';
import { ModelData } from '@/lib/supabase/supabaseClient';

interface LoadModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (model: ModelData) => Promise<void>;
  onDelete?: (modelId: string) => Promise<void>;
  isLoading?: boolean;
  models: ModelData[];
}

export default function LoadModelDialog({
  isOpen,
  onClose,
  onLoad,
  onDelete,
  isLoading = false,
  models
}: LoadModelDialogProps) {
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedModel(null);
      setError(null);
      setDeleteConfirm(null);
    }
  }, [isOpen]);

  const handleLoad = async () => {
    if (!selectedModel) {
      setError('Please select a model to load');
      return;
    }

    try {
      setError(null);
      await onLoad(selectedModel);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    }
  };

  const handleDelete = async (modelId: string) => {
    if (!onDelete) return;
    
    try {
      setError(null);
      await onDelete(modelId);
      setDeleteConfirm(null);
      // Clear selection if deleted model was selected
      if (selectedModel?.id === modelId) {
        setSelectedModel(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Load Model</h2>
        
        {models.length === 0 ? (
          <div className="flex-grow flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">No saved models found</p>
              <p className="text-sm">Create and save a model to see it here</p>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Select a model to load ({models.length} model{models.length !== 1 ? 's' : ''} available):
              </p>
              
              <div className="border rounded-md max-h-96 overflow-y-auto">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedModel?.id === model.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        {model.description && (
                          <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                        )}
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Created: {formatDate(model.created_at)}</span>
                          <span>Updated: {formatDate(model.updated_at)}</span>
                        </div>
                      </div>
                      
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(model.id);
                          }}
                          className="ml-3 text-red-500 hover:text-red-700 text-sm"
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedModel && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-900">Selected Model:</h4>
                <p className="text-blue-800">{selectedModel.name}</p>
                {selectedModel.description && (
                  <p className="text-sm text-blue-700 mt-1">{selectedModel.description}</p>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading || !selectedModel || models.length === 0}
          >
            {isLoading ? 'Loading...' : 'Load Model'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Model</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this model? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}