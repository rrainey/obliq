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
import { toReactFlowNodes, toReactFlowEdges, createId } from '@/lib/models/modelSchema';
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

interface CanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  showProperties: boolean;
  onCloseProperties: () => void;
  isSimulationRunning?: boolean;
  simulationTime?: number;
  onSimulationStart?: () => void;
  onSimulationStop?: () => void;
  onSimulationReset?: () => void;
  onUpdateSimulationTime?: (time: number) => void;
}

export default function Canvas({ 
  onNodeSelect, 
  onCloseProperties, 
  showProperties,
  isSimulationRunning = false,
  simulationTime = 0,
  onSimulationStart = () => {},
  onSimulationStop = () => {},
  onSimulationReset = () => {},
  onUpdateSimulationTime = () => {}
}: CanvasProps) {
  // Get model store functions
  const { getCurrentSheet, addBlock, addConnection, removeBlock, removeConnection, updateBlock, markUnsavedChanges } = useModelStore();
  
  // Get navigation context (with fallback)
  let currentSheet;
  let navigateToSubsystem: ((blockId: string, sheet: any, name: string) => void) | undefined;
  
  try {
    const navigation = useSubsystemNavigation();
    currentSheet = navigation.currentSheet || getCurrentSheet();
    navigateToSubsystem = navigation.navigateToSubsystem;
  } catch {
    currentSheet = getCurrentSheet();
  }

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(toReactFlowNodes(currentSheet));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toReactFlowEdges(currentSheet));
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Function to handle node data changes
  const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
    console.log('Canvas: onNodeDataChange called for node:', nodeId, 'with data:', newData);
    
    if (!currentSheet) return;
    
    const node = currentSheet.blocks.find((b: Block) => b.id === nodeId);
    
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
    
    if (sheet && navigateToSubsystem) {
      const subsystemBlock = currentSheet?.blocks.find((b: Block) => b.id === nodeId);
      const subsystemName = subsystemBlock?.data?.label || 'Subsystem';
      navigateToSubsystem(nodeId, sheet, subsystemName);
    } else if (!sheet) {
      console.warn('Canvas: Subsystem has no embedded sheet');
    } else {
      console.warn('Canvas: Navigation context not available');
    }
  }, [currentSheet, navigateToSubsystem]);

  // Create node types with navigation support
  const nodeTypes = useMemo(() => {
    return getNodeTypes(onNodeDataChange, handleSubsystemDoubleClick);
  }, [onNodeDataChange, handleSubsystemDoubleClick]);

  // Set up simulation
  const {
    isRunning,
    currentTime,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation
  } = useSimulation(
    currentSheet?.blocks || [], 
    currentSheet?.connections || [], 
    onNodeDataChange
  );

  // Simulation control integration
  useEffect(() => {
    if (isSimulationRunning && !isRunning) {
      startSimulation();
    } else if (!isSimulationRunning && isRunning) {
      stopSimulation();
    }
  }, [isSimulationRunning, isRunning, startSimulation, stopSimulation]);

  useEffect(() => {
    if (isRunning) {
      onUpdateSimulationTime(currentTime);
    }
  }, [currentTime, isRunning, onUpdateSimulationTime]);

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

  // Sync ReactFlow with current sheet
  useEffect(() => {
    if (!isSyncing && currentSheet) {
      setIsSyncing(true);
      console.log('Canvas: Syncing React Flow with current sheet');
      setNodes(toReactFlowNodes(currentSheet));
      setEdges(toReactFlowEdges(currentSheet));
      setIsSyncing(false);
    }
  }, [currentSheet, setNodes, setEdges]);

  // Update node connections status
  const updateNodeConnections = useCallback(() => {
    const connectedNodes = new Set<string>();
    
    edges.forEach(edge => {
      if (edge.target) {
        connectedNodes.add(edge.target);
      }
    });
    
    nodes.forEach(node => {
      const isConnected = connectedNodes.has(node.id);
      
      if (node.data.connected !== isConnected) {
        if (['display', 'outputPort', 'logger'].includes(node.type || '')) {
          onNodeDataChange(node.id, { connected: isConnected });
        }
      }
    });
  }, [edges, nodes, onNodeDataChange]);

  useEffect(() => {
    updateNodeConnections();
  }, [edges, updateNodeConnections]);

  // Handle connections
  const onConnect = useCallback((params: Edge | Connection) => {
    if (params.source && params.target) {
      const newConnection = {
        id: `edge-${createId()}`,
        sourceNodeId: params.source,
        sourceHandleId: params.sourceHandle || 'default',
        targetNodeId: params.target,
        targetHandleId: params.targetHandle || 'default',
      };
      addConnection(newConnection);
      markUnsavedChanges();
    }
  }, [addConnection, markUnsavedChanges]);

  // Store React Flow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    console.log('ReactFlow instance initialized in Canvas');
  }, []);

  // Handle block creation from drag & drop
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    console.log('Drop event triggered');

    if (!reactFlowWrapper.current || !reactFlowInstance.current) {
      console.error('ReactFlow wrapper or instance not available');
      return;
    }

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const blockType = event.dataTransfer.getData('application/reactflow');
    console.log(`Block type from drag data: ${blockType}`);
    
    if (!blockType) {
      console.error('No block type found in drag data');
      return;
    }
    
    const position = reactFlowInstance.current.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    // Generate block labels
    const getBlockLabel = (type: string): string => {
      switch (type) {
        case 'sum': return 'Sum';
        case 'multiply': return 'Multiply';
        case 'inputPort': return 'Input';
        case 'source': return 'Source';
        case 'outputPort': return 'Output';
        case 'display': return 'Display';
        case 'logger': return 'Logger';
        case 'transferFunction': return 'Transfer Function';
        case 'subsystem': return 'Subsystem';
        default: return 'Block';
      }
    };

    // Create block data
    const getBlockData = (type: string) => {
      const uniqueId = createId();
      const baseData = { 
        label: getBlockLabel(type),
        description: `${getBlockLabel(type)} Block` 
      };

      switch (type) {
        case 'sum':
          return { 
            ...baseData, 
            inputCount: 2,
            operationType: 'sum',
            showInputLabels: true 
          } as SumBlockData;
        
        case 'multiply':
          return { 
            ...baseData, 
            inputCount: 2,
            operationType: 'multiply',
            showInputLabels: true 
          } as MultiplyBlockData;
        
        case 'inputPort':
          return { 
            ...baseData, 
            name: `input_${uniqueId}`,
            unit: '',
            defaultValue: 0
          } as InputPortBlockData;
        
        case 'source':
          return { 
            ...baseData, 
            value: 0,
            name: `source_${uniqueId}`,
            unit: '',
            sourceType: 'constant',
            amplitude: 1,
            frequency: 1,
            phase: 0,
            offset: 0
          } as SourceBlockData;
        
        case 'outputPort':
          return { 
            ...baseData, 
            name: `output_${uniqueId}`,
            value: null,
            connected: false,
            unit: '',
            exportEnabled: false,
            exportFormat: 'csv',
            exportFilename: `output_${uniqueId}`,
            history: [],
            historyMaxLength: 1000
          } as OutputPortBlockData;
        
        case 'display':
          return { 
            ...baseData, 
            value: null,
            connected: false,
            displayMode: 'value',
            min: 0,
            max: 100,
            precision: 2,
            unit: '',
            showUnit: true
          } as DisplayBlockData;
        
        case 'transferFunction':
          return { 
            ...baseData, 
            numerator: '1', 
            denominator: '1,1' 
          } as TransferFunctionBlockData;
        
        case 'logger':
          return { 
            ...baseData, 
            logs: [],
            connected: false,
            maxEntries: 100,
            recording: true,
            unit: ''
          } as LoggerBlockData;
        
        case 'subsystem':
          return { 
            ...baseData, 
            sheet: undefined 
          } as SubsystemBlockData;
        
        default:
          return baseData as BlockData;
      }
    };

    // Create new block
    const newBlock: Block = {
      id: `${blockType}-${createId()}`,
      type: blockType,
      position,
      data: getBlockData(blockType),
    };
    console.log('Creating new block:', newBlock);

    addBlock(newBlock);
    markUnsavedChanges();
  }, [addBlock, markUnsavedChanges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node deletion
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    nodesToDelete.forEach(node => {
      removeBlock(node.id);
    });
    
    if (selectedNode && nodesToDelete.some(node => node.id === selectedNode.id)) {
      setSelectedNode(null);
      onNodeSelect(null);
    }
    
    markUnsavedChanges();
  }, [removeBlock, selectedNode, onNodeSelect, markUnsavedChanges]);

  // Handle edge deletion
  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach(edge => {
      removeConnection(edge.id);
    });
    markUnsavedChanges();
  }, [removeConnection, markUnsavedChanges]);

  // Handle position changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    const positionChanges = changes.filter((change): change is NodePositionChange => 
      change.type === 'position' && 
      change.dragging === false && 
      change.position !== undefined
    );
    
    if (positionChanges.length > 0 && currentSheet) {
      positionChanges.forEach(change => {
        if (change.position) {
          const block = currentSheet.blocks.find((b: Block) => b.id === change.id);
          if (block) {
            updateBlock(change.id, {
              ...block,
              position: change.position
            });
          }
        }
      });
      markUnsavedChanges();
    }
  }, [onNodesChange, currentSheet, updateBlock, markUnsavedChanges]);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    console.log('Canvas: Node clicked:', node.id);
    setSelectedNode(node);
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    console.log('Canvas: Pane clicked, deselecting node');
    setSelectedNode(null);
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(event.key) {
        case ' ':
          if (isRunning) {
            handleStopSimulation();
          } else {
            handleStartSimulation();
          }
          event.preventDefault();
          break;
        case 'r':
          handleResetSimulation();
          event.preventDefault();
          break;
        case 's':
          if (!isRunning) {
            stepSimulation();
          }
          event.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, handleStartSimulation, handleStopSimulation, handleResetSimulation, stepSimulation]);

  return (
    <div className="flex flex-grow relative">
      <div ref={reactFlowWrapper} className="flex-grow bg-white relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
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