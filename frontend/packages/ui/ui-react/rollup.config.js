import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import alias from '@rollup/plugin-alias';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import analyze from 'rollup-plugin-analyzer';
import postcss from 'rollup-plugin-postcss';
import copyAssets from 'postcss-copy-assets';
import autoprefixer from 'autoprefixer';
import strip from '@rollup/plugin-strip';

const outputDir = 'build';

const isDevBuild = process.env.BUILD === 'build';

const plugins = [
  typescript({ useTsconfigDeclarationDir: true }),
  analyze({
    summaryOnly: true,
  }),
  image(),
  peerDepsExternal(),
  resolve(),
  postcss({
    extract: true,
    modules: false,
    minimize: true,
    to: path.resolve(__dirname, `${outputDir}/src`),
    plugins: [autoprefixer, copyAssets()],
  }),
  commonjs({
    include: /node_modules/,
  }),
  alias({
    entries: [
      {
        find: '@src',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  }),
];

if (isDevBuild) {
  // eslint-disable-next-line no-console
  console.log(`ui-react dev build`);
} else {
  // eslint-disable-next-line no-console
  console.log(`ui-react build`);
  plugins.push(
    strip({
      include: '**/*.(js|jsx|ts|tsx)',
    }),
  );
}

export default {
  input: './index.ts',
  output: [
    {
      dir: outputDir,
      format: 'esm',
      exports: 'named',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: '.',
    },
  ],
  plugins,
  external: ['react', 'react-dom', 'react-router-dom'],
};
