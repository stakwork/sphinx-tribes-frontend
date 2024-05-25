import React, { useMemo, useState } from 'react';
import { EuiSpacer, EuiTabbedContentProps, EuiTabbedContentTab } from '@elastic/eui';
import { Button } from 'components/common';
import MaterialIcon from '@material/react-material-icon';
import { FieldWrap, Label } from 'pages/tickets/style';
import { useStores } from 'store';
import {
  RowFlex,
  StyledEuiTabbedContent,
  TabContent,
  TabContentOptions,
  WorkspaceOption
} from '../workspace/style';
import { Phase, PhaseOperationMessage, PhaseOperationType, Toast } from './interface';
import { AddPhaseModal, DeletePhaseModal, EditPhaseModal } from './WorkspacePhasingModals';

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
      />
      {showOptions && (
        <WorkspaceOption>
          <ul>
            <li data-testid={`phase-edit-btn`} onClick={close}>
              Edit
            </li>
          </ul>
        </WorkspaceOption>
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
}

const WorkspacePhasingTabs = (props: WorkspacePhaseProps) => {
  const { main } = useStores();
  const { featureId, phases, updateFeaturePhase } = props;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showEditPhaseModal, setShowEditPhaseModal] = useState<boolean>(false);
  const [showAddPhaseModal, setShowAddPhaseModal] = useState<boolean>(false);
  const [showDeletePhaseModal, setShowDeletePhaseModal] = useState<boolean>(false);
  const [phaseName, setPhaseName] = useState<string>('');

  const handleTabClick = (selectedTab: EuiTabbedContentTab) => {
    setSelectedIndex(parseInt(selectedTab.id));
    setPhaseName(phases[selectedIndex]?.name);
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

  const tabs: EuiTabbedContentProps['tabs'] = useMemo(
    () =>
      phases.map((phase: Phase, index: number) => ({
        id: `${index}`,
        name: phase.name,
        prepend: <PhaseOptions handleClose={handleEditPhaseClick} />,
        content: (
          <TabContent>
            <p>No Bounties Yet!</p>
          </TabContent>
        )
      })),
    [phases]
  );

  const selectedTab = useMemo(() => tabs[selectedIndex], [selectedIndex, tabs]);

  return (
    <>
      <FieldWrap>
        <RowFlex>
          <Label>Phasing</Label>
          <Button
            style={{ borderRadius: '5px', margin: 0, marginLeft: 'auto' }}
            dataTestId="phase-add-btn"
            text="Add Phase"
            onClick={handleAddPhaseClick}
          />
        </RowFlex>
        <EuiSpacer size="m" />
        {phases.length ? (
          <StyledEuiTabbedContent
            tabs={tabs}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        ) : null}
      </FieldWrap>
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
    </>
  );
};

export default WorkspacePhasingTabs;
