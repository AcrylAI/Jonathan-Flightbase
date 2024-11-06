import rollup from './rollup.config';

const input = './src/build.ts';
const dir = 'build';

// eslint-disable-next-line no-console
console.log(`ui-graph build`);

const output = [
  {
    format: 'esm',
    exports: 'named',
    sourcemap: false,
    file: `${dir}/index.js`,
  },
];

export default {
  ...rollup,
  input,
  output,
};
