import React from 'react';
import styled from 'styled-components';
import { FeatureStatus, FeatureTabLabels } from 'store/interface';

const Container = styled.div`
  position: relative;
  background: #f8f9fa;
  padding-top: 30px;
  border-radius: 8px 8px 0 0;
`;

const TabWrapper = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: 30px;
  min-height: 30px;
  width: max-content;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 4px 0 0;
  overflow: hidden;
  z-index: 1;
`;

const TabButton = styled.button<{ isSelected: boolean }>`
  position: relative;
  width: 200px;
  height: 100%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 16px;
  letter-spacing: 0.05em;
  font-weight: ${({ isSelected }) => (isSelected ? '800' : '600')};
  color: ${({ isSelected }) => (isSelected ? '#fff' : '#000')};
  background: ${({ isSelected }) => (isSelected ? '#6d6d6d' : '#eff0f3')};
  cursor: pointer;
  transition: all 0.2s ease;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  ${({ isSelected }) =>
    !isSelected &&
    `
    border: 1px solid #e0e0e0;
  `}

  &:before {
    content: '';
    display: ${({ isSelected }) => (isSelected ? 'block' : 'none')};
    position: absolute;
    top: 0;
    right: -16px;
    width: 32px;
    height: 16px;
    background: inherit;
    transform: rotate(-45deg);
    transform-origin: top left;
    border-top-right-radius: 32px;
    z-index: 1;
  }
`;

interface TabBarProps {
  activeTab: FeatureTabLabels;
  onTabChange: (tab: FeatureTabLabels) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: FeatureTabLabels; label: string }> = [
    { id: 'focus', label: 'Focus' },
    { id: 'all', label: 'All' },
    { id: FeatureStatus.BACKLOG, label: 'Backlog' },
    { id: FeatureStatus.ARCHIVE, label: 'Archive' }
  ];

  return (
    <Container>
      <TabWrapper>
        {tabs.map(({ id, label }) => (
          <TabButton key={id} isSelected={activeTab === id} onClick={() => onTabChange(id)}>
            {label}
          </TabButton>
        ))}
      </TabWrapper>
    </Container>
  );
};

export default TabBar;
