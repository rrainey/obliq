// lib/hooks/useModelStateManager.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useModelStore } from '@/lib/store/modelStore';
import { ModelData } from '@/lib/supabase/supabaseClient';

interface ModelStateManagerReturn {
  // State
  showUnsavedDialog: boolean;
  pendingAction: (() => void) | null;
  isProcessingAction: boolean;
  
  // Actions
  handleModelSwitch: (newModelData: ModelData, callback?: () => void) => void;
  handleNewModel: (callback?: () => void) => void;
  confirmSaveAndProceed: () => Promise<void>;
  confirmDiscardAndProceed: () => void;
  cancelAction: () => void;
  
  // Navigation protection
  beforeUnloadHandler: (event: BeforeUnloadEvent) => string | undefined;
}

export function useModelStateManager(): ModelStateManagerReturn {
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  const { 
    hasUnsavedChanges, 
    model,
    loadModel,
    saveModel,
    setModel,
    clearUnsavedChanges
  } = useModelStore();

  // Check for unsaved changes before performing an action
  const checkUnsavedChanges = useCallback((action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedDialog(true);
    } else {
      action();
    }
  }, [hasUnsavedChanges]);

  // Handle switching to a different model
  const handleModelSwitch = useCallback((newModelData: ModelData, callback?: () => void) => {
    const switchAction = async () => {
      try {
        setIsProcessingAction(true);
        const success = await loadModel(newModelData);
        if (success && callback) {
          callback();
        }
      } catch (error) {
        console.error('Error switching models:', error);
      } finally {
        setIsProcessingAction(false);
      }
    };

    checkUnsavedChanges(switchAction);
  }, [checkUnsavedChanges, loadModel]);

  // Handle creating a new model
  const handleNewModel = useCallback((callback?: () => void) => {
    const newModelAction = () => {
      try {
        setIsProcessingAction(true);
        
        // Create a new default model
        const newModel = {
          id: `model-${Date.now()}`,
          name: 'New Model',
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sheets: [
            {
              id: 'main-sheet',
              name: 'Main',
              blocks: [],
              connections: [],
            },
          ],
        };
        
        setModel(newModel);
        
        if (callback) {
          callback();
        }
      } catch (error) {
        console.error('Error creating new model:', error);
      } finally {
        setIsProcessingAction(false);
      }
    };

    checkUnsavedChanges(newModelAction);
  }, [checkUnsavedChanges, setModel]);

  // Save current model and proceed with pending action
  const confirmSaveAndProceed = useCallback(async () => {
    if (!pendingAction) return;

    try {
      setIsProcessingAction(true);
      
      // Save the current model
      const result = await saveModel(model.name, model.description);
      
      if (result.success) {
        // Execute the pending action
        pendingAction();
        setPendingAction(null);
        setShowUnsavedDialog(false);
      } else {
        console.error('Failed to save model:', result.error);
        // Don't proceed if save failed
      }
    } catch (error) {
      console.error('Error saving model:', error);
    } finally {
      setIsProcessingAction(false);
    }
  }, [pendingAction, saveModel, model.name, model.description]);

  // Discard changes and proceed with pending action
  const confirmDiscardAndProceed = useCallback(() => {
    if (!pendingAction) return;

    try {
      setIsProcessingAction(true);
      
      // Clear unsaved changes flag
      clearUnsavedChanges();
      
      // Execute the pending action
      pendingAction();
      setPendingAction(null);
      setShowUnsavedDialog(false);
    } catch (error) {
      console.error('Error discarding changes:', error);
    } finally {
      setIsProcessingAction(false);
    }
  }, [pendingAction, clearUnsavedChanges]);

  // Cancel the action and keep current state
  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setShowUnsavedDialog(false);
  }, []);

  // Browser beforeunload handler to warn about unsaved changes
  const beforeUnloadHandler = useCallback((event: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      const message = 'You have unsaved changes. Are you sure you want to leave?';
      event.returnValue = message;
      return message;
    }
  }, [hasUnsavedChanges]);

  // Set up beforeunload listener
  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
    
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, [beforeUnloadHandler]);

  return {
    // State
    showUnsavedDialog,
    pendingAction,
    isProcessingAction,
    
    // Actions
    handleModelSwitch,
    handleNewModel,
    confirmSaveAndProceed,
    confirmDiscardAndProceed,
    cancelAction,
    
    // Navigation protection
    beforeUnloadHandler,
  };
}