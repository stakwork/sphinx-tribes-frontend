import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import PageLoadSpinner from 'people/utils/PageLoadSpinner';
import NoResults from 'people/utils/WorkspaceNoResults';
import { useStores } from 'store';
import { Workspace, Person } from 'store/interface';
import { Button } from 'components/common';
import { useIsMobile } from 'hooks/uiHooks';
import { Modal } from '../../components/common';
import avatarIcon from '../../public/static/profile_avatar.svg';
import { colors } from '../../config/colors';
import { widgetConfigs } from '../utils/Constants';
import WorkspaceDetails from './WorkspaceDetails';
import ManageButton from './workspace/ManageWorkspaceButton';
import WorkspaceBudget from './workspace/WorkspaceBudget';
import AddWorkspace from './workspace/AddWorkspace';

const color = colors['light'];

const Container = styled.div`
  display: flex;
  flex-flow: column wrap;
  min-width: 100%;
  min-height: 100%;
  flex: 1 1 100%;
  margin: -20px -30px;

  .workspaces {
    padding: 1.25rem 2.5rem;
    @media only screen and (max-width: 800px) {
      padding: 1.25rem;
    }
  }
`;

const WorkspaceWrap = styled.a`
  display: flex;
  flex-direction: row;
  width: 100%;
  background: white;
  padding: 1.5rem;
  border-radius: 0.375rem;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.15);
  @media only screen and (max-width: 800px) {
    padding: 1rem 0px;
  }
  @media only screen and (max-width: 700px) {
    padding: 0.75rem 0px;
    margin-bottom: 10px;
  }
  @media only screen and (max-width: 500px) {
    padding: 0px;
  }

  &:hover {
    text-decoration: none !important;
  }
`;

const ButtonIconLeft = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  column-gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  color: #5f6368;
  font-family: 'Barlow';
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00875rem;
  border-radius: 0.375rem;
  border: 1px solid #d0d5d8;
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06);

  :disabled {
    cursor: not-allowed;
  }
`;

const IconImg = styled.img`
  width: 1.25rem;
  height: 1.25rem;
`;

const WorkspaceData = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
  @media only screen and (max-width: 470px) {
    flex-direction: column;
    justify-content: center;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 15px 0px;
  }
`;

const WorkspaceImg = styled.img`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  @media only screen and (max-width: 700px) {
    width: 55px;
    height: 55px;
  }
  @media only screen and (max-width: 500px) {
    width: 3rem;
    height: 3rem;
  }
  @media only screen and (max-width: 470px) {
    width: 3.75rem;
    height: 3.75rem;
  }
`;

const WorkspaceContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
`;

const WorkspaceHeadWrap = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  margin-bottom: 20px;
`;

const WorkspaceText = styled.div`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.1875rem;
  @media only screen and (max-width: 700px) {
    font-size: 1.1rem;
  }
  @media only screen and (max-width: 700px) {
    font-size: 0.95rem;
  }
`;
const WorkspaceActionWrap = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 15px;
  @media only screen and (max-width: 470px) {
    margin-left: 0;
    margin-top: 20px;
  }
