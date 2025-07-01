import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../../../config/colors';
import { Button } from '../../../components/common';

const ModalContent = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 500px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #3c3f41;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #3c3f41;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #dde1e5;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Barlow', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #618aff;
    box-shadow: 0 0 0 2px rgba(97, 138, 255, 0.1);
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #dde1e5;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Barlow', sans-serif;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #618aff;
    box-shadow: 0 0 0 2px rgba(97, 138, 255, 0.1);
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const ErrorText = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

interface EnvironmentVariableModalProps {
  closeHandler: () => void;
  modalType: 'add' | 'edit';
  currentVariable: {
    id?: string;
    key: string;
    value: string;
  };
  onSave: (id: string, key: string, value: string) => void;
  existingKeys: string[];
}

const EnvironmentVariableModal: React.FC<EnvironmentVariableModalProps> = ({
  closeHandler,
  modalType,
  currentVariable,
  onSave,
  existingKeys
}) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<{key?: string; value?: string}>({});

  useEffect(() => {
    setKey(currentVariable.key || '');
    setValue(currentVariable.value || '');
    setErrors({});
  }, [currentVariable]);

  const validateForm = () => {
    const newErrors: {key?: string; value?: string} = {};

    // Validate key
    if (!key.trim()) {
      newErrors.key = 'Variable name is required';
    } else if (!/^[A-Z_][A-Z0-9_]*$/i.test(key.trim())) {
      newErrors.key = 'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores';
    } else if (modalType === 'add' && existingKeys.includes(key.trim())) {
      newErrors.key = 'A variable with this name already exists';
    } else if (modalType === 'edit' && existingKeys.includes(key.trim()) && key.trim() !== currentVariable.key) {
      newErrors.key = 'A variable with this name already exists';
    }

    // Validate value
    if (!value.trim()) {
      newErrors.value = 'Variable value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      if (modalType === 'add') {
        onSave('', key.trim(), value.trim());
      } else {
        onSave(currentVariable.id || '', key.trim(), value.trim());
      }
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
    if (errors.key) {
      setErrors(prev => ({...prev, key: undefined}));
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (errors.value) {
      setErrors(prev => ({...prev, value: undefined}));
    }
  };

  return (
    <ModalContent>
      <ModalTitle>
        {modalType === 'add' ? 'Add Environment Variable' : 'Edit Environment Variable'}
      </ModalTitle>
      
      <FormGroup>
        <Label>Variable Name</Label>
        <Input
          type="text"
          value={key}
          onChange={handleKeyChange}
          placeholder="e.g., API_URL, DATABASE_NAME"
          className={errors.key ? 'error' : ''}
        />
        <HelpText>
          Use uppercase letters, numbers, and underscores. Start with a letter or underscore.
        </HelpText>
        {errors.key && <ErrorText>{errors.key}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label>Variable Value</Label>
        <TextArea
          value={value}
          onChange={handleValueChange}
          placeholder="Enter the value for this environment variable"
          className={errors.value ? 'error' : ''}
        />
        <HelpText>
          The value that will be assigned to this environment variable.
        </HelpText>
        {errors.value && <ErrorText>{errors.value}</ErrorText>}
      </FormGroup>

      <ButtonGroup>
        <Button
          onClick={closeHandler}
          text="Cancel"
          color="white"
          style={{ minWidth: '100px' }}
        />
        <Button
          onClick={handleSave}
          text={modalType === 'add' ? 'Add Variable' : 'Save Changes'}
          color="primary"
          style={{ minWidth: '120px' }}
        />
      </ButtonGroup>
    </ModalContent>
  );
};

export default EnvironmentVariableModal;