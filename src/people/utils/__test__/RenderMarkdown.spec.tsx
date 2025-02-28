import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { colors } from 'config';
import { renderMarkdown } from '../RenderMarkdown';


describe('Testing various utilities of the renderMakrdown function',()=>{
    test("renders markdown content", ()=>{

        const markdownHeader = "# Header";
        render(renderMarkdown(markdownHeader));
        expect(screen.getByText('Header')).toBeInTheDocument();

        const markdownParagraph = "This is a paragraph";
        render(renderMarkdown(markdownParagraph));
        expect(screen.getByText('This is a paragraph')).toBeInTheDocument();

        const markdownUnorderedList = "- Item 1\n- Item 2";
        render(renderMarkdown(markdownUnorderedList));
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();


        const markdownOrderedList = "1. Item 1\n2. Item 2";
        render(renderMarkdown(markdownOrderedList));
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();



        const markdownTable = "| Header 1 | Header 2 |\n| --- | --- |\n| Row 1 | Row 2 |";
        render(renderMarkdown(markdownTable));
        expect(screen.getByText('Header 1')).toBeInTheDocument();
        expect(screen.getByText('Header 2')).toBeInTheDocument();
        expect(screen.getByText('Row 1')).toBeInTheDocument();
        expect(screen.getByText('Row 2')).toBeInTheDocument();

        const markdownBlockquote = "> This is a blockquote";
        render(renderMarkdown(markdownBlockquote));
        expect(screen.getByText('This is a blockquote')).toBeInTheDocument();


        const markdownSubHeader = "## Sub Header";
        render(renderMarkdown(markdownSubHeader));
        expect(screen.getByText('Sub Header')).toBeInTheDocument();

        const markdownSubSubHeader = "### Sub Sub Header";
        render(renderMarkdown(markdownSubSubHeader));
        expect(screen.getByText('Sub Sub Header')).toBeInTheDocument();

    });

    test("renders code blocks with default styles", ()=>{
        const markdownCodeBlock = "```javascript\nconsole.log('Hello World');\n```";
        render(renderMarkdown(markdownCodeBlock));
        const codeBlock = screen.getByText("console.log('Hello World');");
        expect(codeBlock).toBeInTheDocument();
        expect(codeBlock.parentElement).toHaveStyle({
            backgroundColor: '#050038',
            color: '#ffffff',
            fontFamily: 'monospace',
            border: '1px solid #444',
        });

    });

    test("renders code blocks with custom styles", ()=>{
    
        const markdownCodeBlock = "```javascript\nconsole.log('Hello World');\n```";
        render(renderMarkdown(markdownCodeBlock, {
            codeBlockBackground: 'red',
            codeBlockFont: 'Arial',
            bubbleTextColor: 'blue',
            textColor: 'green',
            borderColor: 'yellow'
        }));
        const codeBlock = screen.getByText("console.log('Hello World');");
        expect(codeBlock).toBeInTheDocument();
        expect(codeBlock.parentElement).toHaveStyle({
            backgroundColor: 'red',
            color: 'green',
            fontFamily: 'Arial',
            border: '1px solid yellow',
        });
    
    });

    test("renders images with default styles", ()=>{
        const color = colors['light'];
        const markdownImage = "![Alt Text](/static/avatarPlaceholders/placeholder_1.jpg)";
        render(renderMarkdown(markdownImage));
        const image = screen.getByAltText('Alt Text');
        expect(image).toBeInTheDocument();
        expect(image.parentElement).toHaveStyle({
            width: '100%',
            maxHeight: '100%',
            border: `1px solid ${color.black80}`,
            borderRadius: '4px',
            margin: '0.5rem 0'
        });
    });

    test("renders images with custom styles and renders special characters", ()=>{
        const markdownImage = "<img src='/static/avatarPlaceholders/placeholder_1.jpg' alt='Alt Text' class='classname' />";
        const image = screen.getByAltText('Alt Text');
        expect(image).toBeInTheDocument();
        expect(image.parentElement).toHaveClass('classname');
    });

    test("renders links and ensure they are clickable", ()=>{
        const markdownLink = "[Click Me](https://www.google.com)";
        render(renderMarkdown(markdownLink));
        const link = screen.getByText('Click Me');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://www.google.com');

    })

    test("renders HTML within markdown", ()=>{
        const markdownHTML = "<div>HTML</div>";
        render(renderMarkdown(markdownHTML));
        const html = screen.getByText('HTML');
        expect(html).toBeInTheDocument()
    })
})