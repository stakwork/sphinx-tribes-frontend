import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styled from 'styled-components';
import { colors } from '../../config';

const MarkdownContainer = styled.div`
  /* Base text styling */
  font-size: 1rem;
  line-height: 1.4;
  color: #3c3f41;

  /* List styling */
  ul,
  ol {
    margin: 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0;
    padding: 0;
    line-height: 1.2;
  }

  /* Remove extra space between list items */
  li + li {
    margin-top: 0;
  }

  /* Fix nested list spacing */
  li > ul,
  li > ol {
    margin: 0;
  }

  /* Paragraph spacing */
  p {
    margin: 0;
  }

  /* Heading spacing */
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }

  /* Table styling */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.3rem 0;
  }

  th,
  td {
    border: 1px solid #dde1e5;
    padding: 0.4rem;
  }

  /* Blockquote styling */
  blockquote {
    margin: 0.3rem 0;
    padding-left: 0.8rem;
    border-left: 3px solid #dde1e5;
    color: #666;
  }
`;

interface CustomStyles {
  codeBlockBackground?: string;
  codeBlockFont?: string;
  textColor?: string;
  borderColor?: string;
}

export function renderMarkdown(markdown: any, customStyles?: CustomStyles) {
  const color = colors['light'];
  const {
    codeBlockBackground = '#050038',
    codeBlockFont = 'monospace',
    textColor = '#ffffff',
    borderColor = '#444'
  } = customStyles || {};

  return (
    <MarkdownContainer>
      <ReactMarkdown
        children={markdown}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ className, children, ...props }: any) {
            const useStyling = !!customStyles;

            return useStyling ? (
              <pre
                style={{
                  backgroundColor: codeBlockBackground,
                  color: textColor,
                  fontFamily: codeBlockFont,
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${borderColor}`,
                  display: 'block',
                  overflowX: 'auto',
                  margin: '0.5rem 0'
                }}
                {...props}
              >
                <code className={className}>{children}</code>
              </pre>
            ) : (
              <pre {...props}>
                <code className={className}>{children}</code>
              </pre>
            );
          },
          img({ className, ...props }: any) {
            // Images styling is always applied
            return (
              <img
                alt={'Markdown'}
                className={className}
                style={{
                  width: '100%',
                  maxHeight: '100%',
                  border: `1px solid ${color.black80}`,
                  borderRadius: '4px',
                  margin: '0.5rem 0'
                }}
                {...props}
              />
            );
          }
        }}
      />
    </MarkdownContainer>
  );
}
