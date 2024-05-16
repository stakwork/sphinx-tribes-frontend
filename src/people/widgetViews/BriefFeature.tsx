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
  TextArea,
  ButtonWrap,
  ActionButton
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { Feature } from 'store/main';
import MaterialIcon from '@material/react-material-icon';

const BriefFeatureComponent = () => {
  const { main, ui } = useStores();
  const { uuid } = useParams<{ uuid: string }>();
  const [featureData, setFeatureData] = useState<Feature>();
  const [loading, setLoading] = useState(true);
  const [displayBrief, setDidplayBrief] = useState(false);
  const [editBrief, setEditBrief] = useState(false);
  const [brief, setBrief] = useState(featureData?.brief);

  const getFeatureData = useCallback(async () => {
    if (!uuid) return;
    console.log('uuid: ', uuid);
    const featureData = await main.getUserFeatureByUuid(uuid);
    if (!featureData) return;
    setFeatureData(featureData);

    setLoading(false);
  }, [uuid, main]);

  useEffect(() => {
    getFeatureData();
  }, [getFeatureData]);

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

  const editBriefActions = () => {
    setEditBrief(!editBrief);
    setDidplayBrief(false);
  };

  const briefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length) {
      setBrief(newValue);
    }
  };

  const submitBrief = async () => {
    const body = {
      brief: brief ?? '',
      uuid: featureData?.uuid ?? '',
      workspace_uuid: featureData?.workspace_uuid ?? ''
    };
    await main.addOrUpdateFeature(body);
    await getFeatureData();
    setEditBrief(false);
  };

  return (
    !loading && (
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
          <FieldWrap>
            <Label>Feature Brief</Label>
            <Data>
              <OptionsWrap>
                <MaterialIcon
                  icon={'more_horiz'}
                  className="MaterialIcon"
                  onClick={() => setDidplayBrief(!displayBrief)}
                  data-testid="brief-option-btn"
                />
                <button
                  style={{ display: displayBrief ? 'block' : 'none' }}
                  onClick={editBriefActions}
                  data-testid="brief-edit-btn"
                >
                  Edit
                </button>
              </OptionsWrap>
              {!editBrief && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: featureData?.brief
                      ? featureData.brief.replace(/\n/g, '<br/>')
                      : 'No brief yet'
                  }}
                />
              )}

              {editBrief && (
                <>
                  <TextArea
                    placeholder="Enter Brief"
                    onChange={briefChange}
                    value={brief ?? featureData?.brief}
                    data-testid="brief-textarea"
                    rows={10}
                    cols={50}
                  />
                  <ButtonWrap>
                    <ActionButton
                      onClick={() => setEditBrief(!editBrief)}
                      data-testid="brief-cancel-btn"
                    >
                      Cancel
                    </ActionButton>
                    <ActionButton
                      color="primary"
                      onClick={submitBrief}
                      data-testid="brief-update-btn"
                    >
                      Update
                    </ActionButton>
                  </ButtonWrap>
                </>
              )}
            </Data>
          </FieldWrap>
        </DataWrap>
        {toastsEl}
      </FeatureBody>
    )
  );
};

export default BriefFeatureComponent;
