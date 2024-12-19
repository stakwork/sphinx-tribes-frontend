import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { colors } from '../../config';

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
                overflowX: 'auto'
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
                borderRadius: '4px'
              }}
              {...props}
            />
          );
        }
      }}
    />
  );
}
