import React from 'react';
import MaterialIcon from '@material/react-material-icon';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { EuiLoadingSpinner } from '@elastic/eui';
import { ImageState, SchematicPreviewProps } from './interfaces';
import {
  ErrorContainer,
  ErrorText,
  ImgText,
  SchematicImgContainer,
  Skeleton,
  StyledImage
} from './widgetViews/workspace/style';

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
      return <ImgText>Image</ImgText>;
    }

    return (
      <>
        {imageState === 'loading' && (
          <Skeleton>
            <EuiLoadingSpinner size="xl" />
          </Skeleton>
        )}

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
    <SchematicImgContainer
      className={className}
      data-testid={testId}
      role="img"
      aria-label={DEFAULT_ALT_TEXT}
    >
      {renderContent()}
    </SchematicImgContainer>
  );
});

SchematicPreview.displayName = 'SchematicPreview';
