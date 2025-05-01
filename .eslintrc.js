module.exports = {
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src']
      },
      alias: {
        map: [
          ['@fixtures', './src/fixtures'],
          ['@utils', './src/utils']
        ],
        extensions: ['.js', '.jsx']
      }
    }
  }
};
