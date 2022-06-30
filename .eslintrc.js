module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],

  rules: {
    'eslint-comments/disable-enable-pair': 0,
    'react/no-unused-prop-types': 1,
    'react-hooks/exhaustive-deps': 1,
    'no-loop-func': 0,
    '@typescript-eslint/no-loop-func': 0,
    '@typescript-eslint/consistent-type-imports': 0,
    '@typescript-eslint/consistent-type-definitions': 0,
  },
};
