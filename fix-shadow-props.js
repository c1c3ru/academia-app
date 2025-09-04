const fs = require('fs');
const path = require('path');

// Função para corrigir propriedades shadow* em um arquivo
function fixShadowProps(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Padrão para encontrar blocos ios com propriedades shadow
    const iosBlockPattern = /ios:\s*{\s*shadowColor:\s*'#000',\s*shadowOffset:\s*{\s*width:\s*\d+,\s*height:\s*\d+\s*},\s*shadowOpacity:\s*[\d.]+,\s*shadowRadius:\s*\d+,?\s*}/g;
    
    if (iosBlockPattern.test(content)) {
      content = content.replace(iosBlockPattern, 'ios: {}');
      modified = true;
    }

    // Padrão mais específico para blocos multilinhas
    const multilinePattern = /ios:\s*{\s*shadowColor:\s*'#000',\s*shadowOffset:\s*{\s*width:\s*\d+,\s*height:\s*\d+\s*},\s*shadowOpacity:\s*[\d.]+,\s*shadowRadius:\s*\d+,?\s*}/gs;
    
    if (multilinePattern.test(content)) {
      content = content.replace(multilinePattern, 'ios: {}');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para percorrer diretórios recursivamente
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

// Executar correção
console.log('🔧 Iniciando correção de propriedades shadow* deprecated...\n');

let filesFixed = 0;
walkDir('./src', (filePath) => {
  if (fixShadowProps(filePath)) {
    filesFixed++;
  }
});

console.log(`\n✨ Correção concluída! ${filesFixed} arquivos foram corrigidos.`);
