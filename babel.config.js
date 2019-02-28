// @flow
module.exports = {
  plugins: [
    '@babel/plugin-syntax-flow',
    '@babel/plugin-transform-flow-strip-types',
    ['@babel/plugin-proposal-class-properties', {loose: false}],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
