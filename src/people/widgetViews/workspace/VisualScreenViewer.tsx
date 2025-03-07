import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Artifact, VisualContent, TextContent } from '../../../store/interface.ts';
import { renderMarkdown } from '../../utils/RenderMarkdown.tsx';

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  width: 60%;
  height: calc(100% - 100px);
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
  padding: 16px;
  box-sizing: border-box;
`;

const TabContainer = styled.div`
  display: flex;
  width: 30%;
`;

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border: 0.2px solid #615c5c;
  border-bottom: ${({ active }) => (active ? 'none' : '2px solid #ddd')};
  background: ${({ active }) => (active ? '#007bff' : '#f6f4f4')};
  color: ${({ active }) => (active ? 'white' : 'black')};
  font-weight: 700;
  font-family: Barlow;
  font-size: 16px;
  cursor: pointer;
  transition:
    background 0.3s,
    color 0.3s;
  position: relative;
  top: 2px;

  &:hover {
    background: #f6f4f4;
    color: #1e1f25;
  }
`;

const IframeWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden;
  border: 1px solid #ccc;
  border-radius: 0 8px 8px 8px;
  background-color: #fff;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0 8px 8px 8px;
`;

const CodeViewer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 0 8px 8px 8px;
  background-color: #1e1e1e;
  padding: 12px;
  max-height: 500px;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
  margin-top: 12px;
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

interface VisualScreenViewerProps {
  visualArtifact: Artifact[];
  codeArtifact: Artifact[];
}

const VisualScreenViewer: React.FC<VisualScreenViewerProps> = ({
  visualArtifact,
  codeArtifact
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('code');
  const [visualIndex, setVisualIndex] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);

  useEffect(() => {
    if (visualArtifact.length > 0) {
      setVisualIndex(0);
    } else if (codeArtifact.length > 0) {
      setActiveTab('code');
      setCodeIndex(0);
    }
  }, [visualArtifact.length, codeArtifact.length]);

  const handleNext = () => {
    if (activeTab === 'visual') {
      setVisualIndex((prev) => prev + 1);
    } else {
      setCodeIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'visual') {
      setVisualIndex((prev) => prev - 1);
    } else {
      setCodeIndex((prev) => prev - 1);
    }
  };

  const currentVisual = visualArtifact[visualArtifact.length - 1 - visualIndex];
  const currentCode = codeArtifact[codeArtifact.length - 1 - codeIndex];

  return (
    <ViewerContainer>
      <TabContainer>
        {codeArtifact.length > 0 && (
          <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')}>
            Code
          </TabButton>
        )}
        {visualArtifact.length > 0 && (
          <TabButton active={activeTab === 'visual'} onClick={() => setActiveTab('visual')}>
            Screen
          </TabButton>
        )}
      </TabContainer>

      {activeTab === 'visual' && currentVisual && (
        <>
          <IframeWrapper>
            <StyledIframe
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
    </ViewerContainer>
  );
};

export default VisualScreenViewer;
