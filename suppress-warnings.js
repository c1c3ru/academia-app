// Supressor de avisos de deprecação para React Native Web
// Este arquivo ajuda a suprimir avisos conhecidos de bibliotecas externas

const originalWarn = console.warn;
const originalError = console.error;

// Lista de avisos que queremos suprimir
const suppressedWarnings = [
  'props.pointerEvents is deprecated. Use style.pointerEvents',
  'shadow* style props are deprecated. Use boxShadow',
];

// Função para verificar se um aviso deve ser suprimido
function shouldSuppressWarning(message) {
  return suppressedWarnings.some(warning => 
    typeof message === 'string' && message.includes(warning)
  );
}

// Sobrescrever console.warn
console.warn = function(...args) {
  const message = args[0];
  if (!shouldSuppressWarning(message)) {
    originalWarn.apply(console, args);
  }
};

// Sobrescrever console.error para avisos que aparecem como erro
console.error = function(...args) {
  const message = args[0];
  if (!shouldSuppressWarning(message)) {
    originalError.apply(console, args);
  }
};

export default {
  originalWarn,
  originalError,
  restore: () => {
    console.warn = originalWarn;
    console.error = originalError;
  }
};
