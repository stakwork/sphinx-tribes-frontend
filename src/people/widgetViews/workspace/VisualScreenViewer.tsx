import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

  return (
    <ViewerContainer>
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
