// lib/models/modelSchema.ts
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

export interface InputPortBlockData extends BlockData {
  value: number;
  name?: string;
  unit?: string;
  inputType?: 'constant' | 'signal' | 'variable';
  variableName?: string;
  signalShape?: 'constant' | 'sine' | 'square' | 'ramp';
  signalPeriod?: number;
  signalAmplitude?: number;
  signalOffset?: number;
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

export interface SubsystemBlockData extends BlockData {
  sheetId?: string;
}

// Block definition
export interface Block {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: BlockData | SumBlockData | MultiplyBlockData | InputPortBlockData | 
        OutputPortBlockData | DisplayBlockData | LoggerBlockData | 
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