import rollup from './rollup.config';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isStart = process.env.BUILD;

const dir = 'dist';
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
      port: 8082,
    }),
  );
  plugins.push(
    livereload({
      watch: ['', dir],
    }),
  );
} else {
  // eslint-disable-next-line no-console
  console.log(`ui-style guild build`);
}

export default {
  input: './src/index.js',
  output: [
    {
      format: 'esm',
      exports: 'named',
      sourcemap: true,
      file: `${dir}/index.js`,
    },
  ],
  plugins: [...rollup.plugins, ...plugins],
};
