import typescript from 'rollup-plugin-typescript2'
export default {
  external: [],
  input: 'src/index.ts', // Path relative to package.json
  output: {
    name: 'AudinoJS',
    exports: 'named',
    globals: {}
  },
  plugins: [
    typescript({
      clean: true
    })
  ],
}