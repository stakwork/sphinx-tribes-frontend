import React from 'react';
import styled from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 8px 24px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? '#9e9e9e' : 'transparent')};
  color: ${(props) => (props.active ? '#ffffff' : '#5f6368')};
  font-weight: 500;
  width: 8%;
  text-align: center;
  font-size: 14px;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 4px;

  &:hover {
    background-color: ${(props) => (props.active ? '#9e9e9e' : '#e0e0e0')};
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
