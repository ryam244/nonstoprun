module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/theme': './src/theme/index',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/stores': './src/stores',
            '@/services': './src/services',
            '@/utils': './src/utils',
          },
        },
      ],
    ],
  };
};
