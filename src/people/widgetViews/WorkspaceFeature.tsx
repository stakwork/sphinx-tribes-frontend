import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import {
  Body,
  FeatureBody,
  DataWrap,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  TextArea,
  InputField,
  Input
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import history from 'config/history';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { Feature, FeatureStory } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import {
  ActionButton,
  ButtonWrap,
  HeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  WorkspaceOption,
  UserStoryField, UserStoryFields
} from './workspace/style';

type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

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

const WorkspaceEditableField = ({
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
          {displayOptions && (
            <WorkspaceOption>
              <ul>
                <li data-testid={`${dataTestIdPrefix}-edit-btn`} onClick={handleEditClick}>
                  Edit
                </li>
              </ul>
            </WorkspaceOption>
          )}
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
  const [userStory, setUserStory] = useState<string>('');
  const [userStoryPriority, setUserStoryPriority] = useState<number>(0);
  const [featureStories, setFeatureStories] = useState<FeatureStory[] | undefined>([]);
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

  const getFeatureStoryData = useCallback(async (): Promise<void> => {
    if (!feature_uuid) return;
    const data = await main.getFeatureStories(feature_uuid);

    setUserStoryPriority(data?.length as number);
    setFeatureStories(data);

    setLoading(false);
  }, [feature_uuid, main]);

  useEffect(() => {
    getFeatureData();
    getFeatureStoryData();
  }, [getFeatureData, getFeatureStoryData]);

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

  const handleUserStorySubmit = async () => {
    const body = {
      feature_uuid: feature_uuid ?? '',
      description: userStory,
      priority: userStoryPriority
    };
    await main.addFeatureStory(body);
    await getFeatureStoryData();
    setUserStory('');
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserStory(e.target.value);
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
      <FeatureHeadWrap>
        <HeadNameWrap>
          <MaterialIcon
            onClick={() => history.goBack()}
            icon={'arrow_back'}
            style={{
              fontSize: 25,
              cursor: 'pointer'
            }}
          />
          <WorkspaceName>{featureData?.name}</WorkspaceName>
        </HeadNameWrap>
      </FeatureHeadWrap>
      <DataWrap>
        <FieldWrap>
          <Label>User Stories</Label>
          <Data>
            <InputField>
              <Input
                placeholder="Enter Story"
                onChange={handleChange}
                value={userStory}
                data-testid="story-input"
              />

              <ActionButton
                marginTop="0"
                height="30px"
                color="cancel"
                onClick={handleUserStorySubmit}
                data-testid="story-input-update-btn"
              >
                Create
              </ActionButton>
            </InputField>

            <UserStoryFields>
              {featureStories?.map((story: FeatureStory) => (
                <UserStoryField key={story.id}>
                  <MaterialIcon icon="more_vert" />
                  <span>{story.description}</span>
                </UserStoryField>
              ))}
            </UserStoryFields>
          </Data>
        </FieldWrap>

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
      </DataWrap>
      {toastsEl}
    </FeatureBody>
  );
};

export default WorkspaceFeature;
