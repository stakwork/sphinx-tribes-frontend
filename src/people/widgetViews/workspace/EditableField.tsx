import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderMarkdown } from 'people/utils/RenderMarkdown';
import { TicketTextAreaComp } from 'components/common/TicketEditor/TicketTextArea';
import { useStores } from 'store';
import { snippetStore } from 'store/snippetStore';
import { SnippetDropdown } from 'components/form/inputs/SnippetDropDown';
import {
  PreviewButtonGroup,
  SwitcherContainer,
  SwitcherButton,
  EmptyState,
  SnippetContainer,
  ActionButtonGroup,
  ActionButton
} from './style';

interface EditableFieldProps {
  value: string;
  setValue: (value: string) => void;
  isEditing: boolean;
  previewMode: 'preview' | 'edit';
  setPreviewMode: (mode: 'preview' | 'edit') => void;
  placeholder?: string;
  dataTestIdPrefix?: string;
  workspaceUUID?: string;
  onCancel: () => void;
  onUpdate: () => void;
  defaultHeight?: string;
}

const PreviewContainer = styled.div<{ height?: string }>`
  height: ${(props: { height?: string }) => props.height || ''};
  overflow-y: auto;
  background-color: white;
  padding: 1rem;
  border: 2px solid #dde1e5;
  border-radius: 0.375rem;
  position: relative;
`;

const ExpandText = styled.span`
  color: #3b82f6;
  cursor: pointer;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

const ExpandTextLeft = styled.span`
  color: #3b82f6;
  cursor: pointer;
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  setValue,
  isEditing,
  previewMode,
  setPreviewMode,
  placeholder,
  dataTestIdPrefix,
  workspaceUUID,
  onCancel,
  onUpdate // defaultHeight
}: EditableFieldProps) => {
  const [originalValue, setOriginalValue] = useState(value);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { ui } = useStores();

  useEffect(() => {
    setOriginalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (newValue: string) => {
    setValue(newValue);
    setHasChanges(newValue !== originalValue);
  };

  const handleCancel = () => {
    setValue(originalValue);
    setHasChanges(false);
    onCancel?.();
    setPreviewMode('preview');
  };

  const handleUpdate = async () => {
    await onUpdate?.();
    setOriginalValue(value);
    setHasChanges(false);
    setPreviewMode('preview');
  };

  useEffect(() => {
    if (workspaceUUID) {
      snippetStore.loadSnippets(workspaceUUID);
    }
  }, [workspaceUUID]);

  const snippets = snippetStore.getAllSnippets();

  const filteredSnippets = snippets.map((p: any) => ({
    value: p.id,
    label: p.title,
    snippet: p.snippet
  }));

  const handleSnippetSelect = (snippet: string) => {
    setValue(value ? `${value}\n${snippet}` : snippet);
  };

  if (!isEditing) {
    if (!value?.trim()) {
      return <EmptyState>{`No ${placeholder?.toLowerCase() ?? 'content'} yet`}</EmptyState>;
    }
    return (
      <PreviewContainer height={isExpanded ? 'auto' : '40px'}>
        {isExpanded && renderMarkdown(value)}
        {!isExpanded && (
          <ExpandTextLeft onClick={() => setIsExpanded(!isExpanded)}>Expand</ExpandTextLeft>
        )}
      </PreviewContainer>
    );
  }

  return (
    <>
      <ButtonContainer>
        {isExpanded && previewMode !== 'edit' && (
          <ExpandText onClick={() => setIsExpanded(!isExpanded)}>
            <span>-</span>
            Collapse
          </ExpandText>
        )}
        {isExpanded && (
          <PreviewButtonGroup>
            {previewMode === 'edit' && (
              <SnippetContainer>
                <SnippetDropdown items={filteredSnippets} onSelect={handleSnippetSelect} />
              </SnippetContainer>
            )}
            <ActionButtonGroup>
              <ActionButton
                onClick={handleCancel}
                data-testid={`${dataTestIdPrefix}-cancel-btn`}
                color="cancel"
                style={{ display: hasChanges ? 'block' : 'none' }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                color="primary"
                onClick={handleUpdate}
                data-testid={`${dataTestIdPrefix}-update-btn`}
                style={{ display: hasChanges ? 'block' : 'none' }}
              >
                Update
              </ActionButton>
              <SwitcherContainer>
                <SwitcherButton
                  isActive={previewMode === 'preview'}
                  data-testid={`${dataTestIdPrefix}-preview-btn`}
                  onClick={() => setPreviewMode('preview')}
                >
                  View
                </SwitcherButton>
                <SwitcherButton
                  isActive={previewMode === 'edit'}
                  data-testid={`${dataTestIdPrefix}-edit-btn`}
                  onClick={() => setPreviewMode('edit')}
                >
                  Edit
                </SwitcherButton>
              </SwitcherContainer>
            </ActionButtonGroup>
          </PreviewButtonGroup>
        )}
      </ButtonContainer>

      {previewMode === 'edit' ? (
        <TicketTextAreaComp
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          ui={ui}
          data-testid={`${dataTestIdPrefix}-textarea`}
        />
      ) : (
        <PreviewContainer height={isExpanded ? 'auto' : '40px'}>
          {isExpanded &&
            (value?.trim()
              ? renderMarkdown(value)
              : `No ${placeholder?.toLowerCase() ?? 'content'} yet`)}
          {!isExpanded && (
            <ExpandTextLeft onClick={() => setIsExpanded(!isExpanded)}>+ Expand</ExpandTextLeft>
          )}
        </PreviewContainer>
      )}
    </>
  );
};
