import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';
import { Artifact, VisualContent, TextContent } from '../../../store/interface.ts';
import { renderMarkdown } from '../../utils/RenderMarkdown.tsx';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  background-color: #f9f9f9;
  padding: 0 0 16px 0;
  box-sizing: border-box;
  margin: 0px 0 0 10px;
  position: relative;
`;

const BrowserTabBar = styled.div`
  display: flex;
  background-color: #e8e8e8;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 8px 8px 0 8px;
  overflow-x: auto;
  border-bottom: 1px solid #ccc;
`;

const BrowserTab = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${(props) => (props.active ? '#fff' : '#e0e0e0')};
  padding: 8px 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  margin-right: 4px;
  font-size: 13px;
  max-width: 180px;
  min-width: 100px;
  position: relative;
  border: 1px solid #ccc;
  border-bottom: ${(props) => (props.active ? '1px solid #fff' : '1px solid #ccc')};
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TabTitle = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseTabButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  margin-left: 8px;
  padding: 2px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #333;
  }
`;

const NewTabButton = styled.button`
  background-color: #e0e0e0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px !important;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  width: 28px;
  height: 28px;
  margin-top: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d0d0d0;
    color: #333;
  }

  &:active {
    background-color: #c0c0c0;
  }
`;

const BrowserToolbar = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
`;

const NavigationButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  padding: 6px;
  margin-right: 4px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const AddressBar = styled.input`
  flex: 1;
  margin: 0 8px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const EmptyTabContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const IframeWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden;
  background-color: #fff;
  z-index: 0;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const CodeViewer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: #1e1e1e;
  padding: 12px;
  min-height: 65vh;
  z-index: 0;
