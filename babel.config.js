// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ],
  plugins: [
    ['module-resolver', {
      root: ['.'],
      alias: {
        '@utils': './src/utils',
        '@fixtures': './src/fixtures',
        '@pages': './src/pages',
        '@tests': './src/tests'
      }
    }]
  ]
};