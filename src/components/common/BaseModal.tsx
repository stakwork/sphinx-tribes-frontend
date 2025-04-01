/* eslint-disable @typescript-eslint/typedef */
import { Modal, ModalProps } from '@mui/base';
import { styled } from '@mui/system';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

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

const Inner = styled('div')(() => ({
  backgroundColor: 'white',
  position: 'relative',
  borderRadius: '0.5rem',
  boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)',
  '&:focus, &:focus-visible': {
    outline: 'none'
  },
  fontFamily: 'Barlow'
}));

const CloseButton = styled('button')(() => ({
  cursor: 'pointer',
  padding: '12px',
  position: 'absolute',
  right: '8px',
  top: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  }
}));

export const BaseModal = ({ children, backdrop, ...props }: BaseModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.open && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [props.open]);

  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (!props.open || !modalContentRef.current) return;

      const focusableElements = modalContentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [props.open]);

  return (
    <StyledModal
      {...props}
      slots={{ backdrop: StyledBackdrop }}
      slotProps={{
        backdrop: {
          backdrop
        } as any
      }}
    >
      <Inner ref={modalContentRef}>
        <>
          {props.onClose && (
            <CloseButton
              ref={closeButtonRef}
              onClick={(e) => props.onClose?.(e, 'backdropClick')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  props.onClose?.(e, 'backdropClick');
                }
              }}
              aria-label="Close modal"
              tabIndex={0}
            >
              <img
                src="/static/close-thin.svg"
                alt=""
                width={30}
                height={30}
                aria-hidden="true"
                style={{
                  filter: backdrop === 'white' ? 'brightness(0)' : 'brightness(1)'
                }}
              />
            </CloseButton>
          )}
          {children}
        </>
      </Inner>
    </StyledModal>
  );
};
