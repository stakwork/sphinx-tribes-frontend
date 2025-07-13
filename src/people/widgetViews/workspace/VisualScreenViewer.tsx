import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import MaterialIcon from '@material/react-material-icon';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Artifact, VisualContent, TextContent, SSEMessage } from '../../../store/interface.ts';
import { renderMarkdown } from '../../utils/RenderMarkdown.tsx';
import LogsScreenViewer from './LogsScreenViewer.tsx';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 93vh;
  max-height: 90vh;
  background-color: #f9f9f9;
  box-sizing: border-box;
  margin: 0 0 0 10px;
  position: relative;

  @media (max-width: 2560px) {
    width: 100%;
    height: 90vh;
    max-height: 90vh;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    width: 90%;
    height: 92vh;
    max-height: 92vh;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    width: 100%;
    height: 70vh;
    max-height: 70vh;
    margin: 0;
  }
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
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: #1e1e1e;
  padding: 12px;
  height: 100%;
`;

const TextViewer = styled.div`
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 12px;
  height: 100%;
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
  sseLogs: SSEMessage[];
  activeTab: 'visual' | 'code' | 'text' | 'logs';
}

const VisualScreenViewer: React.FC<VisualScreenViewerProps> = ({
  visualArtifact,
  codeArtifact,
  textArtifact,
  sseArtifact,
  sseLogs,
  activeTab
}) => {
  const [visualIndex, setVisualIndex] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [, setIsStaktrakInjected] = useState(false);

  useEffect(() => {
    if (visualArtifact.length > 0) {
      setVisualIndex(0);
    } else if (codeArtifact.length > 0) {
      setCodeIndex(0);
    } else if (textArtifact.length > 0) {
      setTextIndex(0);
    }
  }, [visualArtifact.length, codeArtifact.length, textArtifact.length]);

  const injectStaktrakScript = () => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;

      const injectScriptIntoIframe = (iframeDocument: Document) => {
        const existingScript = iframeDocument.querySelector('script[src="/static/staktrak.js"]');
        if (existingScript) {
          console.log('Staktrak script already injected');
          return;
        }

        console.log('Injecting staktrak script into iframe');

        const script = iframeDocument.createElement('script');
        script.src = '/static/staktrak.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('Staktrak script loaded successfully');

          window.dispatchEvent(new CustomEvent('staktrak-ready'));
          console.log('Staktrak ready event dispatched');
        };

        script.onerror = () => {
          console.error('Error loading Staktrak script');
        };

        iframeDocument.head.appendChild(script);

        const style = iframeDocument.createElement('style');
        style.textContent = `
          body.staktrak-selection-active {
            cursor: crosshair !important;
            position: relative;
          }
          body.staktrak-selection-active::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(66, 133, 244, 0.1);
            pointer-events: none;
            z-index: 9999;
          }
        `;
        iframeDocument.head.appendChild(style);

        setIsStaktrakInjected(true);
      };

      if (
        iframe.contentWindow &&
        iframe.contentDocument &&
        iframe.contentDocument.readyState === 'complete'
      ) {
        console.log('Iframe already loaded, injecting script immediately');
        injectScriptIntoIframe(iframe.contentDocument);
        return;
      }

      console.log('Waiting for iframe to load before injecting script');
      iframe.onload = () => {
        if (!iframe.contentWindow || !iframe.contentDocument) {
          console.error('Cannot access iframe contentDocument');
          return;
        }

        console.log('Iframe loaded, injecting script');
        injectScriptIntoIframe(iframe.contentDocument);
      };
    } catch (error) {
      console.error('Failed to inject staktrak script:', error);
    }
  };

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
      setIsStaktrakInjected(false);
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
        setIsStaktrakInjected(false);
      }
    }
  }, [activeTab, currentVisual]);

  useEffect(() => {
    if (activeTab === 'visual' && currentUrl) {
      console.log('URL changed or activeTab is visual, injecting staktrak script for:', currentUrl);
      setIsStaktrakInjected(false);
      const timer = setTimeout(() => {
        injectStaktrakScript();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeTab, currentUrl]);

  const getCodeContent = (): { code: string; language: string } => {
    if (currentCode?.content && 'content' in currentCode.content) {
      const htmlContent = (currentCode.content as TextContent).content || '';

      const language = (currentCode.content as TextContent).language?.toLowerCase() || 'javascript';

      return { code: htmlContent, language };
    }
    return { code: '', language: 'javascript' };
  };

  const copyCodeToClipboard = () => {
    const { code } = getCodeContent();
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
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
      {activeTab === 'logs' && sseArtifact && sseLogs.length > 0 && (
        <>
          <LogsScreenViewer sseLogs={sseLogs} />
        </>
      )}
      {activeTab === 'visual' && currentVisual && (
        <>
          <IframeWrapper>
            {renderBrowserTools(currentVisual.content as VisualContent)}
            <StyledIframe
              ref={iframeRef}
              src={(currentVisual.content as VisualContent).url || ''}
              title="Visual Screen Viewer"
              onLoad={injectStaktrakScript}
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
            <CopyButton
              onClick={copyCodeToClipboard}
              style={{
                position: 'relative',
                float: 'right',
                top: '10px',
                right: '10px'
              }}
            >
              {codeCopied ? <MaterialIcon icon="check" /> : <MaterialIcon icon="content_copy" />}
            </CopyButton>

            <SyntaxHighlighter
              language={getCodeContent().language}
              style={coldarkDark}
              customStyle={{ background: '#1e1e1e', padding: '10px' }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {getCodeContent().code}
            </SyntaxHighlighter>
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
