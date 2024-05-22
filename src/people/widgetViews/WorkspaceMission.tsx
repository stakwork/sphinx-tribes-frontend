import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import {
  Body,
  WorkspaceBody,
  Leftheader,
  Header,
  HeaderWrap,
  DataWrap,
  LeftSection,
  RightSection,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  TextArea
} from 'pages/tickets/style';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStores } from 'store';
import { Feature, featureLimit, Workspace } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { Button, Modal } from 'components/common';
import {
  ImageContainer,
  CompanyNameAndLink,
  CompanyLabel,
  UrlButtonContainer,
  UrlButton
} from 'pages/tickets/workspace/workspaceHeader/WorkspaceHeaderStyles';
import githubIcon from 'pages/tickets/workspace/workspaceHeader/Icons/githubIcon.svg';
import websiteIcon from 'pages/tickets/workspace/workspaceHeader/Icons/websiteIcon.svg';
import styled from 'styled-components';
import { useIsMobile } from 'hooks';
import { colors } from '../../config/colors';
import paginationarrow1 from '../../pages/superadmin/header/icons/paginationarrow1.svg';
import paginationarrow2 from '../../pages/superadmin/header/icons/paginationarrow2.svg';
import AddFeature from './workspace/AddFeatureModal';
import EditSchematic from './workspace/EditSchematicModal';
import { ActionButton, RowFlex, ButtonWrap } from './workspace/style';

const color = colors['light'];

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

const FeaturesWrap = styled.div`
  margin-top: 25px;
`;

const FeatureDataWrap = styled.div`
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  gap: 1rem;
`;

const FeatureCount = styled.div`
  padding: 5px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  font-size: 1rem;
  font-weight: 700;
`;

const FeatureData = styled.div`
  margin-top: 10px;
  min-width: calc(100% - 52px - 1rem);
  font-size: 1rem;
  font-weight: 700;
`;

const FeatureDetails = styled.div`
  border: 1px solid #ccc;
  margin-top: 10px;
  min-height: 50px;
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FeatureText = styled.p`
  padding: 0px;
  margin: 0px;
`;

const PaginatonSection = styled.div`
  height: 150px;
  flex-shrink: 0;
  align-self: stretch;
  border-radius: 8px;
  padding: 1em;
`;

interface PaginationButtonsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

const PaginationButtons = styled.button<PaginationButtonsProps>`
  border-radius: 3px;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  outline: none;
  border: none;
  text-align: center;
  margin: 5px;
  background: ${(props: any) => (props.active ? 'var(--Active-blue, #618AFF)' : 'white')};
  color: ${(props: any) => (props.active ? 'white' : 'black')};
`;

const PageContainer = styled.div`
  display: flex;
  align-items: center;
`;

const PaginationImg = styled.img`
  cursor: pointer;
`;

const FlexDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;

  .euiPopover__anchor {
    margin-top: 6px !important;
  }
`;

const FeatureLink = styled.a`
  text-decoration: none;
  color: #000;
`;

