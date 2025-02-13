/* eslint-disable @typescript-eslint/typedef */
import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'store';
import { EuiGlobalToastList, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiIcon } from '@elastic/eui';
import { renderMarkdown } from 'people/utils/RenderMarkdown.tsx';
import styled from 'styled-components';
import history from 'config/history.ts';
import MaterialIcon from '@material/react-material-icon';
import { Box } from '@mui/system';
import { workspaceTicketStore } from '../../../store/workspace-ticket.ts';
import {
  ActionButton,
  CopyButtonGroup,
  TicketButtonGroup
} from '../../../people/widgetViews/workspace/style';
import {
  TicketContainer,
  TicketHeader,
  TicketInput,
  TicketHeaderInputWrap,
  BountyPopoverText,
  BountyOptionsWrap,
  ConvertToBountyPopover,
  BountyPopoverContent
} from '../../../pages/tickets/style';
import { TicketStatus, Ticket, Author } from '../../../store/interface';
import { Toast } from '../../../people/widgetViews/workspace/interface';
import { uiStore } from '../../../store/ui';
import { Select, Option } from '../../../people/widgetViews/workspace/style.ts';
import { useDeleteConfirmationModal } from '../../../components/common/DeleteConfirmationModal/DeleteConfirmationModal.tsx';
import { TicketTextAreaComp } from './TicketTextArea.tsx';

interface TicketEditorProps {
  ticketData: Ticket;
  index: number;
  websocketSessionId: string;
  draggableId: string;
  hasInteractiveChildren: boolean;
  dragHandleProps?: Record<string, any>;
  swwfLink?: string;
  getPhaseTickets: () => Promise<Ticket[] | undefined>;
  onSave?: (ticket: Ticket) => void;
}

const SwitcherContainer = styled.div`
  display: flex;
  background-color: white;
  border-radius: 20px;
  padding: 4px;
  width: fit-content;
`;

const SwitcherButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  ${({ isActive }) =>
    isActive
      ? `
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
  `
      : `
    background-color: transparent;
    color: #333;
    &:hover {
      background-color: rgba(0, 123, 255, 0.1);
    }
  `}
`;

const VersionSelect = styled(Select)`
  padding: 6px !important;
  border-radius: 4px;
  margin-top: 0 !important;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  min-width: auto;
  height: 40px !important;
  margin-bottom: 9px;
`;

const MaterialIconStyled = styled(MaterialIcon)`
  cursor: pointer;
  padding: 4px;
  font-size: 40px !important;
  border-radius: 4px;
`;

const FloatingCopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f2f3f5;
  color: black;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const EditorWrapper = styled.div`
  position: relative;
  background-color: white;
