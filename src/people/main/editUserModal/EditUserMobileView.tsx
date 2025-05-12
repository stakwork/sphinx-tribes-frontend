import { Modal } from 'components/common';
import React from 'react';
import { observer } from 'mobx-react-lite';
import AboutFocusView from '../AboutFocusView';
import { formConfig } from './config';
import { useUserEdit } from './useEditUser';

export const EditUserMobileView = observer(() => {
  const { canEdit, closeHandler, person, modals } = useUserEdit();

  return (
    <Modal fill visible={modals.userEditModal} data-testid="edit-user-mobile-view-component">
      <AboutFocusView
        person={person}
        canEdit={canEdit}
        selectedIndex={1}
        config={formConfig}
        onSuccess={closeHandler}
        goBack={closeHandler}
      />
    </Modal>
  );
});
