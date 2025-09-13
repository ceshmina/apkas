import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })


const eslintConfig = [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/build/**', '**/next-env.d.ts'],
  },

  ...compat.extends('next/core-web-vitals').map(config => ({
    files: ['apps/**'],
    ...config,
  })),

  ...compat.extends('next/typescript'),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'max-len': ['error', { 'code': 120 }],
      'quotes': ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-double'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
]

export default eslintConfig
