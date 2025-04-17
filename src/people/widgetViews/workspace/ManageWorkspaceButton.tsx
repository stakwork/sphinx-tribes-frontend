import React, { useState, useEffect, useCallback } from 'react';
import { useStores } from 'store';
import { WorkspaceUser } from 'store/interface';
import styled from 'styled-components';

const Button = styled.button`
  padding: 0.5rem 1rem;
  width: 7rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--Input-Outline-1, #d0d5d8);
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06);
  color: #5f6368;
  font-family: 'Barlow';
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 0rem;
  letter-spacing: 0.00875rem;
`;

const ManageButton = (props: { user_pubkey: string; org: any; action: () => void }) => {
  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | undefined>();
  const { main, ui } = useStores();

  const { org, action } = props;

  const isWorkspaceAdmin = org?.owner_pubkey === ui.meInfo?.owner_pubkey;
  const pubkey = workspaceUser?.owner_pubkey;
  const isUser = pubkey !== '' && ui.meInfo?.owner_pubkey === pubkey;

  const hasAccess = isWorkspaceAdmin || isUser;

  const getUserRoles = useCallback(async () => {
    try {
      const user = await main.getWorkspaceUser(org.uuid);
      setWorkspaceUser(user);
    } catch (e) {
      console.error('User roles error', e);
    }
  }, [org.uuid, main]);

  useEffect(() => {
    getUserRoles();
  }, [getUserRoles]);

  return (
    <>
      {hasAccess && (
        <Button data-testid="workspace-manage-btn" onClick={action} data-work-name={org.name}>
          Manage
        </Button>
      )}
    </>
  );
};

export default ManageButton;
