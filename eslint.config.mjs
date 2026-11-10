import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  { ignores: ['.next/**', 'node_modules/**', '.claude/**', 'next-env.d.ts', 'scripts/**'] },
]

export default config
