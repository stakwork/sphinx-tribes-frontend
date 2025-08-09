import React from 'react';
import MaterialIcon from '@material/react-material-icon';
import {
  FullNoBudgetWrap,
  FullNoBudgetText,
  NoBudgetWrap,
  NoBudgetText
} from 'people/widgetViews/workspace/style';

interface RestrictedAccessProps {
  /** Whether access is restricted/disabled */
  isRestricted: boolean;
  /** Styling variant - "full" uses FullNoBudgetWrap, "compact" uses NoBudgetWrap */
  variant?: 'full' | 'compact';
  /** Custom message text. If not provided, uses default based on context */
  message?: string;
  /** Context for default message - affects default text */
  context?: 'page' | 'budget';
  /** Custom icon to use instead of default lock */
  icon?: string;
  /** Additional styles for the icon */
  iconStyle?: React.CSSProperties;
  /** Children to render instead of default message (for custom content) */
  children?: React.ReactNode;
}

const DEFAULT_MESSAGES = {
  page: 'You have restricted permissions and you are unable to view this page. Reach out to the workspace admin to get them updated.',
  budget:
    'You have restricted permissions and are unable to view the budget. Reach out to the workspace admin to get them updated.'
};

const DEFAULT_ICON_STYLE = {
  fontSize: 30,
  cursor: 'pointer',
  color: '#ccc'
};

export const RestrictedAccess: React.FC<RestrictedAccessProps> = ({
  isRestricted,
  variant = 'full',
  message,
  context = 'page',
  icon = 'lock',
  iconStyle = {},
  children
}) => {
  if (!isRestricted) {
    return null;
  }

  const WrapperComponent = variant === 'full' ? FullNoBudgetWrap : NoBudgetWrap;
  const TextComponent = variant === 'full' ? FullNoBudgetText : NoBudgetText;

  const finalMessage = message || DEFAULT_MESSAGES[context];
  const finalIconStyle = { ...DEFAULT_ICON_STYLE, ...iconStyle };

  return (
    <WrapperComponent>
      <MaterialIcon icon={icon} style={finalIconStyle} />
      {children || <TextComponent>{finalMessage}</TextComponent>}
    </WrapperComponent>
  );
};

export default RestrictedAccess;
