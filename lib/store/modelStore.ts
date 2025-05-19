import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Model, Sheet, Block, Connection, createEmptyModel, createId } from '../models/modelSchema';

interface ModelState {
  model: Model;
  currentSheetId: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setModel: (model: Model) => void;
  getCurrentSheet: () => Sheet;
  setCurrentSheet: (sheetId: string) => void;
  addBlock: (block: Block) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (connectionId: string) => void;
  createNewModel: (name?: string) => void;
}

// Initial model
const initialModel = createEmptyModel('New Model');

export const useModelStore = create<ModelState>()(
  devtools(
    (set, get) => ({
      model: initialModel,
      currentSheetId: initialModel.mainSheetId,
      isLoading: false,
      error: null,

      setModel: (model) => set({ model }),

      getCurrentSheet: () => {
        const { model, currentSheetId } = get();
        const sheet = model.sheets.find(s => s.id === currentSheetId);
        if (!sheet) {
          throw new Error(`Sheet with id ${currentSheetId} not found`);
        }
        return sheet;
      },

      setCurrentSheet: (sheetId) => {
        const { model } = get();
        if (!model.sheets.some(s => s.id === sheetId)) {
          throw new Error(`Sheet with id ${sheetId} not found`);
        }
        set({ currentSheetId: sheetId });
      },

      addBlock: (block) => {
        set(state => {
          const newSheets = state.model.sheets.map(sheet => {
            if (sheet.id === state.currentSheetId) {
              return {
                ...sheet,
                blocks: [...sheet.blocks, block]
              };
            }
            return sheet;
          });

          return {
            model: {
              ...state.model,
              sheets: newSheets,
              updatedAt: new Date().toISOString()
            }
          };
        });
      },

      updateBlock: (blockId, updates) => {
        set(state => {
          const newSheets = state.model.sheets.map(sheet => {
            if (sheet.id === state.currentSheetId) {
              return {
                ...sheet,
                blocks: sheet.blocks.map(block => 
                  block.id === blockId 
                    ? { ...block, ...updates, data: { ...block.data, ...updates.data } } 
                    : block
                )
              };
            }
            return sheet;
          });

          return {
            model: {
              ...state.model,
              sheets: newSheets,
              updatedAt: new Date().toISOString()
            }
          };
        });
      },

      removeBlock: (blockId) => {
        set(state => {
          const newSheets = state.model.sheets.map(sheet => {
            if (sheet.id === state.currentSheetId) {
              return {
                ...sheet,
                blocks: sheet.blocks.filter(block => block.id !== blockId),
                // Also remove any connections to/from this block
                connections: sheet.connections.filter(
                  conn => conn.sourceNodeId !== blockId && conn.targetNodeId !== blockId
                )
              };
            }
            return sheet;
          });

          return {
            model: {
              ...state.model,
              sheets: newSheets,
              updatedAt: new Date().toISOString()
            }
          };
        });
      },

      addConnection: (connection) => {
        set(state => {
          const newSheets = state.model.sheets.map(sheet => {
            if (sheet.id === state.currentSheetId) {
              return {
                ...sheet,
                connections: [...sheet.connections, connection]
              };
            }
            return sheet;
          });

          return {
            model: {
              ...state.model,
              sheets: newSheets,
              updatedAt: new Date().toISOString()
            }
          };
        });
      },

      removeConnection: (connectionId) => {
        set(state => {
          const newSheets = state.model.sheets.map(sheet => {
            if (sheet.id === state.currentSheetId) {
              return {
                ...sheet,
                connections: sheet.connections.filter(conn => conn.id !== connectionId)
              };
            }
            return sheet;
          });

          return {
            model: {
              ...state.model,
              sheets: newSheets,
              updatedAt: new Date().toISOString()
            }
          };
        });
      },

      createNewModel: (name = 'New Model') => {
        const newModel = createEmptyModel(name);
        set({ 
          model: newModel, 
          currentSheetId: newModel.mainSheetId,
          error: null 
        });
      }
    }),
    { name: 'model-store' }
  )
);