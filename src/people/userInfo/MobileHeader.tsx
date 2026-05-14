import { Button, IconButton } from 'components/common';
import { PeopleMobileeHeaderProps } from 'people/interfaces';
import React from 'react';

export const HeaderMobile = ({ goBack, canEdit, logout, onEdit }: PeopleMobileeHeaderProps) => (
  <div
    style={{
      position: 'sticky',
      top: 0,
      left: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      minHeight: 64,
      padding: '0 20px',
      background: '#ffffff',
      borderBottom: '1px solid #ebedef',
      zIndex: 10
    }}
  >
    <IconButton onClick={goBack} icon="arrow_back" />
    {canEdit ? (
      <>
        <Button
          text="Edit Profile"
          onClick={onEdit}
          color="white"
          height={42}
          style={{
            fontSize: 13,
            color: '#3c3f41',
            border: 'none',
            marginLeft: 'auto'
          }}
          leadingIcon={'edit'}
          iconSize={15}
        />
        <Button
          text="Sign out"
          onClick={logout}
          height={42}
          style={{
            fontSize: 13,
            color: '#3c3f41',
            border: 'none',
            margin: 0,
            padding: 0
          }}
          iconStyle={{ color: '#8e969c' }}
          iconSize={20}
          color="white"
          leadingIcon="logout"
        />
      </>
    ) : (
      <div />
    )}
  </div>
);
