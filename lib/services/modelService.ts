// lib/services/modelService.ts - LLM-generated code
import { supabase } from '@/lib/supabase/supabaseClient';
import { Model } from '@/lib/models/modelSchema';

export interface SaveModelResult {
  success: boolean;
  modelId?: string;
  error?: string;
}

/**
 * Save a model to Supabase
 */
export async function saveModelToSupabase(
  model: Model,
  name: string,
  description: string
): Promise<SaveModelResult> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to save models'
      };
    }

    // Prepare model data for storage - FIXED: Added user_id
    const modelData = {
      user_id: user.id,  // THIS WAS MISSING!
      name: name.trim(),
      description: description.trim(),
      data: {
        id: model.id,
        name: model.name,
        description: model.description,
        sheets: model.sheets,
        createdAt: model.createdAt,
        updatedAt: new Date().toISOString()
      }
    };

    // Check if this is an update to existing model by checking if model.id exists in database
    const { data: existingModel } = await supabase
      .from('models')
      .select('id')
      .eq('data->id', model.id)
      .eq('user_id', user.id)
      .maybeSingle();

    let result;
    
    if (existingModel) {
      // Update existing model
      const { data, error } = await supabase
        .from('models')
        .update(modelData)
        .eq('id', existingModel.id)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error updating model:', error);
        return {
          success: false,
          error: 'Failed to update model: ' + error.message
        };
      }
      
      result = data;
    } else {
      // Create new model
      const { data, error } = await supabase
        .from('models')
        .insert([modelData])
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating model:', error);
        return {
          success: false,
          error: 'Failed to save model: ' + error.message
        };
      }
      
      result = data;
    }

    return {
      success: true,
      modelId: result.id
    };
    
  } catch (error) {
    console.error('Unexpected error saving model:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the model'
    };
  }
}

/**
 * Check if a model name already exists for the current user
 */
export async function checkModelNameExists(name: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('models')
      .select('id')
      .eq('name', name.trim())
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking model name:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking model name:', error);
    return false;
  }
}

/**
 * Load all models for the current user
 */
export async function loadUserModels(): Promise<{
  success: boolean;
  models?: any[];
  error?: string;
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to load models'
      };
    }

    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading models:', error);
      return {
        success: false,
        error: 'Failed to load models: ' + error.message
      };
    }

    return {
      success: true,
      models: data || []
    };
  } catch (error) {
    console.error('Unexpected error loading models:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while loading models'
    };
  }
}

/**
 * Load a specific model by ID
 */
export async function loadModelById(modelId: string): Promise<{
  success: boolean;
  model?: any;
  error?: string;
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to load models'
      };
    }

    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading model:', error);
      return {
        success: false,
        error: 'Failed to load model: ' + error.message
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Model not found or you do not have permission to access it'
      };
    }

    return {
      success: true,
      model: data
    };
  } catch (error) {
    console.error('Unexpected error loading model:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while loading the model'
    };
  }
}

/**
 * Delete a model by ID
 */
export async function deleteModelById(modelId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete models'
      };
    }

    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', modelId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting model:', error);
      return {
        success: false,
        error: 'Failed to delete model: ' + error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Unexpected error deleting model:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the model'
    };
  }
}