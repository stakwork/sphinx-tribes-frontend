import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { EnvVar } from '../../../store/interface';
import { mainStore } from '../../../store/main';
import { TextInput, ActionButton } from './style';
import { colors } from '../../../config/colors';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AddEnvHeader = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.875rem;
  margin-bottom: 0;
  min-width: 100%;

  @media only screen and (max-width: 500px) {
    text-align: center;
    font-size: 1.4rem;
  }
`;
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
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

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
      const toSend = envVars.filter((v) => v.value && !v.value.includes('*'));
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
          <AddEnvHeader>Environment Variables</AddEnvHeader>
          <p style={{ fontSize: '14px', color: 'gray', marginTop: '20px', marginBottom: '0px' }}>
            Add any ENV variables your Stakgraph integration needs. These will be included in your
            configuration
          </p>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table style={{ width: '100%', marginBottom: 16 }}>
              <tbody>
                {envVars.map((v, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingRight: '5px' }}>
                      <TextInput
                        placeholder="placeholder"
                        feature={true}
                        value={v.name}
                        onChange={(e: any) => handleEdit(idx, 'name', e.target.value)}
                        style={{ width: '100%', marginRight: '5px' }}
                      />
                    </td>
                    <td style={{ paddingRight: '5px' }}>
                      <TextInput
                        placeholder="placeholder"
                        feature={true}
                        value={v.value}
                        type={showPassword ? 'text' : 'password'}
                        onChange={(e) => handleEdit(idx, 'value', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <div
                        onClick={togglePasswordVisibility}
                        style={{
                          cursor: 'pointer',
                          translate: '-200%'
                        }}
                      >
                        {showPassword ? <FaEye as any /> : <FaEyeSlash as any />}
                      </div>
                    </td>
                    <td>
                      <ActionButton
                        onClick={() => handleDelete(idx)}
                        style={{
                          marginTop: '0px',
                          backgroundColor: colors.dark.grayish.G700,
                          color: 'black',
                          boxShadow: 'none'
                        }}
                      >
                        Remove
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <ActionButton
            onClick={handleAdd}
            style={{
              marginRight: 8,
              marginTop: 0,
              color: 'black',
              backgroundColor: colors.dark.grayish.G700,
              boxShadow: 'none'
            }}
          >
            Add Variable
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            disabled={saving}
            style={{ marginRight: 8, marginTop: 0 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </ActionButton>
          <ActionButton onClick={onClose} style={{ marginTop: 0 }}>
            Cancel
          </ActionButton>
          {/* TODO: Validation, error display, better styling, accessibility */}
        </div>
      </div>
    );
  }
);

export default WorkspaceEnvVarsModal;
