'use client';

import { useCallback, useEffect, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getNodeTypes } from '@/components/blocks/NodeTypes';
import { useModelStore } from '@/lib/store/modelStore';
import { toReactFlowNodes, toReactFlowEdges, fromReactFlowNodes, fromReactFlowEdges, createId } from '@/lib/models/modelSchema';

export default function Canvas() {
  // Get the current sheet from our model store
  const { getCurrentSheet, addBlock, addConnection, removeBlock, removeConnection, updateBlock } = useModelStore();
  const currentSheet = getCurrentSheet();

  // Initialize React Flow state with data from our model
  const [nodes, setNodes, onNodesChange] = useNodesState(toReactFlowNodes(currentSheet));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toReactFlowEdges(currentSheet));
  
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

  // Sync ReactFlow state with our model store
  useEffect(() => {
    setNodes(toReactFlowNodes(currentSheet));
    setEdges(toReactFlowEdges(currentSheet));
  }, [currentSheet, setNodes, setEdges]);

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
  }, []);

  // Handle dropping a block from the sidebar onto the canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const blockType = event.dataTransfer.getData('application/reactflow');
      
      // Get block position relative to the canvas
      const position = reactFlowInstance.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

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

      // Create block data based on type
      const getBlockData = (type: string) => {
        const baseData = { 
          label: getBlockLabel(type),
          description: `${getBlockLabel(type)} Block` 
        };

        const uniqueId = createId();

        switch (type) {
          case 'sum':
            return { ...baseData, inputCount: 2 };
          case 'multiply':
            return { ...baseData, inputCount: 2 };
          case 'inputPort':
            return { 
              ...baseData, 
              value: 0,
              name: `input_${uniqueId}`,
              unit: '',
            };
          case 'outputPort':
            return { 
              ...baseData, 
              name: `output_${uniqueId}`,
              value: null,
              connected: false,
              unit: '',
            };
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
            };
          case 'transferFunction':
            return { ...baseData, numerator: '1', denominator: '1,1' };
          case 'logger':
            return { 
              ...baseData, 
              logs: [],
              connected: false,
              maxEntries: 100,
              recording: true,
              unit: ''
            };
          default:
            return baseData;
        }
      };

      // Create a new block
      const newBlock = {
        id: `${blockType}-${createId()}`,
        type: blockType,
        position,
        data: getBlockData(blockType),
      };

      // Add the block to our model
      addBlock(newBlock);
    },
    [addBlock]
  );

  // Handle node deletion
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    nodesToDelete.forEach(node => {
      removeBlock(node.id);
    });
  }, [removeBlock]);

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

  // Allow dropping on the canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
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
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        snapToGrid={true}
        fitView
        // Add this line to prevent dragging when clicking on form elements
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        // Add a custom stylesheet to help with interactivity
        className="custom-reactflow-canvas"
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}