`;

const TextViewer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 12px;
  min-height: 65vh;
  z-index: 0;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
  margin-top: 12px;
  z-index: 100;
  position: sticky;
  bottom: 0;
  background-color: #f9f9f9;
  padding: 8px 0;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid #ddd;
  background-color: #fff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

interface Tab {
  id: string;
  title: string;
  url: string;
  history: string[];
  currentHistoryIndex: number;
}

interface VisualScreenViewerProps {
  visualArtifact: Artifact[];
  codeArtifact: Artifact[];
  textArtifact: Artifact[];
  activeTab: 'visual' | 'code' | 'text';
}

const VisualScreenViewer: React.FC<VisualScreenViewerProps> = ({
  visualArtifact,
  codeArtifact,
  textArtifact,
  activeTab
}) => {
  const [visualIndex, setVisualIndex] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const [browserTabs, setBrowserTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getPageTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return 'New Tab';
    }
  };

  const formatUrlForDisplay = (url: string): string => {
    try {
      new URL(url);
      return url.replace(/^(https?:\/\/)/, '');
    } catch (e) {
      return url;
    }
  };

  const ensureProtocol = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  useEffect(() => {
    const savedTabs = localStorage.getItem('browserTabs');
    const savedActiveTabId = localStorage.getItem('activeTabId');

    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setBrowserTabs(parsedTabs);

        if (savedActiveTabId && parsedTabs.some((tab: Tab) => tab.id === savedActiveTabId)) {
          setActiveTabId(savedActiveTabId);
          const activeTab = parsedTabs.find((tab: Tab) => tab.id === savedActiveTabId);
          if (activeTab) {
            setAddressInput(activeTab.url);
          }
        } else if (parsedTabs.length > 0) {
          setActiveTabId(parsedTabs[0].id);
          setAddressInput(parsedTabs[0].url);
        }
      } catch (e) {
        console.error('Error parsing saved tabs:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (browserTabs.length > 0) {
      localStorage.setItem('browserTabs', JSON.stringify(browserTabs));
      if (activeTabId) {
        localStorage.setItem('activeTabId', activeTabId);
      }
    } else {
      localStorage.removeItem('browserTabs');
      localStorage.removeItem('activeTabId');
    }
  }, [browserTabs, activeTabId]);

  useEffect(() => {
    if (visualArtifact.length > 0) {
      setVisualIndex(visualArtifact.length - 1);

      if (browserTabs.length === 0) {
        const currentVisual = visualArtifact[visualArtifact.length - 1];
        if (currentVisual && currentVisual.content) {
          const content = currentVisual.content as VisualContent;
          const url = content.url || '';
          const tabId = `tab-${Date.now()}`;

          const initialTab = {
            id: tabId,
            title: getPageTitleFromUrl(url),
            url: url,
            history: [url],
            currentHistoryIndex: 0
          };

          setBrowserTabs([initialTab]);
          setActiveTabId(tabId);
          setAddressInput(formatUrlForDisplay(url));
        }
      }
    }

    if (codeArtifact.length > 0) {
      setCodeIndex(codeArtifact.length - 1);
    }
    if (textArtifact.length > 0) {
      setTextIndex(textArtifact.length - 1);
    }
  }, [visualArtifact, codeArtifact, textArtifact, browserTabs.length]);

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = browserTabs.find((tab) => tab.id === tabId);
    if (tab) {
      setAddressInput(tab.url);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();

    if (browserTabs.length <= 1) return;

    const newTabs = browserTabs.filter((tab) => tab.id !== tabId);
    setBrowserTabs(newTabs);

    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
      setAddressInput(newTabs[0].url);
    } else if (newTabs.length === 0) {
      setActiveTabId(null);
      setAddressInput('');
    }
  };

  const handleNewTab = () => {
    const tabId = `tab-${Date.now()}`;
    const newTab = {
      id: tabId,
      title: 'New Tab',
      url: 'about:blank',
      history: ['about:blank'],
      currentHistoryIndex: 0
    };

    setBrowserTabs([...browserTabs, newTab]);
    setActiveTabId(tabId);
    setAddressInput('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
  };

  const handleNavigation = (url: string) => {
    if (activeTabId) {
      const formattedUrl = ensureProtocol(url);

      const updatedTabs = browserTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: formattedUrl,
              title: getPageTitleFromUrl(formattedUrl),
              history: [...tab.history.slice(0, tab.currentHistoryIndex + 1), formattedUrl],
              currentHistoryIndex: tab.currentHistoryIndex + 1
            }
          : tab
      );

      setBrowserTabs(updatedTabs);
      setAddressInput(formatUrlForDisplay(formattedUrl));

      localStorage.setItem('browserTabs', JSON.stringify(updatedTabs));
      localStorage.setItem('activeTabId', activeTabId);
    }
  };

  const handleAddressSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const formattedUrl = ensureProtocol(addressInput);
      handleNavigation(formattedUrl);
    }
  };

  const handleBack = () => {
    if (!activeTabId) return;

    const activeTab = browserTabs.find((tab) => tab.id === activeTabId);
    if (activeTab && activeTab.currentHistoryIndex > 0) {
      const newIndex = activeTab.currentHistoryIndex - 1;
      const previousUrl = activeTab.history[newIndex];

      const updatedTabs = browserTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            url: previousUrl,
            currentHistoryIndex: newIndex
          };
        }
        return tab;
      });

      setBrowserTabs(updatedTabs);
      setAddressInput(previousUrl);
    }
  };

  const handleForward = () => {
    if (!activeTabId) return;

    const activeTab = browserTabs.find((tab) => tab.id === activeTabId);
    if (activeTab && activeTab.currentHistoryIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.currentHistoryIndex + 1;
      const nextUrl = activeTab.history[newIndex];

      const updatedTabs = browserTabs.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            url: nextUrl,
            currentHistoryIndex: newIndex
          };
        }
        return tab;
      });

      setBrowserTabs(updatedTabs);
      setAddressInput(nextUrl);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.location.reload();
      } catch (error) {
        const currentUrl = activeTabId
          ? browserTabs.find((tab) => tab.id === activeTabId)?.url
          : null;
        if (currentUrl && currentUrl !== 'about:blank') {
          iframeRef.current.src = currentUrl;
        }
      }
    }
  };

  const getActiveTab = useCallback(
    () => browserTabs.find((tab) => tab.id === activeTabId),
    [browserTabs, activeTabId]
  );

  const handleNext = () => {
    if (activeTab === 'visual' && visualIndex > 0) {
      const newIndex = visualIndex - 1;
      setVisualIndex(newIndex);

      const nextVisual = visualArtifact[newIndex];
      if (nextVisual && nextVisual.content) {
        const content = nextVisual.content as VisualContent;
        const url = content.url || '';
        handleNavigation(url);
      }
    } else if (activeTab === 'code' && codeIndex > 0) {
      setCodeIndex(codeIndex - 1);
    } else if (activeTab === 'text' && textIndex > 0) {
      setTextIndex(textIndex - 1);
    }
  };

  const handlePrevious = () => {
    const maxIndex =
      activeTab === 'visual'
        ? visualArtifact.length - 1
        : activeTab === 'code'
        ? codeArtifact.length - 1
        : textArtifact.length - 1;

    if (activeTab === 'visual' && visualIndex < maxIndex) {
      const newIndex = visualIndex + 1;
      setVisualIndex(newIndex);

      const prevVisual = visualArtifact[newIndex];
      if (prevVisual && prevVisual.content) {
        const content = prevVisual.content as VisualContent;
        const url = content.url || '';
        handleNavigation(url);
      }
    } else if (activeTab === 'code' && codeIndex < maxIndex) {
      setCodeIndex(codeIndex + 1);
    } else if (activeTab === 'text' && textIndex < maxIndex) {
      setTextIndex(textIndex + 1);
    }
  };

  const currentVisual = visualArtifact[visualIndex];
  const currentCode = codeArtifact[codeIndex];
  const currentText = textArtifact[textIndex];
  const activeTabObj = getActiveTab();

  useEffect(() => {
    if (activeTabObj) {
      setAddressInput(formatUrlForDisplay(activeTabObj.url));
    }
  }, [activeTabObj]);

  return (
    <ViewerContainer>
      {activeTab === 'visual' && currentVisual && (
        <>
          <BrowserContainer>
            <BrowserTabBar>
              {browserTabs.map((tab) => (
                <BrowserTab
                  key={tab.id}
                  active={tab.id === activeTabId}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <TabTitle>{tab.title}</TabTitle>
                  <CloseTabButton onClick={(e) => handleCloseTab(e, tab.id)}>
                    <MaterialIcon icon="close" style={{ fontSize: '14px' }} />
                  </CloseTabButton>
                </BrowserTab>
              ))}
              <NewTabButton onClick={handleNewTab}>
                <MaterialIcon icon="add" style={{ fontSize: '16px' }} />
              </NewTabButton>
            </BrowserTabBar>

            <BrowserToolbar>
              <NavigationButton
                onClick={handleBack}
                disabled={!activeTabObj || activeTabObj.currentHistoryIndex <= 0}
              >
                <MaterialIcon icon="arrow_back" style={{ fontSize: '16px' }} />
              </NavigationButton>
              <NavigationButton
                onClick={handleForward}
                disabled={
                  !activeTabObj ||
                  activeTabObj.currentHistoryIndex >= activeTabObj.history.length - 1
                }
              >
                <MaterialIcon icon="arrow_forward" style={{ fontSize: '16px' }} />
              </NavigationButton>
              <NavigationButton onClick={handleRefresh}>
                <MaterialIcon icon="refresh" style={{ fontSize: '16px' }} />
              </NavigationButton>
              <AddressBar
                value={addressInput}
                onChange={handleAddressChange}
                onKeyDown={handleAddressSubmit}
                placeholder="Enter URL"
              />
            </BrowserToolbar>

            <IframeWrapper>
              {activeTabObj?.url === 'about:blank' ? (
                <EmptyTabContent />
              ) : (
                <StyledIframe
                  ref={iframeRef}
                  src={activeTabObj?.url || (currentVisual.content as VisualContent).url || ''}
                  title="Visual Screen Viewer"
                />
              )}
            </IframeWrapper>
          </BrowserContainer>

          <PaginationControls>
            <Button onClick={handlePrevious} disabled={visualIndex >= visualArtifact.length - 1}>
              {'<'}
            </Button>
            <PageIndicator>
              <b>{visualArtifact.length - visualIndex}</b> of <b>{visualArtifact.length}</b>
            </PageIndicator>
            <Button onClick={handleNext} disabled={visualIndex <= 0}>
              {'>'}
            </Button>
          </PaginationControls>
        </>
      )}

      {activeTab === 'code' && currentCode && (
        <>
          <CodeViewer>
            {renderMarkdown((currentCode.content as TextContent).content || '', {
              codeBlockBackground: '#282c34',
              textColor: '#abb2bf',
              bubbleTextColor: 'white',
              borderColor: '#444',
              codeBlockFont: 'Courier New'
            })}
          </CodeViewer>
          <PaginationControls>
            <Button onClick={handlePrevious} disabled={codeIndex === 0}>
              {'<'}
            </Button>
            <PageIndicator>
              <b>{codeIndex + 1}</b> of <b>{codeArtifact.length}</b>
            </PageIndicator>
            <Button onClick={handleNext} disabled={codeIndex === codeArtifact.length - 1}>
              {'>'}
            </Button>
          </PaginationControls>
        </>
      )}

      {activeTab === 'text' && currentText && (
        <>
          <TextViewer>
            {renderMarkdown((currentText.content as TextContent).content || '')}
          </TextViewer>
          <PaginationControls>
            <Button onClick={handlePrevious} disabled={textIndex === 0}>
              {'<'}
            </Button>
            <PageIndicator>
              <b>{textIndex + 1}</b> of <b>{textArtifact.length}</b>
            </PageIndicator>
            <Button onClick={handleNext} disabled={textIndex === textArtifact.length - 1}>
              {'>'}
            </Button>
          </PaginationControls>
        </>
      )}
    </ViewerContainer>
  );
};

export default VisualScreenViewer;
