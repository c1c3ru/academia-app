// Polyfill para import.meta em ambientes que não suportam nativamente
// Usado principalmente para resolver problemas de compatibilidade com Metro bundler

// Definir import.meta globalmente se não existir
if (typeof globalThis !== 'undefined' && typeof globalThis.import === 'undefined') {
  globalThis.import = {
    meta: {
      url: typeof window !== 'undefined' ? window.location.href : 'file:///',
      env: typeof process !== 'undefined' ? process.env : {},
      // Propriedades comuns do import.meta
      resolve: (specifier) => {
        // Implementação básica de resolve
        if (typeof require !== 'undefined' && require.resolve) {
          try {
            return require.resolve(specifier);
          } catch (e) {
            return specifier;
          }
        }
        return specifier;
      }
    }
  };
}

// Para ambientes Node.js/Metro que não têm import.meta
if (typeof global !== 'undefined' && typeof global.import === 'undefined') {
  global.import = {
    meta: {
      url: 'file:///',
      env: typeof process !== 'undefined' ? process.env : {},
      resolve: (specifier) => {
        if (typeof require !== 'undefined' && require.resolve) {
          try {
            return require.resolve(specifier);
          } catch (e) {
            return specifier;
          }
        }
        return specifier;
      }
    }
  };
}

// Exportar um objeto vazio para compatibilidade com sistemas de módulos
module.exports = {};
