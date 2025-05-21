// lib/services/modelValidationService.ts - LLM-generated code
import { Model, Block, Connection, Sheet } from '@/lib/models/modelSchema';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ModelIntegrityReport {
  validation: ValidationResult;
  fixedIssues: string[];
  model: Model;
}

/**
 * Validate a complete model for structural integrity
 */
export function validateModel(model: Model): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate model structure
  if (!model.id) errors.push('Model must have an ID');
  if (!model.name || model.name.trim() === '') errors.push('Model must have a name');
  if (!model.sheets || model.sheets.length === 0) errors.push('Model must have at least one sheet');

  // Validate each sheet
  model.sheets.forEach((sheet, sheetIndex) => {
    const sheetErrors = validateSheet(sheet);
    errors.push(...sheetErrors.errors.map(err => `Sheet "${sheet.name}" (${sheetIndex}): ${err}`));
    warnings.push(...sheetErrors.warnings.map(warn => `Sheet "${sheet.name}" (${sheetIndex}): ${warn}`));
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single sheet for structural integrity
 */
export function validateSheet(sheet: Sheet): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!sheet.id) errors.push('Sheet must have an ID');
  if (!sheet.name || sheet.name.trim() === '') errors.push('Sheet must have a name');

  // Check for duplicate block IDs
  const blockIds = new Set<string>();
  const duplicateIds: string[] = [];
  
  sheet.blocks.forEach(block => {
    if (blockIds.has(block.id)) {
      duplicateIds.push(block.id);
    } else {
      blockIds.add(block.id);
    }
  });

  if (duplicateIds.length > 0) {
    errors.push(`Duplicate block IDs found: ${duplicateIds.join(', ')}`);
  }

  // Validate connections reference existing blocks
  sheet.connections.forEach((connection, connIndex) => {
    if (!blockIds.has(connection.sourceNodeId)) {
      errors.push(`Connection ${connIndex}: Source block "${connection.sourceNodeId}" not found`);
    }
    if (!blockIds.has(connection.targetNodeId)) {
      errors.push(`Connection ${connIndex}: Target block "${connection.targetNodeId}" not found`);
    }
  });

  // Check for orphaned blocks (no connections)
  const connectedBlocks = new Set<string>();
  sheet.connections.forEach(conn => {
    connectedBlocks.add(conn.sourceNodeId);
    connectedBlocks.add(conn.targetNodeId);
  });

  const orphanedBlocks = sheet.blocks.filter(block => 
    !connectedBlocks.has(block.id) && 
    !['inputPort', 'outputPort'].includes(block.type)
  );

  if (orphanedBlocks.length > 0) {
    warnings.push(`Orphaned blocks found: ${orphanedBlocks.map(b => b.id).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Fix common model integrity issues automatically
 */
export function fixModelIntegrity(model: Model): ModelIntegrityReport {
  const fixedIssues: string[] = [];
  let fixedModel = JSON.parse(JSON.stringify(model)); // Deep clone

  // Ensure model has required fields
  if (!fixedModel.id) {
    fixedModel.id = `model-${Date.now()}`;
    fixedIssues.push('Generated missing model ID');
  }

  if (!fixedModel.name || fixedModel.name.trim() === '') {
    fixedModel.name = 'Untitled Model';
    fixedIssues.push('Set default model name');
  }

  if (!fixedModel.createdAt) {
    fixedModel.createdAt = new Date().toISOString();
    fixedIssues.push('Set missing creation date');
  }

  if (!fixedModel.updatedAt) {
    fixedModel.updatedAt = new Date().toISOString();
    fixedIssues.push('Set missing update date');
  }

  // Ensure at least one sheet exists
  if (!fixedModel.sheets || fixedModel.sheets.length === 0) {
    fixedModel.sheets = [{
      id: 'main-sheet',
      name: 'Main',
      blocks: [],
      connections: []
    }];
    fixedIssues.push('Created default main sheet');
  }

  // Fix issues in each sheet
  fixedModel.sheets = fixedModel.sheets.map((sheet: Sheet, index: number) => {
    const { fixedSheet, issues } = fixSheetIntegrity(sheet, index);
    fixedIssues.push(...issues);
    return fixedSheet;
  });

  // Validate the fixed model
  const validation = validateModel(fixedModel);

  return {
    validation,
    fixedIssues,
    model: fixedModel
  };
}

/**
 * Fix common sheet integrity issues
 */
function fixSheetIntegrity(sheet: Sheet, sheetIndex: number): { fixedSheet: Sheet, issues: string[] } {
  const issues: string[] = [];
  let fixedSheet = JSON.parse(JSON.stringify(sheet)); // Deep clone

  // Ensure sheet has required fields
  if (!fixedSheet.id) {
    fixedSheet.id = `sheet-${sheetIndex}`;
    issues.push(`Sheet ${sheetIndex}: Generated missing sheet ID`);
  }

  if (!fixedSheet.name || fixedSheet.name.trim() === '') {
    fixedSheet.name = `Sheet ${sheetIndex + 1}`;
    issues.push(`Sheet ${sheetIndex}: Set default sheet name`);
  }

  if (!fixedSheet.blocks) {
    fixedSheet.blocks = [];
    issues.push(`Sheet ${sheetIndex}: Initialized missing blocks array`);
  }

  if (!fixedSheet.connections) {
    fixedSheet.connections = [];
    issues.push(`Sheet ${sheetIndex}: Initialized missing connections array`);
  }

  // Fix duplicate block IDs
  const blockIds = new Set<string>();
  const duplicateBlocks: Block[] = [];
  
  fixedSheet.blocks = fixedSheet.blocks.filter((block: Block) => {
    if (blockIds.has(block.id)) {
      duplicateBlocks.push(block);
      return false;
    } else {
      blockIds.add(block.id);
      return true;
    }
  });

  if (duplicateBlocks.length > 0) {
    // Re-add duplicate blocks with new IDs
    duplicateBlocks.forEach(block => {
      const newId = `${block.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      fixedSheet.blocks.push({
        ...block,
        id: newId
      });
      blockIds.add(newId);
      issues.push(`Sheet ${sheetIndex}: Fixed duplicate block ID "${block.id}" -> "${newId}"`);
    });
  }

  // Remove connections to non-existent blocks
  const validConnections = fixedSheet.connections.filter((connection: Connection) => {
    const sourceExists = blockIds.has(connection.sourceNodeId);
    const targetExists = blockIds.has(connection.targetNodeId);
    
    if (!sourceExists || !targetExists) {
      issues.push(`Sheet ${sheetIndex}: Removed invalid connection (${connection.sourceNodeId} -> ${connection.targetNodeId})`);
      return false;
    }
    
    return true;
  });

  fixedSheet.connections = validConnections;

  // Ensure all blocks have required fields
  fixedSheet.blocks = fixedSheet.blocks.map((block: Block) => {
    let updatedBlock = { ...block };
    
    if (!updatedBlock.type) {
      updatedBlock.type = 'unknown';
      issues.push(`Sheet ${sheetIndex}: Set default type for block "${block.id}"`);
    }
    
    if (!updatedBlock.position) {
      updatedBlock.position = { x: 0, y: 0 };
      issues.push(`Sheet ${sheetIndex}: Set default position for block "${block.id}"`);
    }
    
    if (!updatedBlock.data) {
      updatedBlock.data = { label: 'Untitled Block' };
      issues.push(`Sheet ${sheetIndex}: Set default data for block "${block.id}"`);
    }
    
    return updatedBlock;
  });

  return { fixedSheet, issues };
}

/**
 * Clean and normalize a model for consistent state
 */
export function normalizeModel(model: Model): Model {
  // First fix integrity issues
  const { model: fixedModel } = fixModelIntegrity(model);
  
  // Then normalize the structure
  const normalizedModel = {
    ...fixedModel,
    updatedAt: new Date().toISOString(),
    sheets: fixedModel.sheets.map(sheet => ({
      ...sheet,
      blocks: sheet.blocks.map(block => ({
        ...block,
        // Ensure position has integer values
        position: {
          x: Math.round(block.position?.x || 0),
          y: Math.round(block.position?.y || 0)
        }
      }))
    }))
  };
  
  return normalizedModel;
}