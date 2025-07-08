import React, { useState } from 'react';
import styled from 'styled-components';
import { WorkspaceEnvVarsModalProps, EnvVar } from './interface';
import { Button, Modal } from '../../../components/common';
// TODO: If you see errors about 'react-feather', run: npm install react-feather

const ModalContainer = styled.div`
  width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
`;

const AddButton = styled(Button)`
  margin-top: 1rem;
`;

const WorkspaceEnvVarsModal: React.FC<WorkspaceEnvVarsModalProps> = ({ isOpen, close, org, envVars: initialEnvVars, onSave, addToast }) => {
  const [envVars, setEnvVars] = useState<EnvVar[]>(initialEnvVars || []);
  const [showValue, setShowValue] = useState<{ [key: number]: boolean }>({});

  const handleChange = (idx: number, field: 'name' | 'value', value: string) => {
    setEnvVars((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const handleAdd = () => {
    setEnvVars((prev) => [...prev, { name: '', value: '', masked: false }]);
  };

  const handleDelete = (idx: number) => {
    setEnvVars((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleShow = (idx: number) => {
    setShowValue((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSave = () => {
    // Only send env vars where value is not masked (i.e., not like 'as*******sa')
    const toSend = envVars.filter((v) => !v.masked || (v.value && !/\*+/.test(v.value)));
    onSave(toSend);
  };

  return (
    <Modal visible={isOpen} close={close}>
      <ModalContainer>
        {envVars.map((env, idx) => (
          <Row key={idx}>
            <Input
              type="text"
              placeholder="Key"
              value={env.name}
              onChange={(e) => handleChange(idx, 'name', e.target.value)}
              autoComplete="off"
            />
            <Input
              type={showValue[idx] ? 'text' : 'password'}
              placeholder="Value"
              value={env.value}
              onChange={(e) => handleChange(idx, 'value', e.target.value)}
              autoComplete="new-password"
            />
            <IconButton onClick={() => handleToggleShow(idx)}>
              {showValue[idx] ? <span role="img" aria-label="hide">🙈</span> : <span role="img" aria-label="show">👁️</span>}
            </IconButton>
            <IconButton onClick={() => handleDelete(idx)}>
              <span role="img" aria-label="delete">🗑️</span>
            </IconButton>
          </Row>
        ))}
        <AddButton onClick={handleAdd}>
          <span><span style={{ marginRight: 4 }} role="img" aria-label="add">➕</span>Add Variable</span>
        </AddButton>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <Button onClick={close} style={{ marginRight: 8 }}><span>Cancel</span></Button>
          <Button onClick={handleSave}><span>Save</span></Button>
        </div>
      </ModalContainer>
    </Modal>
  );
};

export default WorkspaceEnvVarsModal; 