import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import image from '@rollup/plugin-image';
// import { terser } from 'rollup-plugin-terser';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import copyAssets from 'postcss-copy-assets';

const extensions = ['.js'];

const plugins = [
  peerDepsExternal(),
  image(),
  resolve({ extensions }),
  commonjs({ include: /node_modules/ }),
  babel({ extensions, include: ['src/**/*'], babelHelpers: 'bundled' }),
  postcss({
    extract: true,
    modules: false,
    minimize: true,
    plugins: [autoprefixer(), copyAssets()],
  }),
  alias({
    entries: [
      {
        find: '@src',
        replacement: path.resolve(__dirname, 'src'),
      },
      {
        find: '@react',
        replacement: path.resolve(__dirname, 'src/custom_modules/react'),
      },
    ],
  }),
  terser(),
];

export default {
  plugins,
};
