// @flow

declare module 'prettier' {
  declare module.exports: {
    format(string, config?: mixed): string,
  };
}
