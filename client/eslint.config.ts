import { defineConfig } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            ...tseslint.configs.recommended,
            react.configs.flat.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
        },
        plugins: {
            prettier,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            '@typescript-eslint/indent': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',
            'react/jsx-indent': ['error', 4],
            'react/jsx-indent-props': ['error', 4],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'prettier/prettier': 'error',

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
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
