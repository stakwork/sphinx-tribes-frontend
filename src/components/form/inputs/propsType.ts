import React from 'react';

export interface Props {
  value: any;
  label: string;
  labelStyle?: any;
  type?: string;
  handleChange: any;
  placeholder?: string;
  handleBlur: any;
  handleFocus: any;
  readOnly: boolean;
  prepend?: string;
  extraHTML?: string;
  note?: string;
  options?: any[];
  name: string;
  error: string;
  github_state?: boolean;
  borderType?: 'bottom' | 'outline';
  imageIcon?: boolean;
  isFocused?: any;
  disabled?: boolean;
  notProfilePic?: boolean;
  style?: React.CSSProperties;
  testId?: string;
  maxLength?: number;
  setColor?: (data: boolean, value: string) => void;
  isOpen?: boolean;
  workspaceid?: string;
}
