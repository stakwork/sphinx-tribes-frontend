import MaterialIcon from '@material/react-material-icon';
import React from 'react';
import { Person } from 'store/main';
import { userHasRole } from 'helpers';
import { useStores } from 'store';
import avatarIcon from '../../../public/static/profile_avatar.svg';
import { UserListProps } from './interface';
import {
  User,
  UserImage,
  UserDetails,
  UserName,
  UserPubkey,
  UserAction,
  IconWrap,
  ActionBtn,
  UsersList
} from './style';

const Users = (props: UserListProps) => {
  const { main, ui } = useStores();

  const { userRoles, users, handleDeleteClick, handleSettingsClick } = props;

  const isOrganizationAdmin = props.org?.owner_pubkey === ui.meInfo?.owner_pubkey;

  const deleteUserDisabled =
    !isOrganizationAdmin && !userHasRole(main.bountyRoles, userRoles, 'DELETE USER');
  const addRolesDisabled =
    !isOrganizationAdmin && !userHasRole(main.bountyRoles, userRoles, 'ADD ROLES');

  return (
    <UsersList>
      {users.map((user: Person, i: number) => {
        const isUser = user.owner_pubkey === ui.meInfo?.owner_pubkey;
        const settingsDisabled = isUser || addRolesDisabled;
        return (
          <User key={i}>
            <UserImage src={user.img || avatarIcon} data-testid={'avatarIcon'} />
            <UserDetails>
              <UserName data-testid={'user_alias'}>{user.owner_alias}</UserName>
              <UserPubkey data-testid={'user_pubkey'}>{user.owner_pubkey}</UserPubkey>
            </UserDetails>
            <UserAction>
              <IconWrap>
                <ActionBtn disabled={settingsDisabled}>
                  <MaterialIcon
                    disabled={settingsDisabled}
                    data-testid="settings-icon"
                    icon={'settings'}
                    style={{
                      fontSize: 24,
                      cursor: settingsDisabled ? 'not-allowed' : 'pointer',
                      color: settingsDisabled ? '#b0b7bc' : '#5f6368'
                    }}
                    onClick={() => handleSettingsClick(user)}
                  />
                </ActionBtn>
              </IconWrap>
              <IconWrap>
                <ActionBtn disabled={deleteUserDisabled}>
                  <MaterialIcon
                    data-testid="delete-icon"
                    icon={'delete'}
                    style={{
                      fontSize: 24,
                      cursor: deleteUserDisabled ? 'not-allowed' : 'pointer',
                      color: deleteUserDisabled ? '#b0b7bc' : '#5f6368'
                    }}
                    onClick={() => {
                      handleDeleteClick(user);
                    }}
                  />
                </ActionBtn>
              </IconWrap>
            </UserAction>
          </User>
        );
      })}
    </UsersList>
  );
};

export default Users;
