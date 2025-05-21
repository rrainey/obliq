// lib/supabase/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for models
export interface ModelData {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  data: any; // The model JSON document
  created_at: string;
  updated_at: string;
}

// Utility functions for working with models

// Get all models for the current user
export async function getUserModels() {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching models:', error);
    return null;
  }
  
  return data as ModelData[];
}

// Get a specific model by ID
export async function getModelById(modelId: string) {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', modelId)
    .single();
  
  if (error) {
    console.error('Error fetching model:', error);
    return null;
  }
  
  return data as ModelData;
}

// Create a new model
export async function createModel(name: string, description: string, modelData: any) {
  const { data, error } = await supabase
    .from('models')
    .insert([
      {
        name,
        description,
        data: modelData,
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating model:', error);
    return null;
  }
  
  return data as ModelData;
}

// Update an existing model
export async function updateModel(modelId: string, updates: Partial<ModelData>) {
  const { data, error } = await supabase
    .from('models')
    .update(updates)
    .eq('id', modelId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating model:', error);
    return null;
  }
  
  return data as ModelData;
}

// Delete a model
export async function deleteModel(modelId: string) {
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', modelId);
  
  if (error) {
    console.error('Error deleting model:', error);
    return false;
  }
  
  return true;
}