`;

let interval;

const Workspaces = (props: { person: Person }) => {
  const [loading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [workspace, setWorkspace] = useState<Workspace>();
  const { main, ui } = useStores();
  const [totalInvoicees, setTotalInvoices] = useState(0);
  const isMobile = useIsMobile();
  const config = widgetConfigs['workspaces'];
  const isMyProfile = ui?.meInfo?.pubkey === props?.person?.owner_pubkey;

  const user_pubkey = ui.meInfo?.owner_pubkey;

  const getUserWorkspaces = useCallback(async () => {
    setIsLoading(true);
    if (ui.selectedPerson) {
      await main.getUserWorkspaces(ui.selectedPerson);
    }
    setIsLoading(false);
  }, [main, ui.selectedPerson]);

  useEffect(() => {
    getUserWorkspaces();
  }, [getUserWorkspaces]);

  const closeHandler = () => {
    setIsOpen(false);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
  };

  const pollAllInvoices = useCallback(async () => {
    let i = 0;
    interval = setInterval(async () => {
      try {
        await main.pollAllUserWorkspaceBudget();

        const count = await main.allUserWorkspaceInvoiceCount();

        if (count === 0) {
          getUserWorkspaces();
          clearInterval(interval);
        }

        i++;
        if (i > 15) {
          if (interval) {
            getUserWorkspaces();
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.warn('Poll invoices error', e);
      }
    }, 2000);
  }, []);

  const getUserInvoicesCount = useCallback(async () => {
    const count = await main.allUserWorkspaceInvoiceCount();
    setTotalInvoices(count);
  }, [main]);

  useEffect(() => {
    getUserInvoicesCount();
  }, [getUserInvoicesCount]);

  useEffect(() => {
    if (!detailsOpen && !isOpen && totalInvoicees > 0) {
      pollAllInvoices();
    }
    return () => {
      clearInterval(interval);
    };
  }, [pollAllInvoices, detailsOpen, isOpen, totalInvoicees]);

  // renders org as list item
  const workspaceUi = (space: any, key: number) => {
    const btnDisabled = (!space.bounty_count && space.bount_count !== 0) || !space.uuid;
    return (
      <WorkspaceWrap key={key}>
        <WorkspaceData className="org-data">
          <WorkspaceImg src={space.img || avatarIcon} />
          <WorkspaceBudget org={space} user_pubkey={user_pubkey ?? ''} />
          <WorkspaceActionWrap>
            {user_pubkey && (
              <ManageButton
                org={space}
                user_pubkey={user_pubkey ?? ''}
                action={() => {
                  setWorkspace(space);
                  setDetailsOpen(true);
                }}
              />
            )}
            <ButtonIconLeft
              disabled={btnDisabled}
              onClick={() => window.open(`/workspace/bounties/${space.uuid}`, '_target')}
            >
              View Bounties
              <IconImg src="/static/open_in_new_grey.svg" alt="open_in_new_tab" />
            </ButtonIconLeft>
          </WorkspaceActionWrap>
        </WorkspaceData>
      </WorkspaceWrap>
    );
  };

  // renders list of orgs with header
  const renderWorkspaces = () => {
    if (main.workspaces.length) {
      return (
        <div className="workspaces">
          <WorkspaceHeadWrap>
            <WorkspaceText>Workspaces</WorkspaceText>
            {isMyProfile && (
              <Button
                leadingIcon={'add'}
                height={isMobile ? 40 : 45}
                text="Add Workspace"
                onClick={() => setIsOpen(true)}
                style={{ marginLeft: 'auto', borderRadius: 10 }}
              />
            )}
          </WorkspaceHeadWrap>
          <WorkspaceContainer>
            {main.workspaces.map((space: Workspace, i: number) => workspaceUi(space, i))}
          </WorkspaceContainer>
        </div>
      );
    } else {
      return (
        <Container>
          <NoResults showAction={isMyProfile} action={() => setIsOpen(true)} />
        </Container>
      );
    }
  };

  return (
    <Container>
      {loading && <PageLoadSpinner show={loading} />}
      {detailsOpen && (
        <WorkspaceDetails
          close={closeDetails}
          org={workspace}
          resetWorkspace={(newWorkspace: Workspace) => setWorkspace(newWorkspace)}
          getWorkspaces={getUserWorkspaces}
        />
      )}
      {!detailsOpen && !loading && (
        <>
          {renderWorkspaces()}
          {isOpen && (
            <Modal
              visible={isOpen}
              style={{
                height: '100%',
                flexDirection: 'column'
              }}
              envStyle={{
                marginTop: isMobile ? 64 : 0,
                background: color.pureWhite,
                zIndex: 20,
                ...(config?.modalStyle ?? {}),
                maxHeight: '100%',
                borderRadius: '10px',
                minWidth: isMobile ? '100%' : '34.4375rem',
                minHeight: isMobile ? '100%' : '22.1875rem'
              }}
              overlayClick={closeHandler}
              bigCloseImage={closeHandler}
              bigCloseImageStyle={{
                top: '-18px',
                right: '-18px',
                background: '#000',
                borderRadius: '50%'
              }}
            >
              <AddWorkspace
                closeHandler={closeHandler}
                getUserWorkspaces={getUserWorkspaces}
                owner_pubkey={ui.meInfo?.owner_pubkey}
              />
            </Modal>
          )}
        </>
      )}
    </Container>
  );
};

export default Workspaces;
