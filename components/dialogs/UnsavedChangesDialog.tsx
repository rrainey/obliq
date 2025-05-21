// components/dialogs/UnsavedChangesDialog.tsx - LLM-generated code
'use client';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
  modelName: string;
  isSaving?: boolean;
}

export default function UnsavedChangesDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  modelName,
  isSaving = false
}: UnsavedChangesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Unsaved Changes</h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            You have unsaved changes in <strong>"{modelName}"</strong>.
          </p>
          <p className="text-gray-600 text-sm">
            What would you like to do with your changes?
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            Discard Changes
          </button>
          
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}