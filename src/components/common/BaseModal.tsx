/* eslint-disable @typescript-eslint/typedef */
import { Modal, ModalProps } from '@mui/base';
import { Box, styled } from '@mui/system';
import clsx from 'clsx';
import React from 'react';

export type BackdropProps = {
  backdrop?: 'white' | 'black';
};

export type BaseModalProps = ModalProps & BackdropProps;

const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1000000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// eslint-disable-next-line react/display-name
const Backdrop = React.forwardRef<HTMLDivElement, { open?: boolean; className: string }>(
  (props, ref) => {
    const { open, className, ...other } = props;
    return <div className={clsx({ 'MuiBackdrop-open': open }, className)} ref={ref} {...other} />;
  }
);

const StyledBackdrop = styled(Backdrop)<BackdropProps>`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: ${({ backdrop = 'black' }: BackdropProps) => {
    if (backdrop === 'white') {
      return 'rgb(255 255 255 / 0.8)';
    }

    return 'rgb(0 0 0 / 0.6)';
  }};
  -webkit-tap-highlight-color: transparent;
`;

export const Inner = styled('div')(() => ({
  backgroundColor: 'white',
  position: 'relative',
  borderRadius: '0.5rem',
  boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)',
  '&:focus, &:focus-visible': {
    outline: 'none'
  },
  fontFamily: 'Barlow'
}));

export const BaseModal = ({
  children,
  backdrop,
  title = 'Sphinx App Download Modal',
  ...props
}: BaseModalProps) => (
  <StyledModal
    {...props}
    slots={{ backdrop: StyledBackdrop }}
    slotProps={{
      backdrop: {
        backdrop
      } as any
    }}
    aria-modal="true"
    aria-labelledby="modal-title"
    role="dialog"
  >
    <Inner>
      <>
        <h2
          id="modal-title"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            borderWidth: 0
          }}
        >
          {title}
        </h2>

        {props.onClose && (
          <Box
            onClick={(e) => props.onClose?.(e, 'backdropClick')}
            p={1}
            sx={{
              cursor: 'pointer',
              '&:focus': {
                outline: '2px solid #4A90E2',
                borderRadius: '4px'
              }
            }}
            component="button"
            aria-label="Close Button"
            position="absolute"
            right={1}
            top={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="none"
            bgcolor="transparent"
          >
            <img src="/static/close-thin.svg" alt="Close icon" />
          </Box>
        )}
        {children}
      </>
    </Inner>
  </StyledModal>
);
