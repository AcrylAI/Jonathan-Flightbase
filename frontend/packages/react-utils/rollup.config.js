import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import analyze from 'rollup-plugin-analyzer';
import alias from '@rollup/plugin-alias';
import strip from '@rollup/plugin-strip';
import { terser } from 'rollup-plugin-terser';

const isDevBuild = process.env.BUILD === 'build';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const input = './src/index.ts';

const dir = 'build';

const output = [
  {
    format: 'esm',
    exports: 'named',
    sourcemap: true,
    file: `${dir}/index.js`,
  },
];

const plugins = [
  analyze({
    summaryOnly: true,
  }),
  peerDepsExternal(),
  typescript({
    useTsconfigDeclarationDir: true,
  }),
  commonjs({ include: /node_modules/ }),
  nodeResolve({ extensions }),
  alias({
    entries: [
      {
        find: '@src',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  }),
  terser(),
];

if (!isDevBuild) {
  plugins.push(
    strip({
      include: '**/*.(js|jsx|ts|tsx)',
    }),
  );
}

export default {
  input,
  output,
  plugins,
};
