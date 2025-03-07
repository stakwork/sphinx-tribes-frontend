import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Artifact, VisualContent } from '../../../store/interface.ts';

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

const IframeWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
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
  artifacts: Artifact[];
}

const VisualScreenViewer: React.FC<VisualScreenViewerProps> = ({ artifacts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (artifacts.length) {
      setCurrentIndex(artifacts.length - 1);
    }
  }, []);

  if (!artifacts?.length) {
    return <ViewerContainer>No visual screens available.</ViewerContainer>;
  }

  return (
    <ViewerContainer>
      <IframeWrapper>
        <StyledIframe
          src={
            artifacts[currentIndex] && artifacts[currentIndex].content
              ? (artifacts[currentIndex].content as VisualContent).url
              : ''
          }
          title="Visual Screen Viewer"
        />
      </IframeWrapper>
      <PaginationControls>
        <Button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          disabled={currentIndex === artifacts.length - 1}
        >
          {'<'}
        </Button>
        <PageIndicator>
          <b>{artifacts.length - currentIndex}</b> of <b>{artifacts.length}</b>
        </PageIndicator>
        <Button onClick={() => setCurrentIndex((prev) => prev - 1)} disabled={currentIndex === 0}>
          {'>'}
        </Button>
      </PaginationControls>
    </ViewerContainer>
  );
};

export default VisualScreenViewer;
