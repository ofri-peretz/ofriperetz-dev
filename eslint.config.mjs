// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import importNext from 'eslint-plugin-import-next'

export default withNuxt({
  plugins: {
    'import-next': importNext
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import-next/no-cycle': 'error'
  }
})
