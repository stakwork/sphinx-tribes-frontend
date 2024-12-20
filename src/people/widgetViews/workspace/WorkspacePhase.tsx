import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EuiSpacer, EuiTabbedContentProps, EuiTabbedContentTab } from '@elastic/eui';
import { Button } from 'components/common';
import MaterialIcon from '@material/react-material-icon';
import styled from 'styled-components';
import {
  EditPopover,
  EditPopoverContent,
  EditPopoverTail,
  EditPopoverText,
  Label
} from 'pages/tickets/style';
import { useStores } from 'store';
import { useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import {
  RowFlex,
  StyledEuiTabbedContent,
  TabContent,
  PostABounty,
  DisplayBounties,
  TabContentOptions
} from '../workspace/style';
import addBounty from '../../../pages/tickets/workspace/workspaceHeader/Icons/addBounty.svg';
import { userCanManageBounty } from '../../../helpers';
import { PostModal } from '../postBounty/PostModal';
import WidgetSwitchViewer from '../WidgetSwitchViewer';
import { BountyStatus, phaseBountyLimit } from '../../../store/interface';
import { Phase, PhaseOperationMessage, PhaseOperationType, Toast } from './interface';
import { AddPhaseModal, DeletePhaseModal, EditPhaseModal } from './WorkspacePhasingModals';

const Container = styled.div`
  padding: 20px;
`;

const PhasesContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const TabsContainer = styled.div`
  background-color: white;
  .euiTabs {
    border-bottom: 1px solid #ebedef;
  }
`;

interface PhaseOptionProps {
  handleClose: () => void;
}

const PhaseOptions = (props: PhaseOptionProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const toggleOptions = () => setShowOptions(!showOptions);
  const { handleClose } = props;

  const close = () => {
    toggleOptions();
    handleClose();
  };

  return (
    <TabContentOptions>
      <MaterialIcon
        icon="more_horiz"
        className="MaterialIcon"
        onClick={toggleOptions}
        data-testid="phase-option-btn"
        style={{ transform: 'rotate(90deg)' }}
      />
      {showOptions && (
        <EditPopover>
          <EditPopoverTail />
          <EditPopoverContent>
            <MaterialIcon icon="edit" style={{ fontSize: '20px', marginTop: '2px' }} />
            <EditPopoverText data-testid={`phase-edit-btn`} onClick={close}>
              Edit
            </EditPopoverText>
          </EditPopoverContent>
        </EditPopover>
      )}
    </TabContentOptions>
  );
};

const phaseOperationMessages: Record<PhaseOperationType, PhaseOperationMessage> = {
  create: {
    title: 'Phase Created',
    message: 'The phase has been successfully created.'
  },
  edit: {
    title: 'Phase Edited',
    message: 'The phase has been successfully edited.'
  },
  delete: {
    title: 'Phase Deleted',
    message: 'The phase has been successfully deleted.'
  }
};

interface WorkspacePhaseProps {
  featureId: string;
  phases: Phase[];
  updateFeaturePhase: (reason: Toast['color'], title: string, message: string) => void;
  workspace_uuid: string | undefined;
}

const WorkspacePhasingTabs = (props: WorkspacePhaseProps) => {
  const { main, ui } = useStores();
  const { featureId, phases, updateFeaturePhase } = props;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showEditPhaseModal, setShowEditPhaseModal] = useState<boolean>(false);
  const [showAddPhaseModal, setShowAddPhaseModal] = useState<boolean>(false);
  const [showDeletePhaseModal, setShowDeletePhaseModal] = useState<boolean>(false);
  const [phaseName, setPhaseName] = useState<string>('');
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [canPostBounty, setCanPostBounty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<number>(phaseBountyLimit);
  const [totalBounties, setTotalBounties] = useState(0);

  const checkboxIdToSelectedMap: BountyStatus = useMemo(
    () => ({
      Open: true,
      Assigned: true,
      Completed: true,
      Paid: true,
      Pending: true,
      Failed: true
    }),
    []
  );

  const checkboxIdToSelectedMapLanguage = {};
  const languageString = '';

  const selectedWidget = 'bounties';
  const history = useHistory();

  const handleTabClick = (selectedTab: EuiTabbedContentTab) => {
    setSelectedIndex(parseInt(selectedTab.id));
    setPhaseName(phases[selectedIndex]?.name);
    setPage(1);
    setCurrentItems(phaseBountyLimit);
  };

  const handleAddPhaseClick = () => {
    setShowAddPhaseModal(true);
  };

  const handleEditPhaseClick = () => {
    setShowEditPhaseModal(true);
  };

  const handleAddPhaseModalClose = () => {
    setShowAddPhaseModal(false);
  };

  const handleEditPhaseModalClose = () => {
    setShowEditPhaseModal(false);
  };

  const handleDeletePhaseModalClose = () => {
    setShowDeletePhaseModal(false);
  };

  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };

  const onPanelClick = (activeWorkspace?: string, bounty?: any) => {
    if (bounty?.id) {
      history.push(`/bounty/${bounty.id}`);
    } else {
      history.push(`/feature/${props.workspace_uuid}`);
    }
  };

  const handlePhasePlannerClick = () => {
    if (phases[selectedIndex]) {
      const phase = phases[selectedIndex];
      history.push(`/feature/${phase.feature_uuid}/phase/${phase.uuid}/planner`);
    }
  };

  const handlePhaseNameChange = (name: string) => setPhaseName(name);

  const createOrUpdateFeaturePhase = async (op: PhaseOperationType) => {
    if (!featureId) return;

    const phase = phases[selectedIndex];

    const body = {
      uuid: op === 'edit' ? phase?.uuid || '' : '',
      feature_uuid: featureId,
      name: phaseName || phase?.name,
      priority: phase?.priority
    };

    try {
      await main.createOrUpdatePhase(body);
      updateFeaturePhase(
        'success',
        phaseOperationMessages[op].title,
        phaseOperationMessages[op].message
      );
    } catch {
      updateFeaturePhase(
        'danger',
        phaseOperationMessages[op].title,
        phaseOperationMessages[op].message
      );
    } finally {
      if (op === 'edit') {
        handleEditPhaseModalClose();
      } else {
        handleAddPhaseModalClose();
      }
    }
  };

  const deletePhaseFromFeature = async () => {
    const op = 'delete';
    if (!featureId) return;

    const phase = phases[selectedIndex];

    try {
      await main.deletePhase(featureId, phase.uuid);
      setSelectedIndex(0);
      updateFeaturePhase(
        'success',
        phaseOperationMessages[op].title,
        phaseOperationMessages[op].message
      );
    } catch {
      updateFeaturePhase(
        'success',
        phaseOperationMessages[op].title,
        phaseOperationMessages[op].message
      );
    } finally {
      handleDeletePhaseModalClose();
    }
  };

  const getTotalBounties = useCallback(
    async (statusData: any) => {
      if (phases[selectedIndex]) {
        const totalBounties = await main.getTotalPhaseBountyCount(
          phases[selectedIndex].feature_uuid,
          phases[selectedIndex].uuid,
          statusData.Open,
          statusData.Assigned,
          statusData.Paid
        );
        setTotalBounties(totalBounties);
      }
    },
    [phases, selectedIndex, main]
  );

  useEffect(() => {
    if (phases[selectedIndex]) {
      (async () => {
        setLoading(true);

        await main.getPhaseBounties(
          phases[selectedIndex].feature_uuid,
          phases[selectedIndex].uuid,
          {
            page: 1,
            resetPage: true,
            ...checkboxIdToSelectedMap,
            languages: languageString
          }
        );

        await getTotalBounties(checkboxIdToSelectedMap);

        setLoading(false);
      })();
    }
  }, [phases, selectedIndex, main, checkboxIdToSelectedMap, languageString, getTotalBounties]);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const isLoggedIn = !!ui.meInfo;
      const hasPermission =
        isLoggedIn && (await userCanManageBounty(props.workspace_uuid, ui.meInfo?.pubkey, main));
      setCanPostBounty(hasPermission);
    };

    if (ui.meInfo && props.workspace_uuid) {
      checkUserPermissions();
    }
  }, [ui.meInfo, props.workspace_uuid, main]);

  const tabs: EuiTabbedContentProps['tabs'] = useMemo(
    () =>
      phases.map((phase: Phase, index: number) => ({
        id: `${index}`,
        name: phase.name,
        prepend: <PhaseOptions handleClose={handleEditPhaseClick} />,
        content: (
          <TabContent>
            <PostABounty>
              {canPostBounty && (
                <>
                  <Button
                    onClick={handlePhasePlannerClick}
                    style={{
                      backgroundColor: '#49C998',
                      borderRadius: '6px',
                      padding: '15px 20px'
                    }}
                  >
                    <div>Phase Planner</div>
                  </Button>
                  <Button
                    onClick={handlePostBountyClick}
                    style={{
                      backgroundColor: '#49C998',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <img src={addBounty} alt="" />
                      Post a Bounty
                    </div>
                  </Button>
                </>
              )}
            </PostABounty>
            <DisplayBounties>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  overflowY: 'auto'
                }}
              >
                {totalBounties > 0 ? (
                  <WidgetSwitchViewer
                    onPanelClick={onPanelClick}
                    checkboxIdToSelectedMap={checkboxIdToSelectedMap}
                    checkboxIdToSelectedMapLanguage={checkboxIdToSelectedMapLanguage}
                    fromBountyPage={true}
                    selectedWidget={selectedWidget}
                    loading={loading}
                    currentItems={currentItems}
                    setCurrentItems={setCurrentItems}
                    page={page}
                    setPage={setPage}
                    languageString={languageString}
                    phaseTotalBounties={totalBounties}
                    featureUuid={phases[selectedIndex].feature_uuid}
                    phaseUuid={phases[selectedIndex].uuid}
                  />
                ) : (
                  <p>No Bounties Yet!</p>
                )}
              </div>
            </DisplayBounties>
          </TabContent>
        )
      })),
    [
      phases,
      currentItems,
      totalBounties,
      canPostBounty,
      checkboxIdToSelectedMap,
      loading,
      onPanelClick,
      page,
      selectedIndex
    ]
  );

  const selectedTab = useMemo(() => tabs[selectedIndex], [selectedIndex, tabs]);

  return (
    <Container style={{ marginBottom: '3rem' }}>
      <RowFlex>
        <Label>Phases</Label>
        <Button
          style={{ borderRadius: '5px', margin: 0, marginLeft: 'auto' }}
          dataTestId="phase-add-btn"
          text="Add Phase"
          onClick={handleAddPhaseClick}
        />
      </RowFlex>
      <EuiSpacer size="m" />
      {phases.length ? (
        <PhasesContainer>
          <TabsContainer>
            <StyledEuiTabbedContent
              tabs={tabs}
              selectedTab={selectedTab}
              onTabClick={handleTabClick}
            />
          </TabsContainer>
        </PhasesContainer>
      ) : null}
      {showAddPhaseModal && (
        <AddPhaseModal
          onSave={() => createOrUpdateFeaturePhase('create')}
          onEditPhase={handlePhaseNameChange}
          onClose={handleAddPhaseModalClose}
          onConfirmDelete={() => {
            setShowDeletePhaseModal(true);
            handleAddPhaseModalClose();
          }}
        />
      )}
      {showEditPhaseModal && (
        <EditPhaseModal
          onSave={() => createOrUpdateFeaturePhase('edit')}
          onEditPhase={handlePhaseNameChange}
          onClose={handleEditPhaseModalClose}
          phaseName={phaseName}
          onConfirmDelete={() => {
            setShowDeletePhaseModal(true);
            handleEditPhaseModalClose();
          }}
        />
      )}
      {showDeletePhaseModal && (
        <DeletePhaseModal
          onClose={handleDeletePhaseModalClose}
          onConfirmDelete={deletePhaseFromFeature}
        />
      )}
      <PostModal
        widget={selectedWidget}
        isOpen={isPostBountyModalOpen}
        onClose={() => setIsPostBountyModalOpen(false)}
        phase_uuid={phases[selectedIndex]?.uuid}
      />
    </Container>
  );
};

export default observer(WorkspacePhasingTabs);
