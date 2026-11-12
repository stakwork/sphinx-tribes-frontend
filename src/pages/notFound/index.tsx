import { usePostHog } from 'posthog-js/react';
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  NotFoundPageContainer,
  ContentWrapper,
  TextContent,
  Message,
  ImageContainer,
  ErrorCode,
  Button,
  Title,
  Image
} from './styles';

export function NotFoundPage() {
  const history = useHistory();
  const location = useLocation();
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture('not_found_page_view', {
      path: location.pathname,
      search: location.search
    });
  }, [location.pathname, location.search, posthog]);

  return (
    <NotFoundPageContainer>
      <ContentWrapper>
        <TextContent>
          <div>
            <ErrorCode>404</ErrorCode>
            <Title>Looks like you&apos;ve found the doorway to the great nothing!</Title>
            <Message>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </Message>
            <Button onClick={() => history.push('/')}>Take me back</Button>
          </div>
        </TextContent>
        <ImageContainer>
          <Image src="/error.png" alt="/error.png" />
        </ImageContainer>
      </ContentWrapper>
    </NotFoundPageContainer>
  );
}
