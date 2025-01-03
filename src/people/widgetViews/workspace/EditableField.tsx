import React from 'react';
import { renderMarkdown } from 'people/utils/RenderMarkdown';
import { TicketTextAreaComp } from 'components/common/TicketEditor/TicketTextArea';
import { useStores } from 'store';
import { PreviewButtonGroup } from './style';
import { SwitcherContainer, SwitcherButton, EmptyState } from './style';

interface EditableFieldProps {
  value: string;
  setValue: (value: string) => void;
  isEditing: boolean;
  previewMode: 'preview' | 'edit';
  setPreviewMode: (mode: 'preview' | 'edit') => void;
  placeholder?: string;
  dataTestIdPrefix?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  setValue,
  isEditing,
  previewMode,
  setPreviewMode,
  placeholder,
  dataTestIdPrefix
}: EditableFieldProps) => {
  const { ui } = useStores();

  if (!isEditing) {
    if (!value?.trim()) {
      return <EmptyState>{`No ${placeholder?.toLowerCase() ?? 'content'} yet`}</EmptyState>;
    }
    return <div className="p-4">{renderMarkdown(value)}</div>;
  }

  return (
    <>
      <PreviewButtonGroup>
        <SwitcherContainer>
          <SwitcherButton
            isActive={previewMode === 'preview'}
            onClick={() => setPreviewMode('preview')}
          >
            Preview
          </SwitcherButton>
          <SwitcherButton isActive={previewMode === 'edit'} onClick={() => setPreviewMode('edit')}>
            Edit
          </SwitcherButton>
        </SwitcherContainer>
      </PreviewButtonGroup>
      {previewMode === 'edit' ? (
        <TicketTextAreaComp
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          ui={ui}
          data-testid={`${dataTestIdPrefix}-textarea`}
        />
      ) : (
        <div className="p-4 border rounded-md">
          {value?.trim()
            ? renderMarkdown(value)
            : `No ${placeholder?.toLowerCase() ?? 'content'} yet`}
        </div>
      )}
    </>
  );
};
