// lib/store/modelStore.ts - SIMPLIFIED VERSION
'use client';

import { create } from 'zustand';
import { createContext, useContext, ReactNode } from 'react';
import { Block, Connection, Sheet, Model } from '@/lib/models/modelSchema';

// Define model store state
interface ModelState {
  model: Model;
  currentSheetId: string;
  
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
  saveModel: () => Promise<boolean>;
  loadModel: (modelId: string) => Promise<boolean>;
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

    // Sheet operations
    addSheet: (sheet) => set((state) => ({
      model: {
        ...state.model,
        sheets: [...state.model.sheets, sheet],
        updatedAt: new Date().toISOString(),
      },
    })),

    updateSheet: (sheetId, updates) => set((state) => ({
      model: {
        ...state.model,
        sheets: state.model.sheets.map((sheet) =>
          sheet.id === sheetId ? { ...sheet, ...updates } : sheet
        ),
        updatedAt: new Date().toISOString(),
      },
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
      const currentSheet = state.getCurrentSheet();
      
      // Basic validation - check if all connections reference valid blocks
      const blockIds = new Set(currentSheet.blocks.map((block) => block.id));
      
      const validConnections = currentSheet.connections.every(
        (conn) =>
          blockIds.has(conn.sourceNodeId) && blockIds.has(conn.targetNodeId)
      );
      
      // For this implementation, we'll just check connection validity
      return validConnections;
    },

    // Model operations
    setModel: (model) => set({ model }),

    saveModel: async () => {
      console.log('Saving model...');
      // In a real implementation, this would save to Supabase
      // Currently just logs to console and returns success
      console.log('Model data:', get().model);
      
      return true;
    },

    loadModel: async (modelId) => {
      console.log(`Loading model ${modelId}...`);
      // In a real implementation, this would load from Supabase
      // For now, we just return true to indicate success
      
      return true;
    },
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