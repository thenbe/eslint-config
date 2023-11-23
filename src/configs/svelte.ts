import { interopDefault } from '../utils'
import type { FlatConfigItem, OptionsFiles, OptionsHasTypeScript, OptionsOverrides, OptionsStylistic } from '../types'
import { GLOB_SVELTE } from '../globs'

export async function svelte(
  options: OptionsHasTypeScript & OptionsOverrides & OptionsStylistic & OptionsFiles = {},
): Promise<FlatConfigItem[]> {
  const {
    files = [GLOB_SVELTE],
    overrides = {},
    stylistic = true,
  } = options

  const {
    indent = 2,
    quotes = 'single',
  } = typeof stylistic === 'boolean' ? {} : stylistic

  const [
    pluginSvelte,
    parserSvelte,
  ] = await Promise.all([
    interopDefault(import('eslint-plugin-svelte')),
    interopDefault(import('svelte-eslint-parser')),
  ] as const)

  return [
    {
      name: 'antfu:svelte:setup',
      plugins: {
        svelte: pluginSvelte,
      },
    },
    {
      files,
      languageOptions: {
        parser: parserSvelte,
        parserOptions: {
          // project: './tsconfig.json',
          extraFileExtensions: ['.svelte'],
          // TODO: project?
          parser: options.typescript
            ? await interopDefault(import('@typescript-eslint/parser')) as any
            : null,
          // sourceType: 'module',
          // ecmaVersion: 2020,
        },
        // TODO: globals?
      },
      name: 'antfu:svelte:rules',
      // TODO: processor?
      // processor: pluginVue.processors['.vue'],
      rules: {
        'import/no-mutable-exports': 'off',
        'no-undef': 'off', // incompatible with generic types (attribute-form)
        'no-unused-vars': ['error', {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^\\$\\$Props$',
        }],

        ...pluginSvelte.configs.recommended.rules as any,
        'svelte/no-dom-manipulating': 'warn',
        'svelte/no-dupe-use-directives': 'error',
        'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
        'svelte/no-inner-declarations': 'error',
        'svelte/no-reactive-functions': 'error',
        'svelte/no-reactive-literals': 'error',
        'svelte/no-store-async': 'error',
        // 'svelte/valid-prop-names-in-kit-pages': 'error',
        'svelte/no-target-blank': 'error',
        'svelte/no-useless-mustaches': 'error',
        // 'svelte/require-optimized-style-attribute': 'error',
        'svelte/require-store-callbacks-use-set-param': 'error',
        'svelte/require-stores-init': 'error',
        'svelte/valid-each-key': 'error',
        'ts/no-throw-literal': 'off', // incompatible with sveltekit's error handling

        'unused-imports/no-unused-vars': [
          'error',
          { args: 'after-used', argsIgnorePattern: '^_', vars: 'all', varsIgnorePattern: '^(_|\\$\\$Props$)' },
        ],

        ...stylistic
          ? {
              'style/no-trailing-spaces': 'off', // superseded by svelte/no-trailing-spaces
              'svelte/derived-has-same-inputs-outputs': 'error',
              'svelte/first-attribute-linebreak': 'error',
              'svelte/html-closing-bracket-spacing': 'error',
              'svelte/html-quotes': ['error', { prefer: quotes }],
              // 'svelte/html-self-closing': 'error',
              'svelte/indent': [
                'error',
                {
                  alignAttributesVertically: true,
                  ignoredNodes: [],
                  indent,
                  switchCase: 1,
                },
              ],
              'svelte/max-attributes-per-line': 'error',
              'svelte/mustache-spacing': 'error',
              'svelte/no-extra-reactive-curlies': 'error',
              // 'svelte/no-restricted-html-elements': 'error',
              'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
              'svelte/no-trailing-spaces': 'error',
              'svelte/prefer-class-directive': 'error',
              'svelte/prefer-style-directive': 'error',
              'svelte/shorthand-attribute': 'error',
              'svelte/shorthand-directive': 'error',
              // 'svelte/sort-attributes': 'error',
              'svelte/spaced-html-comment': 'error',
            }
          : {},

        ...overrides,
      },
    },
  ]
}
