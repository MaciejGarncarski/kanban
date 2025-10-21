/**
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'all',
  tabWidth: 2,
  singleQuote: true,
  printWidth: 80,
  bracketSameLine: true,
  semi: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
