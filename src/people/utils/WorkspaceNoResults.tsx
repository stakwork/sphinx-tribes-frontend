import React from 'react';
import { observer } from 'mobx-react-lite';
import { widgetConfigs } from './Constants';
import NoneSpace from './NoneSpace';

function WorkspaceNoResults(props: { showAction: boolean; action: () => void }) {
  const { text, icon } = widgetConfigs['workspaces'].action;

  if (props.showAction) {
    return (
      <NoneSpace
        small
        style={{
          margin: 'auto',
          marginTop: '10%'
        }}
        action={props.action}
        buttonText={text}
        buttonIcon={icon}
        {...widgetConfigs['workspaces']?.noneSpace['noUserResult']}
      />
    );
  }

  return (
    <NoneSpace
      small
      style={{
        margin: 'auto',
        marginTop: '10%'
      }}
      {...widgetConfigs['workspaces']?.noneSpace['noResult']}
    />
  );
}
export default observer(WorkspaceNoResults);
