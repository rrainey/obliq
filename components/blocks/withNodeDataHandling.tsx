'use client';

import { memo, ComponentType } from 'react';
import { NodeProps } from 'reactflow';

// Higher-order component to inject node data handling functions
export const withNodeDataHandling = <T extends object>(
  Component: ComponentType<NodeProps<T> & { onNodeDataChange?: (nodeId: string, data: Partial<T>) => void }>
) => {
  const WrappedComponent = (props: NodeProps<T> & { onNodeDataChange?: (nodeId: string, data: Partial<T>) => void }) => {
    // Pass the onNodeDataChange function to the wrapped component
    return <Component {...props} />;
  };

  return memo(WrappedComponent);
};