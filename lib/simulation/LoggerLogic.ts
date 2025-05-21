// lib/simulation/loggerLogic.ts
import { LogEntry } from '@/components/blocks/nodes/LoggerNode';
import { SimulationState } from './simulationEngine';

/**
 * Process a new value for a logger block
 * @param blockId - The ID of the logger block
 * @param value - The input value to log
 * @param time - The current simulation time
 * @param maxEntries - Maximum number of entries to keep
 * @param logs - Existing log entries
 * @returns Updated logs array
 */
export const processLoggerValue = (
  blockId: string,
  value: any,
  time: number,
  maxEntries: number = 100,
  logs: LogEntry[] = []
): LogEntry[] => {
  // Create a new log entry
  const newEntry: LogEntry = {
    time,
    value
  };
  
  // Add to logs array
  const updatedLogs = [...logs, newEntry];
  
  // Trim to max entries if needed
  if (updatedLogs.length > maxEntries) {
    return updatedLogs.slice(updatedLogs.length - maxEntries);
  }
  
  return updatedLogs;
};

/**
 * Export logger data to CSV format
 * @param logs - Log entries to export
 * @param blockName - Name of the logger block for the filename
 * @returns CSV content as a string
 */
export const exportLogsToCSV = (logs: LogEntry[], blockName: string = 'logger'): string => {
  // Create CSV header
  const header = 'Time,Value\n';
  
  // Convert each log entry to a CSV row
  const rows = logs.map(entry => `${entry.time},${entry.value}`).join('\n');
  
  // Combine header and rows
  return header + rows;
};

/**
 * Download logs as a CSV file
 * @param logs - Log entries to download
 * @param blockName - Name of the logger block for the filename
 */
export const downloadLogsAsCSV = (logs: LogEntry[], blockName: string = 'logger'): void => {
  // Generate CSV content
  const csvContent = exportLogsToCSV(logs, blockName);
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download URL
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${blockName}_logs.csv`);
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Clear all logs for a logger block
 * @param blockId - The ID of the logger block
 * @param simulationState - Current simulation state
 * @param updateNodeCallback - Callback to update node data
 */
export const clearLoggerLogs = (
  blockId: string,
  simulationState: SimulationState,
  updateNodeCallback: (nodeId: string, newData: any) => void
): void => {
  // Update the block with empty logs
  updateNodeCallback(blockId, { logs: [] });
  
  // Clear logs in simulation state as well
  if (simulationState.logs.has(blockId)) {
    simulationState.logs.set(blockId, []);
  }
};

/**
 * Toggle recording state for a logger
 * @param blockId - The ID of the logger block
 * @param isRecording - Current recording state
 * @param updateNodeCallback - Callback to update node data
 * @returns New recording state
 */
export const toggleLoggerRecording = (
  blockId: string,
  isRecording: boolean,
  updateNodeCallback: (nodeId: string, newData: any) => void
): boolean => {
  // Toggle recording state
  const newRecordingState = !isRecording;
  
  // Update the block
  updateNodeCallback(blockId, { recording: newRecordingState });
  
  return newRecordingState;
};