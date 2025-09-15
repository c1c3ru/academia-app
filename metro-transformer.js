// Custom Metro transformer to replace import.meta before Babel processing
const babelTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = function(params) {
  const { src, filename, options } = params;
  
  // Replace import.meta with a safe alternative at the source level
  let transformedSrc = src.replace(
    /import\.meta/g, 
    '(typeof globalThis !== "undefined" && globalThis.import && globalThis.import.meta ? globalThis.import.meta : { url: typeof window !== "undefined" ? window.location.href : "file:///", env: typeof process !== "undefined" ? process.env : {} })'
  );

  // Call the default transformer with the modified source
  return babelTransformer.transform({
    ...params,
    src: transformedSrc,
  });
};
