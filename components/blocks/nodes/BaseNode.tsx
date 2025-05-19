'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import BlockIcon from '../BlockIcon';

export interface BaseNodeData {
  label: string;
  description?: string;
}

export interface BaseNodeProps extends NodeProps {
  data: BaseNodeData;
  inputHandles?: { id: string; position?: Position; label?: string }[];
  outputHandles?: { id: string; position?: Position; label?: string }[];
  children?: React.ReactNode;
  icon?: string;
}

const BaseNode = ({
  data,
  inputHandles = [],
  outputHandles = [],
  children,
  icon,
  selected,
}: BaseNodeProps) => {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div className="flex items-center">
        {icon && (
          <div className="rounded-full w-10 h-10 flex items-center justify-center mr-2">
            <BlockIcon type={icon} />
          </div>
        )}
        <div>
          <div className="font-bold">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500">{data.description}</div>
          )}
        </div>
      </div>

      {children}

      {/* Input Handles */}
      {inputHandles.map((handle) => (
        <Handle
          key={handle.id}
          type="target"
          position={handle.position || Position.Left}
          id={handle.id}
          className="w-3 h-3 bg-gray-400"
        />
      ))}

      {/* Output Handles */}
      {outputHandles.map((handle) => (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position || Position.Right}
          id={handle.id}
          className="w-3 h-3 bg-gray-400"
        />
      ))}
    </div>
  );
};

export default memo(BaseNode);