import React, { useCallback, useEffect, useState } from 'react';
import { EuiGlobalToastList } from '@elastic/eui';
import { useStores } from 'store';
import { useIsMobile } from 'hooks/uiHooks';
import { widgetConfigs } from 'people/utils/Constants';
import { userHasRole } from 'helpers';
import { Person } from 'store/interface';
import { Button, Modal } from '../../../components/common';
import { colors } from '../../../config/colors';
import DeleteTicketModal from '../DeleteModal';
import { ManageWorkspaceUsersModalProps } from './interface';
import { HeadButtonWrap, UserWrap, UsersHeadWrap, UsersHeader } from './style';
import Users from './UsersList';
import AddUserModal from './AddUserModal';

const color = colors['light'];
const config = widgetConfigs.workspaces;

const ManageWorkspaceUsersModal = (props: ManageWorkspaceUsersModalProps) => {
  const { isOpen, close, org, uuid, users, updateUsers } = props;

  const { main, ui } = useStores();
  const [loading, setIsLoading] = useState<boolean>(false);
  const [isOpenAddUser, setIsOpenAddUser] = useState<boolean>(false);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [user, setUser] = useState<Person>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [disableFormButtons, setDisableFormButtons] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const isMobile = useIsMobile();
  const isWorkspaceAdmin = org?.owner_pubkey === ui.meInfo?.owner_pubkey;

  const editWorkspaceDisabled =
    !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION');

  const getUserRoles = useCallback(
    async (user: any) => {
      const pubkey = user.owner_pubkey;
      if (uuid && pubkey) {
        const userRoles = await main.getUserRoles(uuid, pubkey);
        setUserRoles(userRoles);
      }
    },
    [uuid, main]
  );

  const getWorkspaceUsers = useCallback(async () => {
    if (uuid) {
      const users = await main.getWorkspaceUsers(uuid);
      updateUsers(users);
      return users;
    }
  }, [main, uuid, updateUsers]);

  useEffect(() => {
    getWorkspaceUsers();
    if (uuid && ui.meInfo) {
      getUserRoles(ui.meInfo);
    }
  }, [getWorkspaceUsers, getUserRoles, ui.meInfo, uuid]);

  function addToast(title: string, color: 'danger' | 'success') {
    setToasts([
      {
        id: `${Math.random()}`,
        title,
        color
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const handleSettingsClick = async (user: any) => {
    setUser(user);
    getUserRoles(user);
  };

  const handleDeleteClick = async (user: any) => {
    setUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => setShowDeleteModal(false);

  const deleteWorkspaceUser = async (user: any) => {
    if (uuid) {
      const res = await main.deleteWorkspaceUser(user, uuid);

      if (res.status === 200) {
        addToast('User deleted successfully', 'success');
        await getWorkspaceUsers();
      } else {
        addToast('Error: could not delete user', 'danger');
      }
    }
  };

  const confirmDelete = async () => {
    try {
      if (user) {
        await deleteWorkspaceUser(user);
      }
    } catch (error) {
      console.log(error);
    }
    closeDeleteModal();
  };

  const closeAddUserHandler = () => {
    setIsOpenAddUser(false);
  };

  const onSubmitUser = async (body: any) => {
    setIsLoading(true);

    body.workspace_uuid = uuid;

    const res = await main.addWorkspaceUser(body);
    if (res.status === 200) {
      addToast('User added to workspace successfully', 'success');
      const recentUsers = await getWorkspaceUsers();
      const user = recentUsers?.filter((user: Person) => user.owner_pubkey === body.owner_pubkey);
      if (user?.length === 1) {
        setUser(user[0]);
      }
    } else {
      addToast('Error: could not add user', 'danger');
    }
    closeAddUserHandler();
    setIsLoading(false);
  };

  return (
    <>
      <Modal
        visible={isOpen}
        style={{
          height: '100%',
          flexDirection: 'column'
        }}
        envStyle={{
          marginTop: isMobile ? 64 : 0,
          background: color.pureWhite,
          zIndex: 0,
          ...(config?.modalStyle ?? {}),
          maxHeight: '100%',
          borderRadius: '10px',
          minWidth: !isMobile ? '41.25rem' : '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          minHeight: isMobile ? '100vh' : '29rem'
        }}
        overlayClick={close}
        bigCloseImage={close}
        bigCloseImageStyle={{
          top: isMobile ? '26px' : '-18px',
          right: isMobile ? '26px' : '-18px',
          background: '#000',
          borderRadius: '50%'
        }}
      >
        <UserWrap>
          <UsersHeadWrap>
            <UsersHeader>Users</UsersHeader>
            <HeadButtonWrap forSmallScreen={false}>
              <Button
                disabled={editWorkspaceDisabled}
                text="Add User"
                data-testid="add-user"
                color="white"
                style={{
                  borderRadius: '5px'
                }}
                onClick={() => setIsOpenAddUser(true)}
              />
            </HeadButtonWrap>
          </UsersHeadWrap>
          <Users
            org={org}
            handleDeleteClick={handleDeleteClick}
            handleSettingsClick={handleSettingsClick}
            userRoles={userRoles}
            users={users}
          />
        </UserWrap>
      </Modal>
      {showDeleteModal && (
        <DeleteTicketModal
          closeModal={closeDeleteModal}
          confirmDelete={confirmDelete}
          text={'User'}
          imgUrl={user?.img}
          userDelete={true}
        />
      )}
      {isOpenAddUser && (
        <AddUserModal
          isOpen={isOpenAddUser}
          close={closeAddUserHandler}
          onSubmit={onSubmitUser}
          disableFormButtons={disableFormButtons}
          setDisableFormButtons={setDisableFormButtons}
          loading={loading}
        />
      )}
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={5000} />
    </>
  );
};

export default ManageWorkspaceUsersModal;
