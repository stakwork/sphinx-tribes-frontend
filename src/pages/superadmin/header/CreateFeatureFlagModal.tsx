import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { mainStore } from '../../../store/main';
import { Modal } from '../../../components/common';
import { FeatureFlag } from '../../../store/interface';

interface CreateFeatureFlagProps {
  open: boolean;
  close: () => void;
  onSuccess: () => void;
  addToast?: (title: string, color: 'success' | 'error') => void;
  editData?: FeatureFlag | null;
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  background: white;
  border-radius: 10px;
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #2d2d2d;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d2d2d;
  font-size: 14px;

  span.required {
    color: #ff4d4f;
    margin-left: 4px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #9157f6;
    box-shadow: 0 0 0 2px rgba(145, 87, 246, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  min-height: 100px;
  font-size: 14px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #9157f6;
    box-shadow: 0 0 0 2px rgba(145, 87, 246, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin: 0;
  }
`;

const EndpointList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EndpointItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RemoveButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #d9d9d9;
  }
`;

const AddButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #9157f6;
  border-radius: 6px;
  background: white;
  color: #9157f6;
  cursor: pointer;
  font-size: 14px;
  margin-top: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(145, 87, 246, 0.05);
  }
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #9157f6;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;

  &:hover {
    background: #7c3dde;
  }

  &:disabled {
    background: #e6e6e6;
    cursor: not-allowed;
  }
`;

const CreateFeatureFlagModal = ({
  open,
  close,
  onSuccess,
  addToast,
  editData
}: CreateFeatureFlagProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [endpoints, setEndpoints] = useState(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);
      setEnabled(editData.enabled);
      setEndpoints(editData.endpoints.map((ep: any) => ep.path));
    } else {
      setName('');
      setDescription('');
      setEnabled(false);
      setEndpoints(['']);
    }
  }, [editData, open]);

  const handleAddEndpoint = () => {
    setEndpoints([...endpoints, '']);
  };

  const handleEndpointChange = (index: number, value: string) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index] = value;
    setEndpoints(newEndpoints);
  };

  const handleRemoveEndpoint = (index: number) => {
    const newEndpoints = endpoints.filter((_endpoint: string, i: number) => i !== index);
    setEndpoints(newEndpoints);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      if (addToast) addToast('Name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const filteredEndpoints = endpoints.filter((endpoint: string) => endpoint.trim() !== '');
      const data = {
        name: name.trim(),
        description: description.trim(),
        enabled,
        endpoints: filteredEndpoints
      };

      let response;
      if (editData) {
        response = await mainStore.updateFeatureFlagDetails(editData.uuid, data);
      } else {
        response = await mainStore.createFeatureFlag(data);
      }

      if (response?.success) {
        if (addToast)
          addToast(`Feature flag ${editData ? 'updated' : 'created'} successfully`, 'success');
        onSuccess();
        close();
      } else {
        if (addToast) addToast(`Failed to ${editData ? 'update' : 'create'} feature flag`, 'error');
      }
    } catch (error) {
      if (addToast) addToast(`Failed to ${editData ? 'update' : 'create'} feature flag`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={open}
      style={{
        height: '100%',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto'
      }}
      envStyle={{
        background: 'white',
        zIndex: 20,
        maxHeight: '90vh',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px'
      }}
      overlayClick={close}
      bigCloseImage={close}
    >
      <Wrapper>
        <ModalTitle>{editData ? 'Edit' : 'Create'} Feature Flag</ModalTitle>
        <FormGroup>
          <Label>
            Name <span className="required">*</span>
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Enter feature flag name"
          />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <TextArea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Enter feature flag description"
          />
        </FormGroup>
        <FormGroup>
          <CheckboxContainer>
            <Input
              type="checkbox"
              checked={enabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnabled(e.target.checked)}
            />
            Enabled
          </CheckboxContainer>
        </FormGroup>
        <FormGroup>
          <Label>Endpoints</Label>
          <EndpointList>
            {endpoints.map((endpoint: string, index: number) => (
              <EndpointItem key={index}>
                <Input
                  type="text"
                  value={endpoint}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleEndpointChange(index, e.target.value)
                  }
                  placeholder="Enter endpoint path"
                />
                <RemoveButton onClick={() => handleRemoveEndpoint(index)}>Remove</RemoveButton>
              </EndpointItem>
            ))}
          </EndpointList>
          <AddButton onClick={handleAddEndpoint}>Add Endpoint</AddButton>
        </FormGroup>
        <CreateButton onClick={handleSubmit} disabled={loading}>
          {loading ? (editData ? 'Updating...' : 'Creating...') : editData ? 'Update' : 'Create'}{' '}
          Feature Flag
        </CreateButton>
      </Wrapper>
    </Modal>
  );
};

export default CreateFeatureFlagModal;