const WorkspaceMission = () => {
  const { main, ui } = useStores();
  const { uuid } = useParams<{ uuid: string }>();
  const [workspaceData, setWorkspaceData] = useState<Workspace>();
  const [loading, setLoading] = useState(true);
  const [displayMission, setDidplayMission] = useState(false);
  const [editMission, setEditMission] = useState(false);
  const [displaySchematic, setDidplaySchematic] = useState(false);
  const [editTactics, setEditTactics] = useState(false);
  const [displayTactics, setDidplayTactics] = useState(false);
  const [mission, setMission] = useState(workspaceData?.mission);
  const [schematicModal, setSchematicModal] = useState(false);
  const [tactics, setTactics] = useState(workspaceData?.tactics);
  const [featureModal, setFeatureModal] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuresCount, setFeaturesCount] = useState(0);
  const [activeTabs, setActiveTabs] = useState<number[]>([]);

  const paginationLimit = Math.floor(featuresCount / featureLimit) + 1;
  const visibleTabs = 3;

  const isMobile = useIsMobile();

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

  const getFeaturesCount = useCallback(async () => {
    if (!uuid) return;
    const featuresCount = await main.getWorkspaceFeaturesCount(uuid);
    if (!featuresCount) return;
    setFeaturesCount(featuresCount);

    setLoading(false);
  }, [uuid, main]);

  useEffect(() => {
    getFeaturesCount();
  }, [getFeaturesCount]);

  const getFeatures = useCallback(async () => {
    if (!uuid) return;
    const features = await main.getWorkspaceFeatures(uuid, { page: currentPage });
    if (!features) return;
    setFeatures(features);
    getFeaturesCount();

    setLoading(false);
  }, [uuid, main, getFeaturesCount, currentPage]);

  useEffect(() => {
    getFeatures();
  }, [getFeatures]);

  const getActiveTabs = useCallback(() => {
    const dataNumber: number[] = [];
    for (let i = 1; i <= Math.ceil(paginationLimit); i++) {
      if (i > visibleTabs) break;
      dataNumber.push(i);
    }

    setActiveTabs(dataNumber);
  }, [paginationLimit]);

  useEffect(() => {
    getActiveTabs();
  }, [getActiveTabs]);

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

  const toggleFeatureModal = () => {
    setFeatureModal(!featureModal);
  };

  const toggleSchematicModal = () => {
    setDidplaySchematic(false);
    setSchematicModal(!schematicModal);
  };

  const paginateNext = () => {
    const activeTab = paginationLimit > visibleTabs;
    const activePage = currentPage < featuresCount / featureLimit;
    if (activePage && activeTab) {
      const dataNumber: number[] = activeTabs;
      let nextPage: number;
      if (currentPage < visibleTabs) {
        nextPage = visibleTabs + 1;
        if (setCurrentPage) setCurrentPage(nextPage);
      } else {
        nextPage = currentPage + 1;
        if (setCurrentPage) setCurrentPage(nextPage);
      }
      dataNumber.push(nextPage);
      dataNumber.shift();
    }
  };

  const paginatePrev = () => {
    const firtsTab = activeTabs[0];
    const lastTab = activeTabs[6];
    if (firtsTab > 1) {
      const dataNumber: number[] = activeTabs;
      let nextPage: number;
      if (lastTab > visibleTabs) {
        nextPage = lastTab - visibleTabs;
      } else {
        nextPage = currentPage - 1;
      }
      if (setCurrentPage) setCurrentPage(currentPage - 1);
      dataNumber.pop();
      const newActivetabs = [nextPage, ...dataNumber];
      setActiveTabs(newActivetabs);
    }
  };

  const paginate = (page: number) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
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
          <LeftSection>
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
                        color="cancel"
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
                        color="cancel"
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
            <FieldWrap>
              <RowFlex>
                <Label>Features</Label>
                <Button
                  onClick={toggleFeatureModal}
                  style={{
                    borderRadius: '5px',
                    margin: 0,
                    marginLeft: 'auto'
                  }}
                  dataTestId="new-feature-btn"
                  text="New Feature"
                />
              </RowFlex>
              <FeaturesWrap>
                {features &&
                  features.map((feat: Feature, i: number) => (
                    <FeatureDataWrap key={i}>
                      <FeatureCount>{i + 1}</FeatureCount>
                      <FeatureData>
                        <FeatureLink href={`/feature/${feat.uuid}`} target="_blank">
                          {feat.name}
                        </FeatureLink>
                        <FeatureDetails>
                          <FeatureText>Filter Status</FeatureText>
                        </FeatureDetails>
                      </FeatureData>
                    </FeatureDataWrap>
                  ))}
              </FeaturesWrap>
              <PaginatonSection>
                <FlexDiv>
                  {featuresCount > featureLimit ? (
                    <PageContainer role="pagination">
                      <PaginationImg
                        src={paginationarrow1}
                        alt="pagination arrow 1"
                        onClick={() => paginatePrev()}
                      />
                      {activeTabs.map((page: number) => (
                        <PaginationButtons
                          data-testid={'page'}
                          key={page}
                          onClick={() => paginate(page)}
                          active={page === currentPage}
                        >
                          {page}
                        </PaginationButtons>
                      ))}
                      <PaginationImg
                        src={paginationarrow2}
                        alt="pagination arrow 2"
                        onClick={() => paginateNext()}
                      />
                    </PageContainer>
                  ) : null}
                </FlexDiv>
              </PaginatonSection>
            </FieldWrap>
          </LeftSection>
          <RightSection>
            <FieldWrap>
              <Label>Schematic</Label>
              <Data style={{ border: 'none' }}>
                <OptionsWrap>
                  <MaterialIcon
                    icon={'more_horiz'}
                    className="MaterialIcon"
                    onClick={() => setDidplaySchematic(!displaySchematic)}
                    data-testid="schematic-option-btn"
                  />
                  <button
                    style={{ display: displaySchematic ? 'block' : 'none' }}
                    onClick={toggleSchematicModal}
                    data-testid="schematic-edit-btn"
                  >
                    Edit
                  </button>
                </OptionsWrap>
                <a href={workspaceData?.schematic_url} target="_blank">
                  {workspaceData?.schematic_url ? 'schematic' : 'No schematic url yet'}
                </a>
              </Data>
            </FieldWrap>
          </RightSection>
        </DataWrap>
        {toastsEl}
        <Modal
          visible={featureModal}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '25%',
            minHeight: isMobile ? '100%' : '20%'
          }}
          overlayClick={toggleFeatureModal}
          bigCloseImage={toggleFeatureModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <AddFeature
            closeHandler={toggleFeatureModal}
            getFeatures={getFeatures}
            workspace_uuid={uuid}
          />
        </Modal>
        <Modal
          visible={schematicModal}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '25%',
            minHeight: isMobile ? '100%' : '20%'
          }}
          overlayClick={toggleSchematicModal}
          bigCloseImage={toggleSchematicModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <EditSchematic
            closeHandler={toggleSchematicModal}
            getSchematic={getWorkspaceData}
            uuid={workspaceData?.uuid}
            owner_pubkey={ui.meInfo?.owner_pubkey}
            schematic_url={workspaceData?.schematic_url ?? ''}
            schematic_img={workspaceData?.schematic_img ?? ''}
          />
        </Modal>
      </WorkspaceBody>
    )
  );
};

export default WorkspaceMission;
