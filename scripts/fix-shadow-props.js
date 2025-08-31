const fs = require('fs');
const path = require('path');

// Diretório raiz do projeto
const rootDir = path.join(__dirname, '..');

// Função para processar um arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Padrão para encontrar estilos que usam shadow* diretamente
    const shadowPattern = /(\s+)(shadow(?:Color|Offset|Opacity|Radius))\s*:/g;
    
    // Verifica se o arquivo já usa Platform.select para sombras
    if (!content.includes('...Platform.select({')) {
      // Encontra blocos de estilo que contenham propriedades shadow*
      const styleBlockPattern = /(\w+):\s*\{[^}]*shadow[^}]*\}/gs;
      let match;
      
      while ((match = styleBlockPattern.exec(content)) !== null) {
        const styleBlock = match[0];
        const styleName = match[1];
        
        if (styleBlock.match(shadowPattern)) {
          // Extrai as propriedades de sombra
          const shadowColor = extractShadowProperty(styleBlock, 'shadowColor', '"#000"');
          const shadowOffset = extractShadowProperty(styleBlock, 'shadowOffset', '{ width: 0, height: 2 }');
          const shadowOpacity = extractShadowProperty(styleBlock, 'shadowOpacity', '0.2');
          const shadowRadius = extractShadowProperty(styleBlock, 'shadowRadius', '4');
          const elevation = extractShadowProperty(styleBlock, 'elevation', '4');
          
          // Remove as propriedades antigas
          let newStyleBlock = styleBlock
            .replace(/\s+shadow(?:Color|Offset|Opacity|Radius)\s*:.*?[,}]/g, '')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*,\s*/g, ',');
          
          // Adiciona o Platform.select
          newStyleBlock = newStyleBlock.replace(
            '}', 
            `,\n    ...Platform.select({\n      web: {\n        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'\n      },\n      ios: {\n        shadowColor: ${shadowColor},\n        shadowOffset: ${shadowOffset},\n        shadowOpacity: ${shadowOpacity},\n        shadowRadius: ${shadowRadius}\n      },\n      default: {\n        elevation: ${elevation}\n      }\n    })\n  }`
          );
          
          // Atualiza o conteúdo
          content = content.replace(styleBlock, newStyleBlock);
          modified = true;
        }
      }
    }
    
    // Adiciona a importação do Platform se necessário
    if (modified && !content.includes("import { Platform } from 'react-native'")) {
      content = content.replace(
        /import\s+{[^}]*}\s+from\s+['"]react-native['"]/,
        match => match.includes('Platform') ? match : match.replace('{', '{ Platform, ')
      );
      
      if (!content.includes("import { Platform } from 'react-native'")) {
        content = `import { Platform } from 'react-native';\n${content}`;
      }
    }
    
    // Salva o arquivo se foi modificado
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
    } else {
      console.log(`ℹ️  Nenhuma alteração necessária: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error);
    return false;
  }
}

// Função auxiliar para extrair propriedades de sombra
function extractShadowProperty(styleBlock, prop, defaultValue) {
  const regex = new RegExp(`${prop}\\s*:\\s*([^,}\n]+)`);
  const match = styleBlock.match(regex);
  return match ? match[1].trim() : defaultValue;
}

// Função para percorrer diretórios
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let modifiedCount = 0;
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignora node_modules e outros diretórios desnecessários
      if (!['node_modules', '.git', 'build', 'dist', '.expo'].includes(file)) {
        modifiedCount += processDirectory(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
      if (processFile(fullPath)) {
        modifiedCount++;
      }
    }
  });
  
  return modifiedCount;
}

// Executa o script
console.log('🔍 Procurando por propriedades de sombra para atualizar...');
const modifiedCount = processDirectory(path.join(rootDir, 'src'));
console.log(`\n✅ Concluído! ${modifiedCount} arquivos foram atualizados.`);
