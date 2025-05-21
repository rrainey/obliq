'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import './CustomReactFlow.css';
import { getNodeTypes } from '@/components/blocks/NodeTypes';
import { useModelStore } from '@/lib/store/modelStore';
import { toReactFlowNodes, toReactFlowEdges, fromReactFlowNodes, fromReactFlowEdges, createId } from '@/lib/models/modelSchema';
import PropertiesPanel from '../editor/PropertiesPanel';
import { useSimulation } from '@/lib/hooks/useSimulation';
import { Block, 
         BlockData, 
         InputPortBlockData, 
         OutputPortBlockData, 
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
  // New simulation-related props to match page.tsx
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
  // Provide defaults for new props
  isSimulationRunning = false,
  simulationTime = 0,
  onSimulationStart = () => {},
  onSimulationStop = () => {},
  onSimulationReset = () => {},
  onUpdateSimulationTime = () => {}
}: CanvasProps) {
  // Get the current sheet from our model store
  const { getCurrentSheet, addBlock, addConnection, removeBlock, removeConnection, updateBlock } = useModelStore();
  const currentSheet = getCurrentSheet();

  // Initialize React Flow state with data from our model
  const [nodes, setNodes, onNodesChange] = useNodesState(toReactFlowNodes(currentSheet));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toReactFlowEdges(currentSheet));
  
  // State for selected node
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Function to handle node data changes
  const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
    const currentSheet = getCurrentSheet();
    const node = currentSheet.blocks.find(b => b.id === nodeId);
    
    if (node) {
      updateBlock(nodeId, {
        ...node,
        data: {
          ...node.data,
          ...newData
        }
      });
    }
  }, [getCurrentSheet, updateBlock]);

  // Create node types with the onNodeDataChange function
  const nodeTypes = getNodeTypes(onNodeDataChange);

  // Set up simulation hook with our blocks and connections
  const {
    isRunning,
    currentTime,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    setTimeStep
  } = useSimulation(currentSheet.blocks, currentSheet.connections, onNodeDataChange);

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
    onUpdateSimulationTime(0); // Reset external time as well
  }, [resetSimulation, onSimulationReset, onUpdateSimulationTime]);

  // Expose stepSimulation and setTimeStep to be called from the parent component
  // via refs or other mechanisms if needed

  // Sync ReactFlow state with our model store
  useEffect(() => {
    setNodes(toReactFlowNodes(currentSheet));
    setEdges(toReactFlowEdges(currentSheet));
  }, [currentSheet, setNodes, setEdges]);

  // Track if we need to stop simulation when switching sheets
  useEffect(() => {
    // Stop simulation when unmounting
    return () => {
      if (isRunning) {
        stopSimulation();
        onSimulationStop(); // Notify parent
      }
    };
  }, [isRunning, stopSimulation, onSimulationStop]);

  // Update node connections status
  const updateNodeConnections = useCallback(() => {
    // Create a map of connected nodes
    const connectedNodes = new Set<string>();
    
    // Scan all edges to find connected nodes
    edges.forEach(edge => {
      if (edge.target) {
        connectedNodes.add(edge.target);
      }
    });
    
    // Update node data for display, output, and other nodes that care about connection state
    nodes.forEach(node => {
      const isConnected = connectedNodes.has(node.id);
      
      // Only update if connection state changed
      if (node.data.connected !== isConnected) {
        if (['display', 'outputPort', 'logger'].includes(node.type || '')) {
          // Update node data in the model
          onNodeDataChange(node.id, { connected: isConnected });
        }
      }
    });
  }, [edges, nodes, onNodeDataChange]);

  // Call updateNodeConnections when edges change
  useEffect(() => {
    updateNodeConnections();
  }, [edges, updateNodeConnections]);

  // Handle connections between nodes
  const onConnect = useCallback((params: Edge | Connection) => {
    // Only create a connection if both source and target nodes are defined
    if (params.source && params.target) {
      const newConnection = {
        id: `edge-${createId()}`,
        sourceNodeId: params.source,
        sourceHandleId: params.sourceHandle || 'default',
        targetNodeId: params.target,
        targetHandleId: params.targetHandle || 'default',
      };
      addConnection(newConnection);
    }
  }, [addConnection]);

  // Store the React Flow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    console.log('ReactFlow instance initialized in Canvas');
  }, []);


  // Handle dropping a block from the sidebar onto the canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('Drop event triggered');  // Add logging

      if (!reactFlowWrapper.current || !reactFlowInstance.current) {
        console.error('ReactFlow wrapper or instance not available');
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const blockType = event.dataTransfer.getData('application/reactflow');
      console.log(`Block type from drag data: ${blockType}`);  // Add logging
      
      if (!blockType) {
        console.error('No block type found in drag data');
        return;
      }
      
      // Get block position relative to the canvas
      const position = reactFlowInstance.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      console.log(`Drop position: ${position.x}, ${position.y}`);  // Add logging

      // Generate labels for each block type
      const getBlockLabel = (type: string): string => {
        switch (type) {
          case 'sum': return 'Sum';
          case 'multiply': return 'Multiply';
          case 'inputPort': return 'Input';
          case 'outputPort': return 'Output';
          case 'display': return 'Display';
          case 'logger': return 'Logger';
          case 'transferFunction': return 'Transfer Function';
          case 'subsystem': return 'Subsystem';
          default: return 'Block';
        }
      };

      // Create block data based on type, using our type definitions
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
              value: 0,
              name: `input_${uniqueId}`,
              unit: '',
              inputType: 'constant',
              variableName: '',
              signalShape: 'constant',
              signalPeriod: 1,
              signalAmplitude: 1,
              signalOffset: 0
            } as InputPortBlockData;
          
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
              sheetId: undefined 
            } as SubsystemBlockData;
          
          default:
            return baseData as BlockData;
        }
      };

      // Create a new block
      const newBlock: Block = {
        id: `${blockType}-${createId()}`,
        type: blockType,
        position,
        data: getBlockData(blockType),
      };
      console.log('Creating new block:', newBlock);  // Add logging

      // Add the block to our model
      addBlock(newBlock);
    },
    [addBlock]
  );

  // Allow dropping on the canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node deletion
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    nodesToDelete.forEach(node => {
      removeBlock(node.id);
    });
    
    // Clear selected node if it was deleted
    if (selectedNode && nodesToDelete.some(node => node.id === selectedNode.id)) {
      setSelectedNode(null);
      onNodeSelect(null);
    }
  }, [removeBlock, selectedNode, onNodeSelect]);

  // Handle edge deletion
  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach(edge => {
      removeConnection(edge.id);
    });
  }, [removeConnection]);

  // Handle node changes (position, etc.)
  useEffect(() => {
    const handleNodeChanges = () => {
      const currentNodes = fromReactFlowNodes(nodes);
      currentNodes.forEach(node => {
        updateBlock(node.id, node);
      });
    };

    // Debounce to avoid too many updates
    const timeoutId = setTimeout(handleNodeChanges, 200);
    return () => clearTimeout(timeoutId);
  }, [nodes, updateBlock]);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node);
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Add keyboard shortcut handler for simulation control
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not editing text
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(event.key) {
        case ' ': // Space bar to toggle simulation
          if (isRunning) {
            handleStopSimulation();
          } else {
            handleStartSimulation();
          }
          event.preventDefault();
          break;
        case 'r': // R to reset simulation
          handleResetSimulation();
          event.preventDefault();
          break;
        case 's': // S to step simulation
          if (!isRunning) {
            stepSimulation();
          }
          event.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning, handleStartSimulation, handleStopSimulation, handleResetSimulation, stepSimulation]);

  return (
      <div className="flex flex-grow relative">
        <div ref={reactFlowWrapper} className="flex-grow bg-white relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
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