/* eslint-disable no-useless-escape */
import { languages } from 'monaco-editor';
export const monarchTokens: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.jinja2',

  keywords: [
    'and', 'as', 'block', 'endblock', 'by', 'cycle', 'debug', 'else', 'elif',
    'extends', 'filter', 'endfilter', 'firstof', 'do', 'for',
    'endfor', 'if', 'endif', 'ifchanged', 'endifchanged',
    'ifequal', 'endifequal', 'ifnotequal', 'endifnotequal',
    'set', 'raw', 'endraw', 'in', 'include', 'load', 'not', 'now', 'or',
    'parsed', 'regroup', 'reversed', 'spaceless', 'call', 'endcall', 'macro',
    'endmacro', 'endspaceless', 'ssi', 'templatetag', 'openblock',
    'closeblock', 'openvariable', 'closevariable', 'without', 'context',
    'openbrace', 'closebrace', 'opencomment', 'closecomment', 'widthratio',
    'url', 'with', 'endwith', 'get_current_language', 'trans', 'endtrans',
    'noop', 'blocktrans', 'endblocktrans', 'get_available_languages',
    'get_current_language_bidi', 'pluralize', 'autoescape', 'endautoescape'
  ],

  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '+', '-', '*', '/', '%', '**'
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // The tokenizer
  tokenizer: {
    root: [
      // comments
      [/\{#/, 'comment.start', '@comment'],

      // blocks {% %}
      [/\{%\-?/, 'delimiter.block.start', '@block'],

      // variables {{ }}
      [/\{\{\-?/, 'delimiter.variable.start', '@variable'],

      // normal HTML content
      { include: 'html' },
    ],

    html: [
      [/[^<{]+/, ''],
      [/[<{]/, ''],
    ],

    comment: [
      [/#\}/, 'comment.end', '@pop'],
      [/./, 'comment.content']
    ],

    block: [
      [/\-?%\}/, 'delimiter.block.end', '@pop'],
      [/\s+/, 'white'],
      [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
      [/\d+(\.\d+)?/, 'number'],
      [/".*?"/, 'string'],
      [/'.*?'/, 'string'],
      [/\w+/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'variable'
        }
      }],
    ],
  
    variable: [
      [/\-?\}\}/, 'delimiter.variable.end', '@pop'],
      [/\s+/, 'white'],
      [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
      [/\d+(\.\d+)?/, 'number'],
      [/".*?"/, 'string'],
      [/'.*?'/, 'string'],
      [/\w+/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'variable'
        }
      }],
    ],
  },
}

export const languageConfiguration = {
  brackets: [
    ['{%', '%}'],
    ['{{', '}}'],
    ['{#', '#}'],
  ],
  autoClosingPairs: [
    { open: '{%', close: '%}' },
    { open: '{{', close: '}}' },
    { open: '{#', close: '#}' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{%', close: '%}' },
    { open: '{{', close: '}}' },
    { open: '{#', close: '#}' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  comments: {
    blockComment: ['{#', '#}'],
  },
} satisfies languages.LanguageConfiguration;