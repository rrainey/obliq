// lib/hooks/useNodeInteraction.ts
import { useCallback } from 'react';

/**
 * This hook helps with interactions inside React Flow nodes
 */
export function useNodeInteraction() {
  // This function should be added to any interactive element to stop propagation
  const stopPropagation = useCallback((e: React.MouseEvent | React.FocusEvent) => {
    e.stopPropagation();
  }, []);

  return { stopPropagation };
}