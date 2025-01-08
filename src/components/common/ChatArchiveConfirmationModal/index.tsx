import React, { PropsWithChildren } from 'react';
import { Stack } from '@mui/system';
import MaterialIcon from '@material/react-material-icon';
import { colors } from 'config';
import { BaseModal } from '../BaseModal';
import IconButton from '../IconButton2';
import { useCreateModal } from '../useCreateModal';

export type ChatArchiveConfirmationModalProps = PropsWithChildren<{
  onClose: () => void;
  onConfirmArchive: () => void;
  onCancel?: () => void;
}>;

export const ChatArchiveConfirmationModal = ({
  onClose,
  children,
  onCancel,
  onConfirmArchive
}: ChatArchiveConfirmationModalProps) => {
  const closeHandler = () => {
    onClose();
    onCancel?.();
  };

  const confirmArchiveHandler = () => {
    onConfirmArchive();
    onClose();
  };

  return (
    <BaseModal backdrop="white" open onClose={closeHandler}>
      <Stack minWidth={350} p={4} alignItems="center" spacing={3}>
        <MaterialIcon
          icon="archive"
          className="MaterialIcon"
          style={{ fontSize: 32, color: colors['light'].grayish.G300 }}
        />
        {children}
        <Stack width="100%" direction="row" justifyContent="space-between">
          <IconButton width={120} height={44} color="white" text="Cancel" onClick={closeHandler} />
          <IconButton
            width={120}
            height={44}
            color="danger"
            text="Archive"
            dataTestId="archive-confirmation"
            onClick={confirmArchiveHandler}
          />
        </Stack>
      </Stack>
    </BaseModal>
  );
};

export const useChatArchiveConfirmationModal = () => {
  const openModal = useCreateModal();

  const openArchiveConfirmation = (props: Omit<ChatArchiveConfirmationModalProps, 'onClose'>) => {
    openModal({
      Component: ChatArchiveConfirmationModal,
      props
    });
  };

  return { openArchiveConfirmation };
};
