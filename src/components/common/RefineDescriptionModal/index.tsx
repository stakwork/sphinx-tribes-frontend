import { EuiPopover, EuiText } from '@elastic/eui';
import { ActionButton } from 'people/widgetViews/workspace/style';
import React, { useState } from 'react';

export const RefineDescriptionModal = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

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
            gap: '0.5rem'
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
