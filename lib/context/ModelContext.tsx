// lib/context/ModelContext.tsx
'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { useModelStore } from '@/lib/store/modelStore';

// Create a context for the model store
const ModelContext = createContext<ReturnType<typeof useModelStore> | null>(null);

// Provider component
export const ModelProvider = ({ children }: { children: ReactNode }) => {
  // Use a ref to ensure the store is created only once
  const storeRef = useRef<ReturnType<typeof useModelStore> | null>(null);
  
  if (storeRef.current === null) {
    storeRef.current = useModelStore();
  }
  
  return (
    <ModelContext.Provider value={storeRef.current}>
      {children}
    </ModelContext.Provider>
  );
};

// Hook to use the model store
export const useModel = () => {
  const store = useContext(ModelContext);
  
  if (!store) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  
  return store;
};