import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { EnvVar } from '../../../store/interface';
import { mainStore } from '../../../store/main';

interface WorkspaceEnvVarsModalProps {
  open: boolean;
  onClose: () => void;
  workspaceUuid: string;
}

const defaultEnvVar = (): EnvVar => ({ name: '', value: '', masked: false, _edited: true });

const WorkspaceEnvVarsModal: React.FC<WorkspaceEnvVarsModalProps> = observer(
  ({ open, onClose, workspaceUuid }) => {
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (open && workspaceUuid) {
        setLoading(true);
        mainStore
          .getWorkspaceEnvVars(workspaceUuid)
          .then((vars) => setEnvVars(vars.map((v) => ({ ...v, _edited: false, _show: false }))))
          .finally(() => setLoading(false));
      }
    }, [open, workspaceUuid]);

    if (!open) return null;
    const handleAdd = () => {
      setEnvVars([...envVars, { ...defaultEnvVar(), _show: false }]);
    };

    const handleEdit = (idx: number, field: 'name' | 'value', value: string) => {
      setEnvVars(envVars.map((v, i) => (i === idx ? { ...v, [field]: value, _edited: true } : v)));
    };

    const handleDelete = (idx: number) => {
      setEnvVars(envVars.filter((_, i) => i !== idx));
    };

    const handleToggleShow = (idx: number) => {
      setEnvVars(envVars.map((v, i) => (i === idx ? { ...v, _show: !v._show } : v)));
    };

    const handleSave = async () => {
      setSaving(true);
      // Only send new/changed values (not masked/unchanged)
      const toSend = envVars.filter((v) => v._edited && v.value && !v.value.includes('*'));
      try {
        await mainStore.updateWorkspaceEnvVars(workspaceUuid, toSend);
        onClose();
      } catch (e) {
        // TODO: error handling
        alert('Failed to save env vars');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div
        className="modal-backdrop"
        style={{
          background: 'rgba(0,0,0,0.3)',
          zIndex: 1000,
					display: 'flex',
					alignItems: 'center'
        }}
      >
        <div
          className="modal"
          style={{
					position: 'relative',
            background: '#fff',
            margin: '5% auto',
            padding: 24,
            borderRadius: 8,
            maxWidth: 600,
            minWidth: 320,
            display: 'block',
						height: 'auto'
          }}
        >
          <h2>Workspace Environment Variables</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table style={{ width: '100%', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {envVars.map((v, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleEdit(idx, 'name', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input
                        type={v._show ? 'text' : 'password'}
                        value={v.value}
                        onChange={(e) => handleEdit(idx, 'value', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleShow(idx)}
                        title={v._show ? 'Hide' : 'Show'}
                      >
                        {v._show ? '🙈' : '👁️'}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(idx)} style={{ color: 'red' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={handleAdd} style={{ marginRight: 8 }}>
            Add
          </button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </button>
          {/* TODO: Validation, error display, better styling, accessibility */}
        </div>
      </div>
    );
  }
);

export default WorkspaceEnvVarsModal;
