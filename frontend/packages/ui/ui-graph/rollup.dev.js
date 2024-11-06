import rollup from './rollup.config';

import htmlTemplate from 'rollup-plugin-generate-html-template';

const input = './src/build.ts';
const dir = 'build';

// eslint-disable-next-line no-console
console.log(`ui-graph dev build`);

const output = [
  {
    format: 'esm',
    exports: 'named',
    sourcemap: true,
    file: `${dir}/index.js`,
  },
];

const plugins = [
  htmlTemplate({
    template: 'public/index.html',
    target: `${dir}/index.html`,
  }),
];

export default {
  ...rollup,
  input,
  output,
  plugins: [...rollup.plugins, ...plugins],
};
