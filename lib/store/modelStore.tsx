// lib/store/modelStore.ts - LLM-generated code
'use client';

import { create } from 'zustand';
import { createContext, useContext, ReactNode } from 'react';
import { Block, Connection, Sheet, Model } from '@/lib/models/modelSchema';
import { saveModelToSupabase, SaveModelResult, loadUserModels, loadModelById, deleteModelById } from '@/lib/services/modelService';
import { ModelData } from '@/lib/supabase/supabaseClient';
import { fixModelIntegrity, normalizeModel, validateModel } from '@/lib/services/modelValidationService';

// Define model store state
interface ModelState {
  model: Model;
  currentSheetId: string;
  
  // Save state
  isSaving: boolean;
  lastSaveTime: string | null;
  hasUnsavedChanges: boolean;
  
  // Sheet operations
  addSheet: (sheet: Sheet) => void;
  updateSheet: (sheetId: string, updates: Partial<Sheet>) => void;
  removeSheet: (sheetId: string) => void;
  setCurrentSheet: (sheetId: string) => void;
  
  // Block operations
  addBlock: (block: Block) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  
  // Connection operations
  addConnection: (connection: Connection) => void;
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  removeConnection: (connectionId: string) => void;
  
  // Utility functions
  getCurrentSheet: () => Sheet;
  validateCurrentModel: () => boolean;
  
  // Model operations
  setModel: (model: Model) => void;
  saveModel: (name: string, description: string) => Promise<SaveModelResult>;
  loadModel: (modelData: ModelData) => Promise<boolean>;
  loadUserModels: () => Promise<ModelData[]>;
  deleteModel: (modelId: string) => Promise<boolean>;
  
  // Save state management
  markUnsavedChanges: () => void;
  clearUnsavedChanges: () => void;
}

