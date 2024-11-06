import rollup from './rollup.config';

import htmlTemplate from 'rollup-plugin-generate-html-template';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const input = './src/index.ts';
const dir = 'dist';

const isStart = process.env.BUILD === 'start';

if (!isStart) {
  // eslint-disable-next-line no-console
  console.log(`ui-graph guide build`);
}

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

if (isStart) {
  plugins.push(
    serve({
      open: true,
      verbose: true,
      contentBase: ['', dir],
      historyApiFallback: true,
      host: 'localhost',
      port: 8083,
    }),
  );
  plugins.push(
    livereload({
      watch: ['', dir],
    }),
  );
}

export default {
  ...rollup,
  input,
  output,
  plugins: [...rollup.plugins, ...plugins],
};
