/* eslint-disable no-use-before-define */
import React from 'react';
import MaterialIcon from '@material/react-material-icon';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ImageState, SchematicPreviewProps } from './interfaces';

const IMAGE_LOAD_TIMEOUT = 30000;
const DEFAULT_ALT_TEXT = 'Schematic preview';

export const SchematicPreview = memo(function ({
  schematicUrl,
  schematicImg,
  onLoadSuccess,
  onLoadError,
  className,
  testId = 'schematic-preview'
}: SchematicPreviewProps) {
  const [imageState, setImageState] = useState<ImageState>('initial');

  const imageSource = useMemo(
    () => schematicImg || schematicUrl || '',
    [schematicImg, schematicUrl]
  );

  const handleImageLoad = useCallback(() => {
    setImageState('loaded');
    onLoadSuccess?.();
  }, [onLoadSuccess]);

  const handleImageError = useCallback(
    (error: Error) => {
      setImageState('error');
      onLoadError?.(error);
    },
    [onLoadError]
  );

  useEffect(() => {
    if (!imageSource) {
      setImageState('initial');
      return;
    }

    setImageState('loading');

    const imgElement = new Image();
    const timeoutId = setTimeout(() => {
      handleImageError(new Error('Image load timeout'));
    }, IMAGE_LOAD_TIMEOUT);

    imgElement.onload = () => {
      clearTimeout(timeoutId);
      handleImageLoad();
    };

    imgElement.onerror = (event: Event | string) => {
      clearTimeout(timeoutId);
      handleImageError(event instanceof ErrorEvent ? event.error : new Error('Image load failed'));
    };

    imgElement.src = imageSource;

    return () => {
      clearTimeout(timeoutId);
      imgElement.onload = null;
      imgElement.onerror = null;
    };
  }, [imageSource, handleImageLoad, handleImageError]);

  const renderContent = () => {
    if (!imageSource) {
      return <NoImageText>No image available</NoImageText>;
    }

    return (
      <>
        {imageState === 'loading' && <Skeleton />}

        {imageState === 'error' && (
          <ErrorContainer>
            <MaterialIcon icon="error_outline" style={{ fontSize: '24px' }} />
            <ErrorText>Failed to load schematic image</ErrorText>
          </ErrorContainer>
        )}

        <StyledImage
          src={imageSource}
          alt={DEFAULT_ALT_TEXT}
          loading="lazy"
          isVisible={imageState === 'loaded'}
          data-testid={`${testId}-image`}
        />
      </>
    );
  };

  return (
    <Container className={className} data-testid={testId} role="img" aria-label={DEFAULT_ALT_TEXT}>
      {renderContent()}
    </Container>
  );
});

SchematicPreview.displayName = 'SchematicPreview';

const Container = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--background-secondary);
`;

const Skeleton = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #ebedf1 0%, #f2f3f5 50%, #ebedf1 100%);
  background-size: 200% 100%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const ErrorContainer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: var(--background-error);
  color: var(--text-error);
`;

const ErrorText = styled.span`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

const NoImageText = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

const StyledImage = styled.img<{ isVisible: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(props: { isVisible: boolean }) => (props.isVisible ? 1 : 0)};
`;
