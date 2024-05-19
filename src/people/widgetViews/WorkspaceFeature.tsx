import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import {
  Body,
  FeatureBody,
  FeatureLabel,
  FeatureName,
  Leftheader,
  Header,
  HeaderWrap,
  DataWrap,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  TextArea
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { Feature } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { ActionButton, ButtonWrap } from './workspace/style';

type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

interface EditableFieldProps {
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

const WorkspaceEditableField: React.FC<EditableFieldProps> = ({
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
}) => {
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

const WorkspaceFeature: React.FC = () => {
  const { main, ui } = useStores();
  const { feature_uuid } = useParams<{ feature_uuid: string }>();
  const [featureData, setFeatureData] = useState<Feature | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [brief, setBrief] = useState<string>('');
  const [architecture, setArchitecture] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [editBrief, setEditBrief] = useState<boolean>(false);
  const [editArchitecture, setEditArchitecture] = useState<boolean>(false);
  const [editRequirements, setEditRequirements] = useState<boolean>(false);
  const [displayBriefOptions, setDisplayBriefOptions] = useState<boolean>(false);
  const [displayArchitectureOptions, setDisplayArchitectureOptions] = useState<boolean>(false);
  const [displayRequirementsOptions, setDisplayRequirementsOptions] = useState<boolean>(false);

  const getFeatureData = useCallback(async (): Promise<void> => {
    if (!feature_uuid) return;
    const data = await main.getFeaturesByUuid(feature_uuid);

    if (data) {
      setFeatureData(data);
      setBrief(data.brief);
      setArchitecture(data.architecture);
      setRequirements(data.requirements);
    }
    setLoading(false);
  }, [feature_uuid, main]);

  useEffect(() => {
    getFeatureData();
  }, [getFeatureData]);

  const submitField = async (
    field: string,
    value: string,
    setIsEditing: DispatchSetStateAction<boolean>
  ): Promise<void> => {
    const body = {
      [field]: value,
      uuid: featureData?.uuid ?? '',
      workspace_uuid: featureData?.workspace_uuid ?? ''
    };
    await main.addWorkspaceFeature(body);
    await getFeatureData();
    setIsEditing(false);
  };

  const toastsEl = (
    <EuiGlobalToastList
      toasts={ui.toasts}
      dismissToast={() => ui.setToasts([])}
      toastLifeTimeMs={3000}
    />
  );

  if (loading) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  return (
    <FeatureBody>
      <HeaderWrap>
        <Header>
          <Leftheader>
            <FeatureName>
              <FeatureLabel>{featureData?.name}</FeatureLabel>
            </FeatureName>
          </Leftheader>
        </Header>
      </HeaderWrap>
      <DataWrap>
        <WorkspaceEditableField
          label="Feature Brief"
          value={brief}
          setValue={setBrief}
          isEditing={editBrief}
          setIsEditing={setEditBrief}
          displayOptions={displayBriefOptions}
          setDisplayOptions={setDisplayBriefOptions}
          placeholder="Brief"
          dataTestIdPrefix="brief"
          onSubmit={() => submitField('brief', brief, setEditBrief)}
        />
        <WorkspaceEditableField
          label="Architecture"
          value={architecture}
          setValue={setArchitecture}
          isEditing={editArchitecture}
          setIsEditing={setEditArchitecture}
          displayOptions={displayArchitectureOptions}
          setDisplayOptions={setDisplayArchitectureOptions}
          placeholder="Architecture"
          dataTestIdPrefix="architecture"
          onSubmit={() => submitField('architecture', architecture, setEditArchitecture)}
        />
        <WorkspaceEditableField
          label="Requirements"
          value={requirements}
          setValue={setRequirements}
          isEditing={editRequirements}
          setIsEditing={setEditRequirements}
          displayOptions={displayRequirementsOptions}
          setDisplayOptions={setDisplayRequirementsOptions}
          placeholder="Requirements"
          dataTestIdPrefix="requirements"
          onSubmit={() => submitField('requirements', requirements, setEditRequirements)}
        />
      </DataWrap>
      {toastsEl}
    </FeatureBody>
  );
};

export default WorkspaceFeature;
