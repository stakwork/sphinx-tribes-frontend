import React, { useState } from 'react';
import { useWorkspaceEnvStore } from '../../store/useWorkspaceEnvStore';

interface EnvVarsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvVarsModal: React.FC<EnvVarsModalProps> = ({ isOpen, onClose }) => {
  const { envVars, addEnvVar, updateEnvVar, removeEnvVar } = useWorkspaceEnvStore();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newKey && newValue) {
      addEnvVar({ key: newKey, value: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Workspace Environment Variables</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
        </div>

        <div className="space-y-3 mb-6">
          {envVars.map((ev) => (
            <div key={ev.key} className="flex gap-2">
              <input 
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                value={ev.key} 
                disabled 
              />
              <input 
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
                value={ev.value} 
                onChange={(e) => updateEnvVar(ev.key, e.target.value)} 
              />
              <button 
                onClick={() => removeEnvVar(ev.key)} 
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input 
            placeholder="KEY" 
            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
            value={newKey} 
            onChange={(e) => setNewKey(e.target.value)} 
          />
          <input 
            placeholder="VALUE" 
            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600" 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)} 
          />
          <button 
            onClick={handleAdd} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