// Create the Zustand store
export const useModelStore = create<ModelState>((set, get) => {
  // Create a default model with an empty sheet
  const defaultModel: Model = {
    id: 'default-model',
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

  return {
    model: defaultModel,
    currentSheetId: 'main-sheet',
    isSaving: false,
    lastSaveTime: null,
    hasUnsavedChanges: false,

    // Sheet operations
    addSheet: (sheet) => set((state) => {
      const newState = {
        model: {
          ...state.model,
          sheets: [...state.model.sheets, sheet],
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
      return newState;
    }),

    updateSheet: (sheetId, updates) => set((state) => ({
      model: {
        ...state.model,
        sheets: state.model.sheets.map((sheet) =>
          sheet.id === sheetId ? { ...sheet, ...updates } : sheet
        ),
        updatedAt: new Date().toISOString(),
      },
      hasUnsavedChanges: true,
    })),

    removeSheet: (sheetId) => set((state) => ({
      model: {
        ...state.model,
        sheets: state.model.sheets.filter((sheet) => sheet.id !== sheetId),
        updatedAt: new Date().toISOString(),
      },
      // Reset current sheet if deleted
      currentSheetId:
        state.currentSheetId === sheetId
          ? state.model.sheets[0]?.id || 'main-sheet'
          : state.currentSheetId,
      hasUnsavedChanges: true,
    })),

    setCurrentSheet: (sheetId) => set({ currentSheetId: sheetId }),

    // Block operations
    addBlock: (block) => set((state) => {
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );

      if (!currentSheet) return state;

      return {
        model: {
          ...state.model,
          sheets: state.model.sheets.map((sheet) =>
            sheet.id === state.currentSheetId
              ? {
                  ...sheet,
                  blocks: [...sheet.blocks, block],
                }
              : sheet
          ),
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
    }),

    updateBlock: (blockId, updates) => set((state) => {
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );

      if (!currentSheet) return state;

      return {
        model: {
          ...state.model,
          sheets: state.model.sheets.map((sheet) =>
            sheet.id === state.currentSheetId
              ? {
                  ...sheet,
                  blocks: sheet.blocks.map((block) =>
                    block.id === blockId
                      ? { ...block, ...updates }
                      : block
                  ),
                }
              : sheet
          ),
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
    }),

    removeBlock: (blockId) => set((state) => {
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );

      if (!currentSheet) return state;

      // Also remove connections that use this block
      const newConnections = currentSheet.connections.filter(
        (conn) =>
          conn.sourceNodeId !== blockId && conn.targetNodeId !== blockId
      );

      return {
        model: {
          ...state.model,
          sheets: state.model.sheets.map((sheet) =>
            sheet.id === state.currentSheetId
              ? {
                  ...sheet,
                  blocks: sheet.blocks.filter(
                    (block) => block.id !== blockId
                  ),
                  connections: newConnections,
                }
              : sheet
          ),
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
    }),

    // Connection operations
    addConnection: (connection) => set((state) => {
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );

      if (!currentSheet) return state;

      return {
        model: {
          ...state.model,
          sheets: state.model.sheets.map((sheet) =>
            sheet.id === state.currentSheetId
              ? {
                  ...sheet,
                  connections: [...sheet.connections, connection],
                }
              : sheet
          ),
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
    }),

    updateConnection: (connectionId, updates) => set((state) => {
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );

      if (!currentSheet) return state;

      return {
        model: {
          ...state.model,
          sheets: state.model.sheets.map((sheet) =>
            sheet.id === state.currentSheetId
              ? {
                  ...sheet,
                  connections: sheet.connections.map((conn) =>
                    conn.id === connectionId
                      ? { ...conn, ...updates }
                      : conn
                  ),
                }
              : sheet
          ),
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
    }),

    removeConnection: (connectionId) => set((state) => {
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );

      if (!currentSheet) return state;

      return {
        model: {
          ...state.model,
          sheets: state.model.sheets.map((sheet) =>
            sheet.id === state.currentSheetId
              ? {
                  ...sheet,
                  connections: sheet.connections.filter(
                    (conn) => conn.id !== connectionId
                  ),
                }
              : sheet
          ),
          updatedAt: new Date().toISOString(),
        },
        hasUnsavedChanges: true,
      };
    }),

    // Utility functions
    getCurrentSheet: () => {
      const state = get();
      const currentSheet = state.model.sheets.find(
        (s) => s.id === state.currentSheetId
      );
      
      // Return current sheet or a default empty sheet
      return (
        currentSheet || {
          id: 'main-sheet',
          name: 'Main',
          blocks: [],
          connections: [],
        }
      );
    },

    validateCurrentModel: () => {
      const state = get();
      const validation = validateModel(state.model);
      
      if (validation.warnings.length > 0) {
        console.warn('Model validation warnings:', validation.warnings);
      }
      
      if (!validation.isValid) {
        console.error('Model validation errors:', validation.errors);
      }
      
      return validation.isValid;
    },

    // Model operations
    setModel: (model) => set({ 
      model,
      hasUnsavedChanges: false,
    }),

    saveModel: async (name: string, description: string) => {
      const state = get();
      
      // Set saving state
      set({ isSaving: true });
      
      try {
        const result = await saveModelToSupabase(state.model, name, description);
        
        if (result.success) {
          // Update model name and description if save was successful
          set((state) => ({
            model: {
              ...state.model,
              name,
              description,
            },
            isSaving: false,
            lastSaveTime: new Date().toISOString(),
            hasUnsavedChanges: false,
          }));
        } else {
          set({ isSaving: false });
        }
        
        return result;
      } catch (error) {
        set({ isSaving: false });
        return {
          success: false,
          error: 'Failed to save model'
        };
      }
    },

    loadModel: async (modelData: ModelData) => {
      try {
        // Convert the Supabase model data back to our internal Model format
        const loadedModel: Model = {
          id: modelData.data.id || modelData.id,
          name: modelData.name,
          description: modelData.description || '',
          createdAt: modelData.data.createdAt || modelData.created_at,
          updatedAt: modelData.data.updatedAt || modelData.updated_at,
          sheets: modelData.data.sheets || []
        };

        // Validate and fix the loaded model
        const { model: fixedModel, fixedIssues } = fixModelIntegrity(loadedModel);
        
        if (fixedIssues.length > 0) {
          console.warn('Fixed model integrity issues:', fixedIssues);
        }

        // Normalize the model for consistent state
        const normalizedModel = normalizeModel(fixedModel);

        // Validate the final model
        const validation = validateModel(normalizedModel);
        
        if (!validation.isValid) {
          console.error('Model validation failed:', validation.errors);
          // Still load the model but warn the user
        }

        if (validation.warnings.length > 0) {
          console.warn('Model validation warnings:', validation.warnings);
        }

        // Set the loaded model
        set({
          model: normalizedModel,
          hasUnsavedChanges: fixedIssues.length > 0, // Mark as changed if we fixed issues
          currentSheetId: normalizedModel.sheets[0]?.id || 'main-sheet'
        });

        return true;
      } catch (error) {
        console.error('Error loading model:', error);
        return false;
      }
    },

    loadUserModels: async () => {
      try {
        const result = await loadUserModels();
        
        if (result.success) {
          return result.models || [];
        } else {
          console.error('Failed to load user models:', result.error);
          return [];
        }
      } catch (error) {
        console.error('Error loading user models:', error);
        return [];
      }
    },

    deleteModel: async (modelId: string) => {
      try {
        const result = await deleteModelById(modelId);
        return result.success;
      } catch (error) {
        console.error('Error deleting model:', error);
        return false;
      }
    },

    // Save state management
    markUnsavedChanges: () => set({ hasUnsavedChanges: true }),
    clearUnsavedChanges: () => set({ hasUnsavedChanges: false }),
  };
});

// Create a simple React context for the ModelProvider
type ModelContextType = {
  store: ReturnType<typeof useModelStore>;
};

const ModelContext = createContext<ModelContextType | null>(null);

// Simple Provider component
export const ModelProvider = ({ children }: { children: ReactNode }) => {
  // We don't need useRef here since we're just accessing the global store
  const store = useModelStore();
  
  return (
    <ModelContext.Provider value={{ store }}>
      {children}
    </ModelContext.Provider>
  );
};

// Custom hook to use the model store through context
export const useModelStoreContext = () => {
  const context = useContext(ModelContext);
  
  if (!context) {
    throw new Error('useModelStoreContext must be used within a ModelProvider');
  }
  
  return context.store;
};