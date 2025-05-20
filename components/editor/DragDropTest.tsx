'use client';

// For testing only; unused in actual application.

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: any[] = [];

const DragDropTest = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      console.log('Drop event triggered in test component');

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.error('ReactFlow wrapper or instance not available');
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      console.log(`Type from drag data: ${type}`);

      if (!type) {
        console.error('No type found in drag data');
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    console.log('ReactFlow instance initialized in test component');
  }, []);

  // Sidebar items for testing
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    console.log(`Drag started for ${nodeType}`);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <div
          className="bg-white p-2 border border-gray-300 rounded mb-2 cursor-move"
          onDragStart={(event) => onDragStart(event, 'default')}
          draggable
        >
          Default Node
        </div>
        <div
          className="bg-white p-2 border border-gray-300 rounded cursor-move"
          onDragStart={(event) => onDragStart(event, 'input')}
          draggable
        >
          Input Node
        </div>
      </div>

      {/* ReactFlow pane */}
      <div ref={reactFlowWrapper} className="flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

// Export wrapped in provider to ensure proper context
export default function DragDropTestWrapper() {
  return (
    <ReactFlowProvider>
      <DragDropTest />
    </ReactFlowProvider>
  );
}