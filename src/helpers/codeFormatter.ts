import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserPostcss from 'prettier/parser-postcss';
import parserMarkdown from 'prettier/parser-markdown';

export const formatCodeWithPrettier = (code: string, language = 'javascript') => {
  try {
    const cleanedCode = code.trim();
    if (!cleanedCode) return code;

    const parserMap = {
      js: { parser: 'babel', plugins: [parserBabel] },
      ts: { parser: 'babel', plugins: [parserBabel] },
      jsx: { parser: 'babel', plugins: [parserBabel] },
      tsx: { parser: 'babel', plugins: [parserBabel] },
      html: { parser: 'html', plugins: [parserHtml] },
      css: { parser: 'css', plugins: [parserPostcss] },
      md: { parser: 'markdown', plugins: [parserMarkdown] },
      json: { parser: 'json', plugins: [parserBabel] },
      go: { parser: 'babel', plugins: [parserBabel] }
    };

    const normalizedLang = language.toLowerCase().trim();

    const config = parserMap[normalizedLang] || { parser: 'babel', plugins: [parserBabel] };

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
