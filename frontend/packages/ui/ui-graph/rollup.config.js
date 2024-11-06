import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import autoprefixer from 'autoprefixer';
import copyAssets from 'postcss-copy-assets';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const plugins = [
  typescript({
    useTsconfigDeclarationDir: true,
  }),
  peerDepsExternal(),
  postcss({
    extract: true,
    modules: false,
    minimize: true,
    plugins: [autoprefixer(), copyAssets()],
  }),
  resolve({ extensions }),
  commonjs({ include: /node_modules/ }),
  babel({ extensions, include: ['src/**/*'], babelHelpers: 'bundled' }),
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
      {
        find: '@graph',
        replacement: path.resolve(__dirname, 'src/graph'),
      },
    ],
  }),
  terser(),
];

export default {
  plugins,
};
