// lib/models/modelSchema.ts - Updated with Source block and enhanced Subsystem
import { Node, Edge } from 'reactflow';

// Utility function to create unique IDs
export const createId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Base block data interface
export interface BlockData {
  label: string;
  description?: string;
}

// Block data types for specific blocks
export interface SumBlockData extends BlockData {
  inputCount: number;
  operationType?: 'sum' | 'difference';
  showInputLabels?: boolean;
}

export interface MultiplyBlockData extends BlockData {
  inputCount: number;
  operationType?: 'multiply' | 'divide';
  showInputLabels?: boolean;
}

// Updated InputPortBlockData (external input only)
export interface InputPortBlockData extends BlockData {
  name: string; // Required for input ports
  unit?: string;
  defaultValue?: number; // Default value when not connected externally
}

// New SourceBlockData (internal signal generation)
export interface SourceBlockData extends BlockData {
  value: number;
  name?: string;
  unit?: string;
  sourceType?: 'constant' | 'sine';
  // Sine wave parameters
  amplitude?: number;
  frequency?: number; // Hz
  phase?: number; // radians
  offset?: number;
}

export interface OutputPortBlockData extends BlockData {
  name?: string;
  unit?: string;
  value?: number | null;
  connected?: boolean;
  exportEnabled?: boolean;
  exportFormat?: 'none' | 'csv' | 'json';
  exportFilename?: string;
  history?: Array<{ time: number, value: number }>;
  historyMaxLength?: number;
}

export interface DisplayBlockData extends BlockData {
  value?: number | string | null;
  connected?: boolean;
  unit?: string;
  displayMode?: 'value' | 'gauge' | 'indicator';
  min?: number;
  max?: number;
  precision?: number;
  showUnit?: boolean;
  showSettings?: boolean;
}

export interface LoggerBlockData extends BlockData {
  logs: Array<{ time: number, value: number | string }>;
  connected?: boolean;
  maxEntries?: number;
  recording?: boolean;
  unit?: string;
  showSettings?: boolean;
}

export interface TransferFunctionBlockData extends BlockData {
  numerator: string;
  denominator: string;
  state?: number[];
  connected?: boolean;
  value?: number | null;
  showEquation?: boolean;
}

// Enhanced SubsystemBlockData with embedded sheet
export interface SubsystemBlockData extends BlockData {
  sheet?: Sheet; // Embedded sheet definition
  inputHandles?: Array<{ id: string; name: string; unit?: string }>; // Cached for performance
  outputHandles?: Array<{ id: string; name: string; unit?: string }>; // Cached for performance
}

// Block definition
export interface Block {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: BlockData | SumBlockData | MultiplyBlockData | InputPortBlockData | 
        SourceBlockData | OutputPortBlockData | DisplayBlockData | LoggerBlockData | 
        TransferFunctionBlockData | SubsystemBlockData;
}

// Connection definition
export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceHandleId: string;
  targetNodeId: string;
  targetHandleId: string;
}

// Sheet definition
export interface Sheet {
  id: string;
  name: string;
  blocks: Block[];
  connections: Connection[];
}

// Model definition
export interface Model {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  sheets: Sheet[];
}

// Convert blocks to ReactFlow nodes
export const toReactFlowNodes = (sheet: Sheet): Node[] => {
  return sheet.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    position: block.position,
    data: block.data,
  }));
};

// Convert connections to ReactFlow edges
export const toReactFlowEdges = (sheet: Sheet): Edge[] => {
  return sheet.connections.map((connection) => ({
    id: connection.id,
    source: connection.sourceNodeId,
    sourceHandle: connection.sourceHandleId,
    target: connection.targetNodeId,
    targetHandle: connection.targetHandleId,
    type: 'smoothstep',
  }));
};

// Convert ReactFlow nodes back to blocks
export const fromReactFlowNodes = (nodes: Node[]): Block[] => {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type || 'default',
    position: { x: node.position.x, y: node.position.y },
    data: node.data,
  }));
};

// Convert ReactFlow edges back to connections
export const fromReactFlowEdges = (edges: Edge[]): Connection[] => {
  return edges.map((edge) => ({
    id: edge.id,
    sourceNodeId: edge.source,
    sourceHandleId: edge.sourceHandle || 'default',
    targetNodeId: edge.target,
    targetHandleId: edge.targetHandle || 'default',
  }));
};

// Utility function to analyze subsystem handles
export const analyzeSubsystemHandles = (sheet: Sheet) => {
  const inputHandles: Array<{ id: string; name: string; unit?: string }> = [];
  const outputHandles: Array<{ id: string; name: string; unit?: string }> = [];

  sheet.blocks.forEach(block => {
    if (block.type === 'inputPort') {
      const data = block.data as InputPortBlockData;
      inputHandles.push({
        id: data.name || `input_${block.id}`,
        name: data.name || 'input',
        unit: data.unit
      });
    } else if (block.type === 'outputPort') {
      const data = block.data as OutputPortBlockData;
      outputHandles.push({
        id: data.name || `output_${block.id}`,
        name: data.name || 'output',
        unit: data.unit
      });
    }
  });

  return { inputHandles, outputHandles };
};