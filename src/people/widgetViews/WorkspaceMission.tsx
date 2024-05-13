import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import { Body, WorkspaceBody } from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { Workspace } from 'store/main';
import MaterialIcon from '@material/react-material-icon';
import {
  Leftheader,
  ImageContainer,
  CompanyNameAndLink,
  CompanyLabel,
  UrlButtonContainer,
  UrlButton,
  Header
} from 'pages/tickets/workspace/workspaceHeader/WorkspaceHeaderStyles';
import githubIcon from 'pages/tickets/workspace/workspaceHeader/Icons/githubIcon.svg';
import websiteIcon from 'pages/tickets/workspace/workspaceHeader/Icons/websiteIcon.svg';
import styled from 'styled-components';

export const ImgText = styled.h3`
  color: #b0b7bc;
  text-align: center;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.0625rem;
  letter-spacing: 0.01875rem;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0;
`;

const HeaderWrap = styled.div`
  display: flex;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
`;

const DataWrap = styled.div`
  padding: 40px 50px;
  display: flex;
  width: 50%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;

  @media only screen and (max-width: 900px) {
    width: 90%;
    padding: 30px 40px;
  }

  @media only screen and (max-width: 500px) {
    width: 90%;
    padding: 20px 10px;
  }
`;

const FieldWrap = styled.div`
  margin-bottom: 30px;
`;

const Label = styled.h5`
  font-size: 1.12rem;
  font-weight: bolder;
`;

const Data = styled.div`
  border: 1px solid #ccc;
  min-height: 50px;
  border-radius: 5px;
  padding: 20px 30px;
  position: relative;
  display: flex;
  flex-direction: column;

  .MaterialIcon {
    font-style: normal;
    font-weight: 900;
    font-size: 1.4rem;
    color: #000000;
  }
`;

const OptionsWrap = styled.div`
  position: absolute;
  right: 6px;
  top: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    border: 0.5px solid #000000;
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: 5px;
    padding: 2px 10px;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 2px solid #dde1e5;
  outline: none;
  caret-color: #618aff;
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  width: 100%;
  resize: none;
  min-height: 5.9375rem;

  ::placeholder {
    color: #b0b7bc;
    font-family: 'Barlow';
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  :focus {
    border: 2px solid #82b4ff;
  }
`;

const ButtonWrap = styled.div`
  margin-left: auto;
  margin-top: 10px;
  display: flex;
  gap: 15px;
`;

interface ButtonProps {
  color?: string;
}
const ActionButton = styled.button<ButtonProps>`
  padding: 5px 20px;
  border-radius: 5px;
  background: ${(p: any) => {
    if (p.color === 'primary') {
      return 'rgb(97, 138, 255)';
    }
  }};
  color: ${(p: any) => {
    if (p.color === 'primary') {
      return '#FFF';
    }
  }};
  border: ${(p: any) => {
    if (p.color === 'primary') {
      return '1px solid rgb(97, 138, 255)';
    } else {
      return '1px solid #636363';
    }
  }};
`;

