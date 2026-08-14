module.exports = {
    env: {
        node: true,
        es2022: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'commonjs',
    },
    rules: {
        // Code quality
        'no-console': 'warn',         // Flag stray console.log — we use pino now
        'no-unused-vars': ['error', { argsIgnorePattern: '^_|next' }],
        'no-var': 'error',
        'prefer-const': 'error',

        // Security
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',

        // Style (minimal — not enforcing prettier here)
        'eqeqeq': ['error', 'always'],
        'curly': ['error', 'all'],
    },
    ignorePatterns: ['node_modules/', 'coverage/', 'logs/'],
};
