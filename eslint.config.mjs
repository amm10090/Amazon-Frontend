import { FlatCompat } from '@eslint/eslintrc';
import tsUtilsPkg from '@typescript-eslint/utils';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';

// 如果需要使用ESLint可以从utils包中解构
// const { ESLint } = tsUtilsPkg;

// 使用FlatCompat来帮助Next.js识别配置
const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

// 获取Next.js配置
const nextjsConfig = compat.config({
    extends: ['next/core-web-vitals'],
    settings: {
        next: {
            rootDir: '.',
        },
    },
});

// 主ESLint配置
const eslintConfig = [
    // 基本JavaScript/TypeScript规则
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: 'module',
            globals: {
                React: 'readonly',
            },
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.json',
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
            import: importPlugin,
            'unused-imports': unusedImportsPlugin,
            '@next/next': nextPlugin,
        },

        // 使用推荐的规则集
        rules: {
            // JavaScript核心规则
            'no-undef': 'error',
            'no-unused-vars': 'off', // 使用typescript-eslint的规则替代
            'no-console': 'warn',
            'no-duplicate-imports': 'error',
            'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
            'prefer-const': 'warn',
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'no-var': 'error',
            'quotes': ['warn', 'single', { avoidEscape: true }],
            'semi': ['warn', 'always'],

            // TypeScript规则
            '@typescript-eslint/no-unused-vars': ['warn', {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_'
            }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-empty-interface': 'warn',
            '@typescript-eslint/ban-ts-comment': ['warn', {
                'ts-ignore': 'allow-with-description',
                'ts-expect-error': 'allow-with-description',
            }],
            '@typescript-eslint/consistent-type-imports': ['warn', {
                prefer: 'type-imports',
                disallowTypeAnnotations: false,
            }],

            // React规则
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',
            'react/jsx-uses-react': 'off',
            'react/self-closing-comp': 'warn',
            'react/jsx-sort-props': 'off',
            'react/jsx-no-duplicate-props': 'error',
            'react/jsx-pascal-case': 'warn',
            'react/jsx-curly-brace-presence': ['warn', 'never'],
            'react/no-array-index-key': 'warn',

            // React Hooks规则
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // 可访问性规则
            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/interactive-supports-focus': 'warn',
            'jsx-a11y/alt-text': 'warn',
            'jsx-a11y/anchor-has-content': 'warn',
            'jsx-a11y/aria-props': 'warn',

            // 导入规则
            'unused-imports/no-unused-imports': 'warn',
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'external',
                            position: 'before',
                        },
                        {
                            pattern: 'next/**',
                            group: 'external',
                            position: 'before',
                        },
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            'import/no-duplicates': 'error',

            // 代码格式规则
            'padding-line-between-statements': [
                'warn',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
            ],

            // Next.js规则
            '@next/next/no-html-link-for-pages': ['off', ['pages', 'app']],
            '@next/next/no-img-element': 'warn',
            '@next/next/no-sync-scripts': 'warn',
        },

        // React设置
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: true,
                node: true,
            },
            next: {
                rootDir: '.',
                pagesDir: ['./pages', './app'],
            },
        },
    },

    // Next.js配置
    ...nextjsConfig,

    // TypeScript推荐规则配置 - 修复不可迭代错误
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            // 基本TypeScript规则
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn'
        }
    },

    // 忽略文件配置
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            '**/coverage/**',
            '**/public/**',
            '**/*.config.js',
            '**/*.config.ts',
            '**/next-env.d.ts',
            '**/app/[locale]/layout.tsx',
            '**/postcss.config.js',
            '**/tailwind.config.js',
            '**/.turbo/**',
            '**/scripts/**',
        ],
    },

    // Prettier配置 (必须放在最后以覆盖冲突的规则)
    eslintConfigPrettier,
];

export default eslintConfig; 