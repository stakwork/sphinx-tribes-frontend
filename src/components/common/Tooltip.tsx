import React, { useState } from 'react';
import styled from 'styled-components';
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;
const TooltipContent = styled.div<{ visible: boolean; position: string }>`
  position: absolute;
  background: rgba(31, 41, 55, 0.95);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  max-width: 200px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition:
    opacity 0.2s,
    visibility 0.2s;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  ${({ position }) => {
    switch (position) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          &::after {
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-color: rgba(31, 41, 55, 0.95) transparent transparent transparent;
          }
        `;
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
          &::after {
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-color: transparent rgba(31, 41, 55, 0.95) transparent transparent;
          }
        `;
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          &::after {
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-color: transparent transparent rgba(31, 41, 55, 0.95) transparent;
          }
        `;
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
          &::after {
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-color: transparent transparent transparent rgba(31, 41, 55, 0.95);
          }
        `;
      default:
        return '';
    }
  }}
  &::after {
    content: '';
    position: absolute;
    border-width: 5px;
    border-style: solid;
  }
`;
const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'right' }) => {
  const [visible, setVisible] = useState(false);
  return (
    <TooltipWrapper onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      <TooltipContent visible={visible} position={position}>
        {text}
      </TooltipContent>
    </TooltipWrapper>
  );
};
export default Tooltip;
