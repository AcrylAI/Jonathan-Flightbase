// const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    '@storybook/addon-controls',
    // '@storybook/addon-postcss',
  ],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(sass|s?css)$/i,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
          },
        },
        'resolve-url-loader',
        'sass-loader',
      ],
      include: /\.(module)\.(sass|s?css)$/i,
    });

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        // presets: [['react-app', { flow: false, typescript: true }]],

        presets: [
          '@babel/preset-env',
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
      },
    });

    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.plugins.push(new TsconfigPathsPlugin({}));

    return config;
  },
};
