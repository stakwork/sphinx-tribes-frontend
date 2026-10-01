import React, { useState } from 'react';
import { EnvVarsModal } from './EnvVarsModal';

export const WorkspaceSettings: React.FC = () => {
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Workspace Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium">Environment Variables</h3>
          <p className="text-sm text-gray-500">Manage the secrets and config for your workspace.</p>
        </div>
        <button 
          onClick={() => setIsEnvModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Manage Variables
        </button>
      </div>

      <EnvVarsModal 
        isOpen={isEnvModalOpen} 
        onClose={() => setIsEnvModalOpen(false)} 
      />
    </div>
  );
};
