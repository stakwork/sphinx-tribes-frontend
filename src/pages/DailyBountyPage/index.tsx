/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { EuiLoadingSpinner } from '@elastic/eui';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { useIsMobile, useBrowserTabTitle } from '../../hooks';
import { colors } from '../../config/colors';

interface ColumnProps {
  isSecondColumn?: boolean;
}

const DailyBountyPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  useBrowserTabTitle('Daily Bounty Rules');

  const color = colors['light'];

  const Body = styled.div<{ isMobile: boolean }>`
    flex: 1;
    height: ${(p: { isMobile: boolean }) =>
      p.isMobile ? 'calc(100% - 105px)' : 'calc(100vh - 60px)'};
    background: ${(p: { isMobile: boolean }) => (p.isMobile ? undefined : color.grayish.G950)};
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  `;

  const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 30px auto;
    width: 100%;
    padding: 40px 30px;
    background: white;
  `;

  const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: #000000;
      transform: translateX(-50%);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;

      &:after {
        display: none;
      }
    }
  `;

  const Column = styled.div<ColumnProps>`
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 0 20px;
    margin-top: ${(props: ColumnProps) => (props.isSecondColumn ? 'calc(-30px)' : '0')};

    h1 {
      font-size: 24px;
      color: ${color.text1};
      margin-bottom: 24px;
      font-weight: 500;
    }

    h2 {
      font-size: 20px;
      color: ${color.text1};
      margin: 32px 0 16px;
      font-weight: 500;
    }

    h3 {
      font-size: 18px;
      color: ${color.text1};
      margin: 24px 0 12px;
      font-weight: 500;
    }

    p {
      margin-bottom: 16px;
      line-height: 1.6;
      color: ${color.text2};
      font-size: 15px;
    }

    ul,
    ol {
      padding-left: 24px;
      margin-bottom: 16px;
      color: ${color.text2};
      font-size: 15px;

      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }

    a {
      color: ${color.blue2};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  `;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(
          'https://stakwork-uploads.s3.amazonaws.com/admin_customers/8ba670cc-142b-4f75-9e42-aeef44c7025c/TheDailyBounty-Rules.md'
        );
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <Body isMobile={isMobile} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  const sections = content.split('--------------------------------------------------');
  const englishContent = sections[0] || '';
  const spanishContent = sections[1]?.replace(/^[\s-]+/, '') || '';

  return (
    <Body isMobile={isMobile}>
      <ContentWrapper>
        <ContentGrid>
          <Column isSecondColumn={false}>
            <ReactMarkdown>{englishContent}</ReactMarkdown>
          </Column>
          <Column isSecondColumn={true}>
            <ReactMarkdown>{spanishContent}</ReactMarkdown>
          </Column>
        </ContentGrid>
      </ContentWrapper>
    </Body>
  );
};

export default DailyBountyPage;
