import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist', 'node_modules', 'build', 'coverage'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
    {
        files: ['**/*.{js,ts,jsx,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
            prettier,
        },
        rules: {
            // Base rules
            'no-undef': 'warn',
            'no-unused-expressions': 'warn',
            semi: ['error', 'always'],
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'warn',

            // Import sorting
            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [
                        ['^react', '^@?\\w'],
                        ['^@/'],
                        [
                            '^(app|pages|widgets|features|entities|shared)(/.*|$)',
                        ],
                        [
                            '^\\./(?=.*/)(?!/?$)',
                            '^\\.(?!/?$)',
                            '^\\./?$',
                            '^\\.\\.(?!/?$)',
                            '^\\.\\./?$',
                        ],
                        ['^'],
                        ['^.+\\.?(types)$'],
                        ['.module.scss', '.styled', '^.+\\.?(css)$'],
                    ],
                },
            ],

            // TypeScript rules
            '@typescript-eslint/indent': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',

            // React rules
            'react/jsx-indent': ['error', 4],
            'react/jsx-indent-props': ['error', 4],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            // Prettier integration
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
