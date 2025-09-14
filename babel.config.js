module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [],
    env: {
      web: {
        plugins: [
          // Plugin para transformar process.env de forma segura no web
          ['babel-plugin-transform-define', {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'typeof process': JSON.stringify('undefined'),
            '__DEV__': process.env.NODE_ENV !== 'production'
          }]
        ]
      }
    }
  };
};
