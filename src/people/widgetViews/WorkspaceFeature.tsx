import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import {
  Body,
  FeatureBody,
  DataWrap,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  TextArea
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import history from 'config/history';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { mainStore } from 'store/main';
import { Feature } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import {
  ActionButton,
  ButtonWrap,
  HeadNameWrap,
  FeatureHeadWrap,
  WorkspaceName,
  WorkspaceOption
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
  main: typeof mainStore;
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
  onSubmit,
  main
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

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.persist();

    const clipboardItems: DataTransferItemList = e.clipboardData?.items as DataTransferItemList;
    const itemsArray: DataTransferItem[] = Array.from(clipboardItems);
    for (const item of itemsArray) {
      if (item.type.startsWith('image/')) {
        const imageFile = item.getAsFile();
        if (imageFile) {
          const formData = new FormData();
          formData.append('file', imageFile);
          const file = await main.uploadFile(formData);
          let img_url = '';
          if (file && file.ok) {
            img_url = await file.json();
          }
          setValue((prevValue: string) => `${prevValue}\n![Uploaded Image](${img_url})`);
        }
        e.preventDefault();
      }
    }
  };

  const parseValue = (input: string | null): string => {
    if (!input) {
      return `No ${label.toLowerCase()} yet`;
    }

    // Regex to detect markdown image syntax ![alt text](url)
    const imageMarkdownRegex = /!\[.*?\]\((.*?)\)/g;

    // Replace the markdown image syntax with HTML <img> tag
    return input
      .replace(imageMarkdownRegex, (match: string, p1: string) => {
        return `<img src="${p1}" alt="Uploaded Image" />`;
      })
      .replace(/\n/g, '<br/>');
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
            style={{
              overflowY: 'auto'
            }}
            dangerouslySetInnerHTML={{
              __html: parseValue(value)
            }}
          />
        ) : (
          <>
            <TextArea
              placeholder={`Enter ${placeholder}`}
              onChange={handleChange}
              onPaste={handlePaste}
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
          main={main}
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
          main={main}
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
          main={main}
        />
      </DataWrap>
      {toastsEl}
    </FeatureBody>
  );
};

export default WorkspaceFeature;
