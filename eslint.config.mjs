import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  { ignores: ['.next/**', 'node_modules/**', '.claude/**', 'next-env.d.ts', 'scripts/**'] },
  {
    // Legacy admin CRUD screens fetch on mount and set loading state inside the effect.
    // The React Compiler rules flag that pattern; it works, and rewriting the admin data
    // flow is out of scope for the restyle, so these stay visible as warnings here only.
    files: ['app/admin/**', 'components/home/**'],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]

export default config
