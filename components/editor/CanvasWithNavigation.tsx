// components/editor/CanvasWithNavigation.tsx
'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  ReactFlowInstance,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
  NodeChange,
  NodePositionChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './CustomReactFlow.css';
import { getNodeTypes } from '@/components/blocks/NodeTypes';
import { useModelStore } from '@/lib/store/modelStore';
import { useSubsystemNavigation } from '@/lib/context/SubsystemNavigationContext';
import { toReactFlowNodes, toReactFlowEdges, fromReactFlowNodes, fromReactFlowEdges, createId } from '@/lib/models/modelSchema';
import PropertiesPanel from '../editor/PropertiesPanel';
import { useSimulation } from '@/lib/hooks/useSimulation';
import { Block, 
         BlockData, 
         InputPortBlockData, 
         OutputPortBlockData, 
         SourceBlockData,
         SumBlockData, 
         MultiplyBlockData, 
         TransferFunctionBlockData, 
         LoggerBlockData, 
         DisplayBlockData, 
         SubsystemBlockData } from '@/lib/models/modelSchema';

interface CanvasWithNavigationProps {
  onNodeSelect: (nodeId: string | null) => void;
  showProperties: boolean;
  onCloseProperties: () => void;
  // Simulation props
  isSimulationRunning?: boolean;
  simulationTime?: number;
  onSimulationStart?: () => void;
  onSimulationStop?: () => void;
  onSimulationReset?: () => void;
  onUpdateSimulationTime?: (time: number) => void;
}

export default function CanvasWithNavigation({ 
  onNodeSelect, 
  onCloseProperties, 
  showProperties,
  isSimulationRunning = false,
  simulationTime = 0,
  onSimulationStart = () => {},
  onSimulationStop = () => {},
  onSimulationReset = () => {},
  onUpdateSimulationTime = () => {}
}: CanvasWithNavigationProps) {
  
  // Get navigation context
  const { currentSheet, navigateToSubsystem } = useSubsystemNavigation();
  
  // Get model store functions
  const { addBlock, addConnection, removeBlock, removeConnection, updateBlock, markUnsavedChanges } = useModelStore();

  // Use current sheet from navigation context instead of model store
  const [nodes, setNodes, onNodesChange] = useNodesState(currentSheet ? toReactFlowNodes(currentSheet) : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentSheet ? toReactFlowEdges(currentSheet) : []);
  
  // State for selected node
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Track if we're currently syncing to avoid infinite loops
  const [isSyncing, setIsSyncing] = useState(false);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Function to handle node data changes
  const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
    console.log('Canvas: onNodeDataChange called for node:', nodeId, 'with data:', newData);
    
    if (!currentSheet) return;
    
    const node = currentSheet.blocks.find(b => b.id === nodeId);
    
    if (node) {
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          ...newData
        }
      };
      console.log('Canvas: updating node with:', updatedNode);
      updateBlock(nodeId, updatedNode);
      markUnsavedChanges();
    } else {
      console.warn('Canvas: Node not found for update:', nodeId);
    }
  }, [currentSheet, updateBlock, markUnsavedChanges]);

  // Handle subsystem double-click navigation
  const handleSubsystemDoubleClick = useCallback((nodeId: string, sheet?: any) => {
    console.log('Canvas: Subsystem double-clicked:', nodeId, sheet);
    
    if (sheet) {
      // Find the subsystem block to get its name
      const subsystemBlock = currentSheet?.blocks.find(b => b.id === nodeId);
      const subsystemName = subsystemBlock?.data?.label || 'Subsystem';
      
      navigateToSubsystem(nodeId, sheet, subsystemName);
    } else {
      console.warn('Canvas: Subsystem has no embedded sheet');
    }
  }, [currentSheet, navigateToSubsystem]);

  // Create node types with navigation support
  const nodeTypes = useMemo(() => {
    return getNodeTypes(onNodeDataChange, handleSubsystemDoubleClick);
  }, [onNodeDataChange, handleSubsystemDoubleClick]);

  // Set up simulation hook with current sheet blocks and connections
  const {
    isRunning,
    currentTime,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    setTimeStep
  } = useSimulation(
    currentSheet?.blocks || [], 
    currentSheet?.connections || [], 
    onNodeDataChange
  );

  // Use external simulation running state if provided
  useEffect(() => {
    if (isSimulationRunning && !isRunning) {
      startSimulation();
    } else if (!isSimulationRunning && isRunning) {
      stopSimulation();
    }
  }, [isSimulationRunning, isRunning, startSimulation, stopSimulation]);

  // Update external time as simulation progresses
  useEffect(() => {
    if (isRunning) {
      onUpdateSimulationTime(currentTime);
    }
  }, [currentTime, isRunning, onUpdateSimulationTime]);

  // Connect simulation controls from parent to local simulation engine
  const handleStartSimulation = useCallback(() => {
    startSimulation();
    onSimulationStart();
  }, [startSimulation, onSimulationStart]);

  const handleStopSimulation = useCallback(() => {
    stopSimulation();
    onSimulationStop();
  }, [stopSimulation, onSimulationStop]);

  const handleResetSimulation = useCallback(() => {
    resetSimulation();
    onSimulationReset();
    onUpdateSimulationTime(0);
  }, [resetSimulation, onSimulationReset, onUpdateSimulationTime]);

  // Sync ReactFlow state with current sheet when it changes
  useEffect(() => {
    if (!isSyncing && currentSheet) {
      setIsSyncing(true);
      console.log('Canvas: Syncing React Flow with current sheet');
      setNodes(toReactFlowNodes(currentSheet));
      setEdges(toReactFlowEdges(currentSheet));
      setIsSyncing(false);
    }
  }, [currentSheet, setNodes, setEdges]);

  // Rest of the Canvas implementation continues...
  // [Include all the remaining Canvas logic like connections, drag & drop, etc.]
  
  return (
    <div className="flex flex-grow relative">
      <div ref={reactFlowWrapper} className="flex-grow bg-white relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          snapToGrid={true}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Meta', 'Shift']}
          nodesDraggable={true}
          elementsSelectable={true}
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
      
      {/* Show properties panel when a node is selected and properties panel is toggled */}
      {showProperties && selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
          onClose={onCloseProperties}
        />
      )}
    </div>
  );
}