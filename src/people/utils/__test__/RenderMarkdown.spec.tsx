import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderMarkdown } from '../RenderMarkdown';

describe('RenderMarkdown Component', () => {
  describe('code component', () => {
    const renderCodeBlock = (markdown: string) => render(renderMarkdown(markdown));

    it('Basic Functionality with Valid String Children', () => {
      const markdown = '```\nconst test = "hello";\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        const codeElement = preElement.querySelector('code');

        expect(preElement).toBeInTheDocument();
        expect(codeElement).toHaveTextContent('const test = "hello";');
        expect(preElement).toHaveStyle({
          backgroundColor: '#050038',
          color: '#ffffff'
        });
      });
    });

    it('No ClassName Provided', () => {
      const markdown = '`inline code`';
      waitFor(() => {
        renderCodeBlock(markdown);

        const codeElement = screen.getByRole('presentation');
        expect(codeElement.querySelector('code')).not.toHaveAttribute('class');
      });
    });

    it('No Children Provided (null)', () => {
      const markdown = '```\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        const codeElement = preElement.querySelector('code');

        expect(preElement).toBeInTheDocument();
        expect(codeElement).toHaveTextContent('');
      });
    });

    it('Passing Additional Props to <pre>', () => {
      const markdown = '```\ntest code\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        expect(preElement).toHaveStyle({
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #444',
          margin: '1rem 0',
          overflowX: 'auto'
        });
      });
    });

    it('Prop Spreading with Overriding Style', () => {
      const customStyles = {
        codeBlockBackground: '#000000',
        textColor: '#ff0000',
        borderColor: '#999999'
      };

      const markdown = '```\ntest code\n```';
      waitFor(() => {
        render(renderMarkdown(markdown, customStyles));

        const preElement = screen.getByRole('presentation');
        expect(preElement).toHaveStyle({
          backgroundColor: '#000000',
          color: '#ff0000',
          border: '1px solid #999999'
        });
      });
    });

    it('Children as a React Element (JSX)', () => {
      const markdown = '```\n<div>Test</div>\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        expect(preElement).toHaveTextContent('<div>Test</div>');
      });
    });

    it('Children as an Array of Elements', () => {
      const markdown = '```\nline1\nline2\nline3\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        expect(preElement).toHaveTextContent('line1\nline2\nline3');
      });
    });

    it('Numeric Children', () => {
      const markdown = '```\n123456\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        expect(preElement).toHaveTextContent('123456');
      });
    });

    it('Invalid Data Types for className (Non-string Type)', () => {
      const markdown = '```typescript\nconst test = 123;\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        const codeElement = preElement.querySelector('code');

        expect(codeElement).toHaveAttribute('class', 'typescript');
      });
    });

    it('Performance / Scale  Very Long String as Children', () => {
      const longString = 'x'.repeat(10000);
      const markdown = `\`\`\`\n${longString}\n\`\`\``;

      const startTime = performance.now();
      waitFor(() => {
        renderCodeBlock(markdown);
        const endTime = performance.now();

        const preElement = screen.getByRole('presentation');
        expect(preElement).toHaveTextContent(longString);
        expect(endTime - startTime).toBeLessThan(1000);
      });
    });

    it('Empty String as Children', () => {
      const markdown = '```\n\n```';
      waitFor(() => {
        renderCodeBlock(markdown);

        const preElement = screen.getByRole('presentation');
        const codeElement = preElement.querySelector('code');

        expect(preElement).toBeInTheDocument();
        expect(codeElement).toHaveTextContent('');
      });
    });

    it('Markdown Container Styles', () => {
      const markdown = '```\ntest\n```';
      waitFor(() => {
        const { container } = renderCodeBlock(markdown);

        const markdownContainer = container.firstChild;
        expect(markdownContainer).toHaveStyle({
          fontSize: '1rem',
          lineHeight: '1.6'
        });
      });
    });
  });

  describe('inline code component', () => {
    const renderInlineCode = (markdown: string) => render(renderMarkdown(markdown));

    it('renders inline code without line breaks', () => {
      const markdown = 'This is a test with `inline code` in the middle.';
      waitFor(() => {
        renderInlineCode(markdown);
        const codeElement = screen.getByText('inline code');

        expect(codeElement.tagName).toBe('CODE');
        expect(codeElement).toHaveStyle({
          display: 'inline',
          backgroundColor: 'rgba(175, 184, 193, 0.2)',
          color: '#24292f'
        });
      });
    });

    it('handles multiple inline codes in one line', () => {
      const markdown = 'Test `first` and `second` inline codes';
      waitFor(() => {
        renderInlineCode(markdown);

        const codeElements = screen.getAllByRole('code');
        expect(codeElements).toHaveLength(2);
        expect(codeElements[0]).toHaveTextContent('first');
        expect(codeElements[1]).toHaveTextContent('second');
      });
    });

    it('maintains proper spacing around inline code', () => {
      const markdown = '`start` middle `end`';
      waitFor(() => {
        const { container } = renderInlineCode(markdown);
        const text = container.textContent;

        expect(text).toBe('start middle end');
        expect(screen.getAllByRole('code')).toHaveLength(2);
      });
    });

    it('applies correct styling to inline code', () => {
      const markdown = 'Test `styled code` here';
      waitFor(() => {
        renderInlineCode(markdown);
        const codeElement = screen.getByText('styled code');

        expect(codeElement).toHaveStyle({
          fontFamily:
            'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
          fontSize: '85%',
          padding: '0.2em 0.4em',
          borderRadius: '6px'
        });
      });
    });

    it('handles inline code at start and end of lines', () => {
      const markdown = '`start code` middle `end code`';
      waitFor(() => {
        renderInlineCode(markdown);

        const codeElements = screen.getAllByRole('code');
        expect(codeElements[0]).toHaveTextContent('start code');
        expect(codeElements[1]).toHaveTextContent('end code');
        expect(codeElements[0]).toHaveStyle({ display: 'inline' });
        expect(codeElements[1]).toHaveStyle({ display: 'inline' });
      });
    });
  });
});
