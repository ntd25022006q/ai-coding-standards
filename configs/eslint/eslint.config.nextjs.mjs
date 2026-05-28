/**
 * Optional Next.js ESLint Config
 * ================================
 * For Next.js projects, use this config INSTEAD of eslint.config.mjs.
 *
 * Setup:
 *   1. Copy this file to your project root as `eslint.config.mjs`
 *   2. Install the Next.js plugin: npm install --save-dev @next/eslint-plugin-next
 *   3. Ensure your tsconfig.json includes Next.js compiler options
 */

import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    name: 'nextjs/rules',
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js best practices
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-document-import-in-page': 'off',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-title-in-document-head': 'off',
    },
  },
];
