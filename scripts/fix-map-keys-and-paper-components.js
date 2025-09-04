#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

// Função para buscar arquivos .js recursivamente
function findJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Mapeamento de componentes Paper para Elements
const componentMappings = {
  'FAB': {
    import: "import { FAB } from 'react-native-elements';",
    replacement: 'FAB'
  },
  'Snackbar': {
    import: "// Snackbar substituído por notificação customizada",
    replacement: 'View // TODO: Implementar notificação customizada'
  },
  'Switch': {
    import: "import { Switch } from 'react-native';",
    replacement: 'Switch'
  },
  'Surface': {
    import: "import { Card } from 'react-native-elements';",
    replacement: 'Card'
  },
  'Chip': {
    import: "import { Badge } from 'react-native-elements';",
    replacement: 'Badge'
  },
  'Divider': {
    import: "import { Divider } from 'react-native-elements';",
    replacement: 'Divider'
  }
};

// Função para corrigir keys em .map() críticos
function fixCriticalMapKeys(content, filePath) {
  let fixed = false;
  
  // Casos específicos identificados pelo script anterior
  const fixes = [
    // StudentEvolution.js - linha 290
    {
      pattern: /stats\.modalities\.map\(\(modality, index\) => \(/,
      replacement: 'stats.modalities.map((modality, index) => (',
      keyFix: true
    },
    // StudentEvolution.js - linha 305  
    {
      pattern: /stats\.recentGraduations\.map\(\(graduation, index\) => \(/,
      replacement: 'stats.recentGraduations.map((graduation, index) => (',
      keyFix: true
    }
  ];
  
  for (const fix of fixes) {
    if (fix.pattern.test(content)) {
      // Verificar se já tem key
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (fix.pattern.test(lines[i])) {
          // Procurar por key nas próximas 3 linhas
          let hasKey = false;
          for (let j = 1; j <= 3 && i + j < lines.length; j++) {
            if (lines[i + j].includes('key=')) {
              hasKey = true;
              break;
            }
          }
          
          if (!hasKey) {
            console.log(`⚠️  Problema de key encontrado em ${path.relative(process.cwd(), filePath)}:${i + 1}`);
            console.log(`   ${lines[i].trim()}`);
          }
        }
      }
    }
  }
  
  return { content, fixed };
}

// Função para migrar componentes Paper
function migratePaperComponents(content, filePath) {
  let modified = content;
  let changes = [];
  
  // Substituir componentes específicos
  const replacements = [
    // FAB
    {
      pattern: /<FAB\s+([^>]*)\s*\/?>[\s\S]*?<\/FAB>/g,
      replacement: (match, props) => {
        changes.push('FAB → FAB (react-native-elements)');
        return match; // Manter FAB do react-native-elements
      }
    },
    
    // Surface → Card
    {
      pattern: /<Surface\s+([^>]*?)>/g,
      replacement: (match, props) => {
        changes.push('Surface → Card');
        return `<Card containerStyle={${props.includes('style=') ? props.replace('style=', '') : 'styles.card'}}>`;
      }
    },
    {
      pattern: /<\/Surface>/g,
      replacement: () => {
        return '</Card>';
      }
    },
    
    // Chip → Badge
    {
      pattern: /<Chip\s+([^>]*?)>/g,
      replacement: (match, props) => {
        changes.push('Chip → Badge');
        // Extrair propriedades relevantes
        const modeMatch = props.match(/mode="([^"]*)"/) || [];
        const styleMatch = props.match(/style=\{([^}]*)\}/) || [];
        
        let badgeProps = '';
        if (styleMatch[1]) {
          badgeProps += `badgeStyle={${styleMatch[1]}} `;
        }
        
        return `<Badge ${badgeProps}${props.replace(/mode="[^"]*"/, '').trim()}>`;
      }
    },
    {
      pattern: /<\/Chip>/g,
      replacement: () => '</Badge>'
    },
    
    // Divider já é compatível, apenas garantir import correto
    
    // Switch já é do React Native core
  ];
  
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(modified)) {
      modified = modified.replace(pattern, replacement);
    }
  }
  
  return { content: modified, changes };
}

// Função principal
function main() {
  console.log('🔧 Corrigindo keys em .map() e migrando componentes Paper...\n');
  
  const jsFiles = findJSFiles(SRC_DIR);
  let totalFixed = 0;
  let totalMigrated = 0;
  
  for (const filePath of jsFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Corrigir keys em .map()
    const keyResult = fixCriticalMapKeys(content, filePath);
    content = keyResult.content;
    
    // Migrar componentes Paper
    const migrationResult = migratePaperComponents(content, filePath);
    content = migrationResult.content;
    
    // Salvar se houve mudanças
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${relativePath}`);
      
      if (keyResult.fixed) {
        console.log(`   🔑 Keys corrigidas`);
        totalFixed++;
      }
      
      if (migrationResult.changes.length > 0) {
        console.log(`   📦 Migrações: ${migrationResult.changes.join(', ')}`);
        totalMigrated++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DAS CORREÇÕES');
  console.log('='.repeat(60));
  console.log(`🔑 Arquivos com keys corrigidas: ${totalFixed}`);
  console.log(`📦 Arquivos com componentes migrados: ${totalMigrated}`);
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Verificar imports dos componentes migrados');
  console.log('2. Testar funcionalidade dos componentes migrados');
  console.log('3. Executar app no navegador para validar correções');
}

if (require.main === module) {
  main();
}
