import { Plugin } from 'prettier';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserPostcss from 'prettier/parser-postcss';
import parserMarkdown from 'prettier/parser-markdown';
import parserRust from 'prettier-plugin-rust';
import parserGoTemplate from 'prettier-plugin-go-template';

interface ParserConfig {
  parser: string;
  plugins: Plugin[] | object[];
}

const parserMap: Record<string, ParserConfig> = {
  javaScript: { parser: 'babel', plugins: [parserBabel] },
  typeScript: { parser: 'babel', plugins: [parserBabel] },
  react: { parser: 'babel', plugins: [parserBabel] },
  html: { parser: 'html', plugins: [parserHtml] },
  css: { parser: 'css', plugins: [parserPostcss] },
  markdown: { parser: 'markdown', plugins: [parserMarkdown] },
  json: { parser: 'json', plugins: [parserBabel] },
  rust: { parser: 'rust', plugins: [parserRust] },
  go: { parser: 'go', plugins: [parserGoTemplate] },
  golang: { parser: 'go', plugins: [parserGoTemplate] }
};

export const formatCodeWithPrettier = (code: string, language = 'javascript') => {
  try {
    const cleanedCode = code.trim();
    if (!cleanedCode) return code;

    const config = parserMap[language] || parserMap.javaScript;

    return prettier.format(cleanedCode, {
      parser: config.parser,
      plugins: config.plugins,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 80,
      trailingComma: 'es5'
    });
  } catch (error) {
    console.error(`Error formatting ${language} code with Prettier:`, error);
    return code;
  }
};
