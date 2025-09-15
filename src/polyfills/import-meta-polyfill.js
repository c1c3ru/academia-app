// Polyfill para import.meta em ambientes que não suportam nativamente
// Usado principalmente para resolver problemas de compatibilidade com Metro bundler

// Execute immediately to define import.meta before any other code
(function() {
  'use strict';
  
  // Skip if already defined
  if (typeof globalThis !== 'undefined' && globalThis['import'] && globalThis['import'].meta) {
    return;
  }
  
  // Criar objeto import.meta compatível
  const importMeta = {
    url: typeof window !== 'undefined' ? window.location.href : 'file:///',
    env: typeof process !== 'undefined' ? process.env : {},
    resolve: function(specifier) {
      if (typeof require !== 'undefined' && require.resolve) {
        try {
          return require.resolve(specifier);
        } catch (e) {
          return specifier;
        }
      }
      return specifier;
    }
  };
  
  // Definir import.meta globalmente antes que qualquer código seja executado
  try {
    // Método mais direto para definir import.meta
    if (typeof globalThis !== 'undefined') {
      Object.defineProperty(globalThis, 'import', {
        value: { meta: importMeta },
        writable: false,
        configurable: true
      });
    }
    
    if (typeof global !== 'undefined') {
      Object.defineProperty(global, 'import', {
        value: { meta: importMeta },
        writable: false,
        configurable: true
      });
    }
    
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'import', {
        value: { meta: importMeta },
        writable: false,
        configurable: true
      });
    }
    
    if (typeof self !== 'undefined') {
      Object.defineProperty(self, 'import', {
        value: { meta: importMeta },
        writable: false,
        configurable: true
      });
    }
  } catch (e) {
    // Fallback para ambientes mais restritivos
    try {
      if (typeof globalThis !== 'undefined') {
        globalThis.import = { meta: importMeta };
      }
      if (typeof global !== 'undefined') {
        global.import = { meta: importMeta };
      }
      if (typeof window !== 'undefined') {
        window.import = { meta: importMeta };
      }
    } catch (fallbackError) {
      console.warn('Could not define import.meta polyfill:', fallbackError.message);
    }
  }
})();

// Exportar um objeto vazio para compatibilidade com sistemas de módulos
module.exports = {};
