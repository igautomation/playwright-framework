module.exports = {
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
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@config': './src/config',
          '@pages': './src/pages',
          '@utils': './src/utils',
          '@fixtures': './src/fixtures',
          '@data': './src/data',
          '@tests': './src/tests'
        },
      },
    ],
  ],
};