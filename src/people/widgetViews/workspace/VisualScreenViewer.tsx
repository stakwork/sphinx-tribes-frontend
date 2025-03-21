import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';
import { Artifact, VisualContent, TextContent } from '../../../store/interface.ts';
import { renderMarkdown } from '../../utils/RenderMarkdown.tsx';
import LogsScreenViewer from './LogsScreenViewer.tsx';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 76vh;
  background-color: #f9f9f9;
  box-sizing: border-box;
  margin: 0 0 0 10px;
  position: relative;
`;

const IframeWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden;
  border: 1px solid #ddd;
  background-color: #fff;
  z-index: 0;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const CodeViewer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: #1e1e1e;
  padding: 12px;
  min-height: 65vh;
  max-height: 70vh;

  @media (min-width: 2560px) {
    max-height: 80vh;
  }

  @media (max-width: 768px) {
    min-height: 40vh;
    max-height: 60vh;
  }

  @media (max-width: 480px) {
    min-height: 30vh;
    max-height: 40vh;
  }
`;

const TextViewer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 12px;
  min-height: 50vh;
  max-height: 75vh;

  @media (min-width: 2560px) {
    max-height: 80vh;
  }

  @media (max-width: 768px) {
    min-height: 40vh;
    max-height: 60vh;
  }

  @media (max-width: 480px) {
    min-height: 30vh;
    max-height: 40vh;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 6px;
  background-color: #f9f9f9;
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

const BrowserToolbar = styled.div`
  display: flex;
  align-items: center;
  background-color: #f1f3f4;
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
  gap: 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 2px;
`;

const CodeMetadata = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background-color: white;
`;
const CodeMetadataHeader = styled.span`
  font-weight: bold;
  padding-right: 4px;
`;

const ToolbarButton = styled.button`
  background: none;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  & > i {
    font-size: 20px;
  }
`;

const AddressBar = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 24px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 14px;
  color: #202124;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:focus {
    outline: none;
    background-color: white;
    border-color: #1a73e8;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const NewTabButton = styled(ToolbarButton)`
  margin-left: 2px;
  color: #5f6368;
  border-radius: 24px;
  padding: 0 12px;
  width: auto;
  gap: 6px;
  background-color: white;
  height: 38px;
  display: flex;
  align-items: center;
  font-size: 14px;
  border: 1px solid #ddd;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:active {
    border-color: #1a73e8;
  }

  & > span {
    font-weight: 400;
    line-height: 36px;
  }

  & > i {
    font-size: 20px;
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s;
  z-index: 10;

  &:hover {
    color: #aaa;
  }
`;

const TextCopyButton = styled(CopyButton)`
  color: #333;

  &:hover {
    color: #666;
  }
`;

interface VisualScreenViewerProps {
  visualArtifact: Artifact[];
  codeArtifact: Artifact[];
  textArtifact: Artifact[];
  sseArtifact: Artifact[];
  chatId: string;
  activeTab: 'visual' | 'code' | 'text' | 'logs';
}

const VisualScreenViewer: React.FC<VisualScreenViewerProps> = ({
  visualArtifact,
  codeArtifact,
  textArtifact,
  sseArtifact,
  chatId,
  activeTab
}) => {
  const [visualIndex, setVisualIndex] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  useEffect(() => {
    if (visualArtifact.length > 0) {
      setVisualIndex(0);
    } else if (codeArtifact.length > 0) {
      setCodeIndex(0);
    } else if (textArtifact.length > 0) {
      setTextIndex(0);
    }
  }, [visualArtifact.length, codeArtifact.length, textArtifact.length]);

  const handleNext = () => {
    if (activeTab === 'visual') {
      setVisualIndex((prev) => prev + 1);
    } else if (activeTab === 'code') {
      setCodeIndex((prev) => prev + 1);
    } else {
      setTextIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'visual') {
      setVisualIndex((prev) => prev - 1);
    } else if (activeTab === 'code') {
      setCodeIndex((prev) => prev - 1);
    } else {
      setTextIndex((prev) => prev - 1);
    }
  };

  const currentVisual = visualArtifact[visualArtifact.length - 1 - visualIndex];
  const currentCode = codeArtifact[codeArtifact.length - 1 - codeIndex];
  const currentText = textArtifact[textArtifact.length - 1 - textIndex];

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(e.target.value);
  };

  const handleUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const handleNewTab = () => {
    window.open(currentUrl, '_blank');
  };

  useEffect(() => {
    if (activeTab === 'visual' && currentVisual?.content) {
      const content = currentVisual.content as VisualContent;
      if (content.url) {
        setCurrentUrl(content.url);
      }
    }
  }, [activeTab, currentVisual]);

  const copyCodeToClipboard = () => {
    if (currentCode?.content) {
      const content = (currentCode.content as TextContent).content || '';
      navigator.clipboard.writeText(content).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    }
  };

  const copyTextToClipboard = () => {
    if (currentText?.content) {
      const content = (currentText.content as TextContent).content || '';
      navigator.clipboard.writeText(content).then(() => {
        setTextCopied(true);
        setTimeout(() => setTextCopied(false), 2000);
      });
    }
  };

  const renderBrowserTools = (visualContent: VisualContent) => {
    if (visualContent.visual_type !== 'screen') return null;

    return (
      <BrowserToolbar>
        <NavigationButtons>
          <ToolbarButton onClick={handlePrevious} disabled={visualIndex === 0} title="Go back">
            <MaterialIcon icon="arrow_back" />
          </ToolbarButton>
          <ToolbarButton
            onClick={handleNext}
            disabled={visualIndex === visualArtifact.length - 1}
            title="Go forward"
          >
            <MaterialIcon icon="arrow_forward" />
          </ToolbarButton>
          <ToolbarButton
            title="Reload"
            onClick={() => {
              if (iframeRef.current) {
                iframeRef.current.src = currentUrl;
              }
            }}
          >
            <MaterialIcon icon="refresh" />
          </ToolbarButton>
        </NavigationButtons>
        <AddressBar
          value={currentUrl}
          onChange={handleUrlChange}
          onKeyDown={handleUrlSubmit}
          placeholder="Enter URL"
          spellCheck={false}
        />
        <NewTabButton onClick={handleNewTab} title="Open in new tab">
          <span>Open In New Tab</span>
          <MaterialIcon icon="open_in_new" />
        </NewTabButton>
      </BrowserToolbar>
    );
  };

  return (
    <ViewerContainer>
      {activeTab === 'visual' && currentVisual && (
        <>
          <IframeWrapper>
            {renderBrowserTools(currentVisual.content as VisualContent)}
            <StyledIframe
              ref={iframeRef}
              src={(currentVisual.content as VisualContent).url || ''}
              title="Visual Screen Viewer"
            />
          </IframeWrapper>
          <PaginationControls>
            <Button onClick={handlePrevious} disabled={visualIndex === 0}>
              {'<'}
            </Button>
            <PageIndicator>
              <b>{visualIndex + 1}</b> of <b>{visualArtifact.length}</b>
            </PageIndicator>
            <Button onClick={handleNext} disabled={visualIndex === visualArtifact.length - 1}>
              {'>'}
            </Button>
          </PaginationControls>
        </>
      )}

      {activeTab === 'code' && currentCode && (
        <>
          <CodeViewer>
            <CopyButton onClick={copyCodeToClipboard}>
              {codeCopied ? <MaterialIcon icon="check" /> : <MaterialIcon icon="content_copy" />}
            </CopyButton>
            {currentCode.content && (currentCode.content as TextContent).code_metadata && (
              <CodeMetadata>
                <span>
                  <CodeMetadataHeader>File:</CodeMetadataHeader>
                  {(currentCode.content as TextContent).code_metadata?.File}
                </span>
                <span>
                  <CodeMetadataHeader>Change:</CodeMetadataHeader>
                  {(currentCode.content as TextContent).code_metadata?.Change}
                </span>
                <span>
                  <CodeMetadataHeader>Action:</CodeMetadataHeader>
                  {(currentCode.content as TextContent).code_metadata?.Action}
                </span>
              </CodeMetadata>
            )}
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

      {activeTab === 'logs' && sseArtifact && (
        <>
          <LogsScreenViewer chatId={chatId} />
        </>
      )}

      {activeTab === 'text' && currentText && (
        <>
          <TextViewer>
            <TextCopyButton onClick={copyTextToClipboard}>
              {textCopied ? <MaterialIcon icon="check" /> : <MaterialIcon icon="content_copy" />}
            </TextCopyButton>
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
