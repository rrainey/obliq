'use client';

import { memo } from 'react';
import { Position, NodeProps, Handle } from 'reactflow';

export interface SubsystemNodeData {
  label: string;
  description?: string;
  sheetId?: string;
}

const SubsystemNode = ({ data, selected, id }: NodeProps<SubsystemNodeData>) => {
  return (
    <div className={`px-4 py-4 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-300'
    } min-w-[150px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-green-500"
      />

      {/* Block content */}
      <div className="flex flex-col">
        <div className="text-sm font-medium mb-2">{data.label}</div>
        <div className="p-2 border border-dashed border-gray-300 rounded text-center">
          <div className="text-xs">Double-click to open</div>
          <div className="mt-1 text-xs text-gray-500">Subsystem</div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default memo(SubsystemNode);