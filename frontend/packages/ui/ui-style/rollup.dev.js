import analyze from 'rollup-plugin-analyzer';
import rollup from './rollup.config';

const dir = 'build';
const plugins = [
  analyze({
    summaryOnly: true,
  }),
];

// eslint-disable-next-line no-console
console.log(`ui-style dev build`);

export default {
  input: './src/build.js',
  output: [
    {
      format: 'esm',
      exports: 'named',
      sourcemap: false,
      file: `${dir}/index.js`,
    },
  ],
  plugins: [...rollup.plugins, ...plugins],
};
