import React from 'react';
import styled from 'styled-components';

const TabContainer = styled.div`
  z-index: 1;
  display: flex;
  width: fit-content;
  border-radius: 8px 4px 0px 0px;
  overflow: hidden;
  border-bottom: 1px solid #e0e0e0;
  height: 30px;
  min-height: 30px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 8px 0px;
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? '#6d6d6d' : '#eff0f3')};
  font-weight: ${(props) => (props.active ? '800' : '600')};
  color: ${(props) => (props.active ? '#ffffff' : '#000000')};
  transition: background-color 0.2s;
  border: ${(props) => (props.active ? '' : '1px solid #e0e0e0')};
  border-top-left-radius: ${(props) => (props.active ? '8px' : '8px')};
  border-top-right-radius: ${(props) => (props.active ? '8px' : '8px')};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -16px;
    width: 32px;
    height: 16px;
    background-color: inherit;
    transform: rotate(-45deg);
    transform-origin: top left;
    border-top-right-radius: 32px;
    z-index: 1;
    display: ${(props) => (props.active ? 'block' : 'none')};
  }
`;

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => (
    <TabContainer>
      <Tab active={activeTab === 'focus'} onClick={() => onTabChange('focus')}>
        Focus
      </Tab>
      <Tab active={activeTab === 'all'} onClick={() => onTabChange('all')}>
        All
      </Tab>
      <Tab active={activeTab === 'backlog'} onClick={() => onTabChange('backlog')}>
        Backlog
      </Tab>
      <Tab active={activeTab === 'archive'} onClick={() => onTabChange('archive')}>
        Archive
      </Tab>
    </TabContainer>
  );

export default TabBar;
