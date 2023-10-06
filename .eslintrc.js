 module.exports = {
  extends: ['eslint:recommended', 'standard-with-typescript', 'prettier'],
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  "globals": {
    "React": "readonly"
  },
  ignorePatterns: ["client/dist/*", "vite.config.ts", "plugin.ts", "client/coverage/*", "server/dist/*"],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      arrowFunctions: true,
      blockBindings: true,
      classes: true,
      defaultParams: true,
      destructuring: true,
      forOf: true,
      generators: true,
      modules: true,
      spread: true,
      templateStrings: true,
      jsx: true
    },
    project: ['./tsconfig.json']
  },
  rules: {
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'semi': [1, 'always'],
    'no-duplicate-imports': 1,
    'arrow-body-style': ['warn', 'as-needed'],
    'no-console': 1,
    'no-debugger': 1,
    'arrow-spacing': [
      1,
      {
        before: true,
        after: true
      }
    ],
    'block-spacing': [1, 'always'],
    'comma-spacing': [
      1,
      {
        before: false,
        after: true
      }
    ],
    'jsx-quotes': [1, 'prefer-double'],
    'no-multiple-empty-lines': 1,
    'template-curly-spacing': [1, 'never'],
    'no-dupe-args': 1,
    'no-dupe-keys': 1,
    'no-duplicate-case': 1,
    'no-useless-constructor': 1,
    'no-unreachable': 1,
    'no-undef': 1,
    'no-extra-semi': 1,
    'keyword-spacing': [1, {}],
    'space-before-blocks': [1, 'always'],
    'wrap-iife': [1, 'any'],
    'one-var': 0,
    'vars-on-top': 0,
    'no-empty': [
      1,
      {
        allowEmptyCatch: true
      }
    ],
    'array-bracket-spacing': [1, 'never', {}],
    'space-in-parens': [1, 'never'],
    'no-underscore-dangle': 0,
    'comma-style': [1, 'last'],
    'space-unary-ops': [
      1,
      {
        words: false,
        nonwords: false
      }
    ],
    'space-infix-ops': 1,
    'no-with': 1,
    'no-mixed-spaces-and-tabs': 1,
    'no-trailing-spaces': 1,
    'brace-style': [
      1,
      '1tbs',
      {
        allowSingleLine: true
      }
    ],
    'eol-last': 1,
    'dot-notation': 1,
    'no-constant-condition': [
      1,
      {
        checkLoops: false
      }
    ],
    'no-multi-str': 1,
    'key-spacing': [
      1,
      {
        afterColon: true
      }
    ],
    'no-var': 1,
    'no-unused-vars': 1,
    'no-alert': 0,
    'no-lone-blocks': 0,

    // React scope no longer necessary with new JSX transform
    'react/react-in-jsx-scope': 0,
    'react/display-name': [
      1,
      {
        ignoreTranspilerName: false
      }
    ],
    'react/forbid-prop-types': [
      1,
      {
        forbid: ['any']
      }
    ],
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-indent-props': 0,
    'react/jsx-key': 1,
    'react/jsx-max-props-per-line': 0,
    'react/jsx-no-duplicate-props': 1,
    'react/jsx-no-literals': 0,
    'react/jsx-no-undef': 1,
    'react/jsx-pascal-case': 1,
    'react/jsx-sort-prop-types': 0,
    'react/jsx-sort-props': 0,
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/no-danger': 1,
    'react/no-did-mount-set-state': 1,
    'react/no-did-update-set-state': 1,
    'react/no-direct-mutation-state': 1,
    'react/no-multi-comp': [
      1,
      {
        ignoreStateless: true
      }
    ],
    'react/no-set-state': 0,
    'react/no-unknown-property': 1,
    'react/prefer-es6-class': 1,
    'react/prop-types': 1,
    'react/self-closing-comp': 1,
    'react/sort-comp': 1,
    'react/no-deprecated': 1,
    'react/no-unescaped-entities': 1,
    'react/no-unused-prop-types': 1,
    'react/prefer-stateless-function': 1,
    'react/jsx-boolean-value': 1,
    'react/jsx-wrap-multilines': 1,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