`;

const WorkspaceTicketEditor = observer(
  ({ ticketData, websocketSessionId, dragHandleProps, swwfLink, onSave }: TicketEditorProps) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [versions, setVersions] = useState<number[]>([]);
    const latestTicket = workspaceTicketStore.getLatestVersionFromGroup(
      ticketData.ticket_group as string
    );
    const [selectedVersion, setSelectedVersion] = useState<number>(latestTicket?.version as number);
    const [versionTicketData, setVersionTicketData] = useState<Ticket>(latestTicket as Ticket);
    const [isCopying, setIsCopying] = useState(false);
    const [activeMode, setActiveMode] = useState<'preview' | 'edit'>('edit');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const { main } = useStores();
    const [isCreatingBounty, setIsCreatingBounty] = useState(false);
    const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
    const ui = uiStore;
    const { openDeleteConfirmation } = useDeleteConfirmationModal();

    const groupTickets = useMemo(
      () => workspaceTicketStore.getTicketsByGroup(ticketData.ticket_group as string),
      [ticketData.ticket_group]
    );

    useEffect(() => {
      const groupTickets = workspaceTicketStore.getTicketsByGroup(
        ticketData.ticket_group as string
      );
      const versions = groupTickets.map((ticket) => ticket.version || 0);
      setVersions(versions);

      const latestTicket = workspaceTicketStore.getLatestVersionFromGroup(
        ticketData.ticket_group as string
      );

      if (latestTicket) {
        setSelectedVersion(latestTicket.version as number);
        setVersionTicketData(latestTicket);
      }
    }, [ticketData, ticketData.version]);

    useEffect(() => {
      const maxLimit = 21;
      const latestVersion = latestTicket?.version as number;
      const versionsArray = Array.from(
        { length: Math.min(latestVersion, maxLimit) },
        (_: number, index: number) => latestVersion - index
      );
      setVersions(versionsArray);
    }, [groupTickets, latestTicket?.version]);

    useEffect(() => {
      const isChanged =
        ticketData.name.trim() !== versionTicketData.name.trim() ||
        ticketData.description.trim() !== versionTicketData.description.trim();
      setIsButtonDisabled(!isChanged);
    }, [ticketData, versionTicketData]);

    const addUpdateSuccessToast = () => {
      setToasts([
        {
          id: `${Date.now()}-success`,
          title: 'Hive',
          color: 'success',
          text: 'Updates Saved!'
        }
      ]);
    };

    const addUpdateErrorToast = () => {
      setToasts([
        {
          id: `${Date.now()}-error`,
          title: 'Hive',
          color: 'danger',
          text: 'We had an issue, try again!'
        }
      ]);
    };

    const toggleOptionsMenu = () => {
      setIsOptionsMenuVisible(!isOptionsMenuVisible);
    };

    const handleUpdate = async () => {
      if (isButtonDisabled) return;
      try {
        const ticketPayload = {
          metadata: {
            source: 'websocket',
            id: websocketSessionId
          },
          ticket: {
            ...ticketData,
            name: versionTicketData.name,
            description: versionTicketData.description,
            status: 'DRAFT' as TicketStatus,
            version: ticketData.version + 1,
            author: 'HUMAN' as Author,
            author_id: uiStore.meInfo?.pubkey,
            ticket_group: ticketData.ticket_group || ticketData.uuid
          }
        };

        const response = await main.createUpdateTicket(ticketPayload);

        if (response === 406 || !response) {
          throw new Error('Failed to update ticket');
        }

        setSelectedVersion(ticketData.version + 1);

        const updatedGroupTickets = await main.getTicketsByGroup(ticketData.ticket_group as string);

        if (Array.isArray(updatedGroupTickets)) {
          workspaceTicketStore.clearTickets();
          for (const updatedTicket of updatedGroupTickets) {
            if (updatedTicket.UUID) {
              updatedTicket.uuid = updatedTicket.UUID;
            }
            workspaceTicketStore.addTicket(updatedTicket);

            if (updatedTicket.version === ticketData.version + 1) {
              onSave?.(updatedTicket);
            }
          }
        }

        addUpdateSuccessToast();
      } catch (error) {
        console.error('Error updating ticket:', error);
        addUpdateErrorToast();
      }
    };

    const addSuccessToast = () => {
      setToasts([
        {
          id: `${Date.now()}-ticket-success`,
          title: 'Ticket Builder',
          color: 'success',
          text: "Success, I'll rewrite your ticket now!"
        }
      ]);
    };

    const addErrorToast = () => {
      setToasts([
        {
          id: `${Date.now()}-ticket-error`,
          title: 'Ticket Builder',
          color: 'danger',
          text: 'Sorry, there appears to be a problem'
        }
      ]);
    };

    const handleTicketBuilder = async () => {
      try {
        const ticketPayload = {
          metadata: {
            source: 'websocket',
            id: websocketSessionId
          },
          ticket: {
            ...ticketData,
            name: versionTicketData.name,
            description: versionTicketData.description,
            status: 'DRAFT' as TicketStatus,
            author: 'AGENT' as Author,
            author_id: 'TICKET_BUILDER',
            ticket_group: ticketData.ticket_group || ticketData.uuid
          }
        };

        const response = await main.sendTicketForReview(ticketPayload);

        if (response) {
          addSuccessToast();
        } else {
          throw new Error('Failed to send ticket for review');
        }
      } catch (error) {
        console.error('Error in ticket builder:', error);
        addErrorToast();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const version = Number(e.target.value);
      if (version !== selectedVersion) {
        setSelectedVersion(version);

        const selectedVerionTicket = groupTickets.find(
          (ticket: Ticket) => ticket.version === version
        );

        if (selectedVerionTicket) {
          setVersionTicketData({
            ...selectedVerionTicket
          });
        }
      }
    };
    const handleCopy = async () => {
      if (isCopying) return;

      setIsCopying(true);
      try {
        await navigator.clipboard.writeText(versionTicketData.description);
        setToasts([
          {
            id: `${Date.now()}-copy-success`,
            title: 'Hive',
            color: 'success',
            text: 'Description copied to clipboard!'
          }
        ]);
      } catch (err) {
        setToasts([
          {
            id: `${Date.now()}-copy-error`,
            title: 'Hive',
            color: 'danger',
            text: 'Failed to copy description'
          }
        ]);
      } finally {
        setIsCopying(false);
      }
    };

    const handleCreateBounty = async () => {
      if (isCreatingBounty) return;

      setIsCreatingBounty(true);
      try {
        const data = await main.createBountyFromTicket(ticketData.uuid);

        if (data?.success) {
          setToasts([
            {
              id: `${Date.now()}-bounty-success`,
              title: 'Bounty Created',
              color: 'success',
              text: 'Bounty created successfully!'
            }
          ]);

          history.push(`/bounty/${data.bounty_id}`);
        } else {
          throw new Error('Failed to create bounty');
        }
      } catch (error) {
        console.error('Error creating bounty:', error);
        setToasts([
          {
            id: `${Date.now()}-bounty-error`,
            title: 'Error',
            color: 'danger',
            text: 'Failed to create bounty'
          }
        ]);
      } finally {
        setIsCreatingBounty(false);
      }
    };

    const handleDeleteTicket = async () => {
      const success = await main.deleteTicket(ticketData.uuid);
      if (success) {
        setToasts([
          {
            id: `${Date.now()}-delete-success`,
            title: 'Ticket',
            color: 'success',
            text: 'Ticket deleted successfully!'
          }
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        workspaceTicketStore.clearTickets();
        const updatedGroupTickets = await main.getTicketsByGroup(ticketData.ticket_group as string);

        if (Array.isArray(updatedGroupTickets)) {
          for (const updatedTicket of updatedGroupTickets) {
            if (updatedTicket.UUID) {
              updatedTicket.uuid = updatedTicket.UUID;
            }
            workspaceTicketStore.addTicket(updatedTicket);
          }
        }
      } else {
        setToasts([
          {
            id: `${Date.now()}-delete-error`,
            title: 'Error',
            color: 'danger',
            text: 'Failed to delete ticket'
          }
        ]);
      }
    };

    const deleteTicketHandler = () => {
      openDeleteConfirmation({
        onDelete: handleDeleteTicket,
        children: (
          <Box fontSize={20} textAlign="center">
            Are you sure you want to <br />
            <Box component="span" fontWeight="500">
              delete this ticket?
            </Box>
          </Box>
        )
      });
    };

    return (
      <TicketContainer>
        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiPanel
              style={{ backgroundColor: '#f2f3f5', border: 'none' }}
              color="transparent"
              className="drag-handle"
              paddingSize="s"
              {...dragHandleProps}
              aria-label="Drag Handle"
              key={ticketData.uuid}
              data-testid={`drag-handle-${ticketData.uuid}`}
            >
              <EuiIcon type="grab" />
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <TicketHeaderInputWrap>
              <TicketHeader>Ticket:</TicketHeader>
              <TicketInput
                value={versionTicketData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVersionTicketData({ ...versionTicketData, name: e.target.value })
                }
                placeholder="Enter ticket name..."
              />
              <VersionSelect value={selectedVersion} onChange={handleChange}>
                {Array.from(new Set(versions)).map((version: number) => (
                  <Option key={version} value={version}>
                    Version {version}
                  </Option>
                ))}
              </VersionSelect>
              <BountyOptionsWrap>
                <MaterialIconStyled
                  icon={'more_horiz'}
                  className="MaterialIcon"
                  onClick={() => toggleOptionsMenu()}
                  data-testid="ticket-options-btn"
                />
                {isOptionsMenuVisible && (
                  <ConvertToBountyPopover>
                    <BountyPopoverContent>
                      <BountyPopoverText
                        onClick={handleCreateBounty}
                        data-testid="convert-to-bounty-btn"
                      >
                        Convert to Bounty
                      </BountyPopoverText>
                      <BountyPopoverText
                        onClick={() => {
                          toggleOptionsMenu();
                          deleteTicketHandler();
                        }}
                        data-testid="delete-ticket-btn"
                      >
                        Delete Ticket
                      </BountyPopoverText>
                    </BountyPopoverContent>
                  </ConvertToBountyPopover>
                )}
              </BountyOptionsWrap>
              <CopyButtonGroup>
                <SwitcherContainer>
                  <SwitcherButton
                    isActive={activeMode === 'preview'}
                    onClick={() => setActiveMode('preview')}
                  >
                    Preview
                  </SwitcherButton>
                  <SwitcherButton
                    isActive={activeMode === 'edit'}
                    onClick={() => setActiveMode('edit')}
                  >
                    Edit
                  </SwitcherButton>
                </SwitcherContainer>
              </CopyButtonGroup>
            </TicketHeaderInputWrap>
            <EditorWrapper>
              {activeMode === 'edit' ? (
                <>
                  <FloatingCopyButton onClick={handleCopy} title="Copy Code">
                    <EuiIcon type="copy" />
                  </FloatingCopyButton>
                  <TicketTextAreaComp
                    value={versionTicketData.description}
                    onChange={(value: string) =>
                      setVersionTicketData({ ...versionTicketData, description: value })
                    }
                    placeholder="Enter ticket details..."
                    ui={ui}
                  />
                </>
              ) : (
                <div className="p-4 border rounded-md">
                  {renderMarkdown(versionTicketData.description)}
                </div>
              )}
            </EditorWrapper>
            <TicketButtonGroup>
              {swwfLink && (
                <ActionButton
                  as="a"
                  href={`https://jobs.stakwork.com/admin/projects/${swwfLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                  color="#49C998"
                  className="no-underline"
                >
                  SW Run: {swwfLink}
                </ActionButton>
              )}
              <ActionButton
                color="#49C998"
                onClick={handleTicketBuilder}
                data-testid="story-generate-btn"
              >
                Improve with AI
              </ActionButton>
              <ActionButton
                color="primary"
                onClick={handleUpdate}
                data-testid="story-input-update-btn"
              >
                Save
              </ActionButton>
            </TicketButtonGroup>
            <EuiGlobalToastList
              toasts={toasts}
              dismissToast={() => setToasts([])}
              toastLifeTimeMs={3000}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </TicketContainer>
    );
  }
);

export default WorkspaceTicketEditor;
