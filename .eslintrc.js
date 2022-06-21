module.exports = {
  extends: [
    '@cybozu',
    '@cybozu/eslint-config/globals/kintone',
  ],
  parserOptions: {
    sourceType: 'script',
  },
  globals: {
    garoon: false
  }
};