const WorkspaceMission = () => {
  const { main, ui } = useStores();
  const { uuid } = useParams<{ uuid: string }>();
  const [workspaceData, setWorkspaceData] = useState<Workspace>();
  const [loading, setLoading] = useState(true);
  const [displayMission, setDidplayMission] = useState(false);
  const [editMission, setEditMission] = useState(false);
  const [editTactics, setEditTactics] = useState(false);
  const [displayTactics, setDidplayTactics] = useState(false);
  const [mission, setMission] = useState(workspaceData?.mission);
  const [tactics, setTactics] = useState(workspaceData?.tactics);

  const getWorkspaceData = useCallback(async () => {
    if (!uuid) return;
    const workspaceData = await main.getUserWorkspaceByUuid(uuid);
    if (!workspaceData) return;
    setWorkspaceData(workspaceData);

    setLoading(false);
  }, [uuid, main]);

  useEffect(() => {
    getWorkspaceData();
  }, [getWorkspaceData]);

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

  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
  };

  const editTacticsActions = () => {
    setEditTactics(!editTactics);
    setDidplayTactics(false);
  };

  const editMissionActions = () => {
    setEditMission(!editMission);
    setDidplayMission(false);
  };

  const missionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length) {
      setMission(newValue);
    }
  };

  const tacticsChange = (e: any) => {
    setTactics(e.target.value);
  };

  const submitMission = async () => {
    const body = {
      mission: mission ?? '',
      owner_pubkey: ui.meInfo?.owner_pubkey ?? '',
      uuid: workspaceData?.uuid ?? ''
    };
    await main.workspaceUpdateMission(body);
    await getWorkspaceData();
    setEditMission(false);
  };

  const submitTactics = async () => {
    const body = {
      tactics: tactics ?? '',
      owner_pubkey: ui.meInfo?.owner_pubkey ?? '',
      uuid: workspaceData?.uuid ?? ''
    };
    await main.workspaceUpdateTactics(body);
    await getWorkspaceData();
    setEditTactics(false);
  };

  return (
    !loading && (
      <WorkspaceBody>
        <HeaderWrap>
          <Header>
            <Leftheader>
              <ImageContainer
                src={workspaceData?.img}
                width="72px"
                height="72px"
                alt="workspace icon"
              />
              <CompanyNameAndLink>
                <CompanyLabel>{workspaceData?.name}</CompanyLabel>
                <UrlButtonContainer data-testid="url-button-container">
                  {workspaceData?.website !== '' ? (
                    <UrlButton onClick={() => handleWebsiteButton(workspaceData?.website ?? '')}>
                      <img src={websiteIcon} alt="" />
                      Website
                    </UrlButton>
                  ) : (
                    ''
                  )}
                  {workspaceData?.github !== '' ? (
                    <UrlButton onClick={() => handleGithubButton(workspaceData?.github ?? '')}>
                      <img src={githubIcon} alt="" />
                      Github
                    </UrlButton>
                  ) : (
                    ''
                  )}
                </UrlButtonContainer>
              </CompanyNameAndLink>
            </Leftheader>
          </Header>
        </HeaderWrap>
        <DataWrap>
          <FieldWrap>
            <Label>Mission</Label>
            <Data>
              <OptionsWrap>
                <MaterialIcon
                  icon={'more_horiz'}
                  className="MaterialIcon"
                  onClick={() => setDidplayMission(!displayMission)}
                  data-testid="mission-option-btn"
                />
                <button
                  style={{ display: displayMission ? 'block' : 'none' }}
                  onClick={editMissionActions}
                  data-testid="mission-edit-btn"
                >
                  Edit
                </button>
              </OptionsWrap>
              {!editMission && (
                <>{workspaceData?.mission ? workspaceData.mission : 'No mission yet'}</>
              )}

              {editMission && (
                <>
                  <TextArea
                    placeholder="Enter mission"
                    onChange={missionChange}
                    value={mission ?? workspaceData?.mission}
                    data-testid="mission-textarea"
                  />
                  <ButtonWrap>
                    <ActionButton
                      onClick={() => setEditMission(!editMission)}
                      data-testid="mission-cancel-btn"
                    >
                      Cancel
                    </ActionButton>
                    <ActionButton
                      color="primary"
                      onClick={submitMission}
                      data-testid="mission-update-btn"
                    >
                      Update
                    </ActionButton>
                  </ButtonWrap>
                </>
              )}
            </Data>
          </FieldWrap>
          <FieldWrap>
            <Label>Tactics and Objectives</Label>
            <Data>
              <OptionsWrap>
                <MaterialIcon
                  onClick={() => setDidplayTactics(!displayTactics)}
                  icon={'more_horiz'}
                  className="MaterialIcon"
                  data-testid="tactics-option-btn"
                />
                <button
                  style={{ display: displayTactics ? 'block' : 'none' }}
                  onClick={editTacticsActions}
                  data-testid="tactics-edit-btn"
                >
                  Edit
                </button>
              </OptionsWrap>
              {!editTactics && (
                <>{workspaceData?.tactics ? workspaceData.tactics : 'No tactics yet'}</>
              )}

              {editTactics && (
                <>
                  <TextArea
                    placeholder="Enter tactics"
                    onChange={tacticsChange}
                    value={tactics ?? workspaceData?.tactics}
                    data-testid="tactics-textarea"
                  />
                  <ButtonWrap>
                    <ActionButton
                      data-testid="tactics-cancel-btn"
                      onClick={() => setEditTactics(!editTactics)}
                    >
                      Cancel
                    </ActionButton>
                    <ActionButton
                      data-testid="tactics-update-btn"
                      color="primary"
                      onClick={submitTactics}
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
      </WorkspaceBody>
    )
  );
};

export default WorkspaceMission;
