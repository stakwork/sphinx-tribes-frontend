import MaterialIcon from '@material/react-material-icon';
import { FieldWrap, Label, Data, OptionsWrap, TextArea } from 'pages/tickets/style';
import { ButtonWrap, ActionButton } from 'people/widgetViews/workspace/style';
import React from 'react';


export type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

interface WSEditableFieldProps {
  label: string;
  value: string;
  setValue: DispatchSetStateAction<string>;
  isEditing: boolean;
  setIsEditing: DispatchSetStateAction<boolean>;
  displayOptions: boolean;
  setDisplayOptions: DispatchSetStateAction<boolean>;
  placeholder: string;
  dataTestIdPrefix: string;
  onSubmit: () => Promise<void>;
}

export const WorkspaceEditableField = ({
  label,
  value,
  setValue,
  isEditing,
  setIsEditing,
  displayOptions,
  setDisplayOptions,
  placeholder,
  dataTestIdPrefix,
  onSubmit
}: WSEditableFieldProps) => {
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setDisplayOptions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <FieldWrap>
      <Label>{label}</Label>
      <Data>
        <OptionsWrap>
          <MaterialIcon
            icon="more_horiz"
            className="MaterialIcon"
            onClick={() => setDisplayOptions(!displayOptions)}
            data-testid={`${dataTestIdPrefix}-option-btn`}
          />
          <button
            style={{ display: displayOptions ? 'block' : 'none' }}
            onClick={handleEditClick}
            data-testid={`${dataTestIdPrefix}-edit-btn`}
          >
            Edit
          </button>
        </OptionsWrap>
        {!isEditing ? (
          <div
            dangerouslySetInnerHTML={{
              __html: value ? value.replace(/\n/g, '<br/>') : `No ${label.toLowerCase()} yet`
            }}
          />
        ) : (
          <>
            <TextArea
              placeholder={`Enter ${placeholder}`}
              onChange={handleChange}
              value={value}
              data-testid={`${dataTestIdPrefix}-textarea`}
              rows={10}
              cols={50}
            />
            <ButtonWrap>
              <ActionButton
                onClick={handleCancelClick}
                data-testid={`${dataTestIdPrefix}-cancel-btn`}
                color="cancel"
              >
                Cancel
              </ActionButton>
              <ActionButton
                color="primary"
                onClick={onSubmit}
                data-testid={`${dataTestIdPrefix}-update-btn`}
              >
                Update
              </ActionButton>
            </ButtonWrap>
          </>
        )}
      </Data>
    </FieldWrap>
  );
};


