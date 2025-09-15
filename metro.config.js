// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix import.meta error using custom transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./metro-transformer.js'),
  unstable_allowRequireContext: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

// Inject polyfill at the very beginning of every bundle
const originalGetPolyfills = config.serializer?.getPolyfills;
config.serializer = {
  ...config.serializer,
  getPolyfills: () => {
    const polyfills = originalGetPolyfills ? originalGetPolyfills() : [];
    return [
      require.resolve('./src/polyfills/import-meta-polyfill.js'),
      ...polyfills,
    ];
  },
};

config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
};

// Configure for Replit environment
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Allow requests from any host (Replit proxy)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
