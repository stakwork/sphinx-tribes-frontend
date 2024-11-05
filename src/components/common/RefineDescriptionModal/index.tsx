import { EuiPopover, EuiText } from '@elastic/eui';
import { useIsMobile } from 'hooks';
import { ActionButton } from 'people/widgetViews/workspace/style';
import React, { useState } from 'react';

export const RefineDescriptionModal = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);
  const isMobile = useIsMobile();

  return (
    <EuiPopover
      button={
        <ActionButton
          onClick={togglePopover}
          style={{
            padding: '0.5rem',
            width: 'fit-content',
            marginTop: '6px',
            borderRadius: '4px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            ...(isMobile
              ? {
                  marginBottom: '16px',
                  padding: '0 16px',
                  borderRadius: '22px',
                  fontSize: '12px'
                }
              : {})
          }}
        >
          Refine Description
        </ActionButton>
      }
      panelStyle={{
        minWidth: '300px',
        padding: '16px'
      }}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downLeft"
    >
      <EuiText size="s">
        <h4>Coming Soon</h4>
      </EuiText>
    </EuiPopover>
  );
};
