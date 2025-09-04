#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuração dos diretórios a serem processados
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

// Função para corrigir boxShadow
function fixBoxShadow(content) {
  // Padrão para encontrar boxShadow standalone (não dentro de Platform.select)
  const standaloneBoxShadowRegex = /(\s+)boxShadow:\s*['"`]([^'"`]+)['"`],?\s*\n/g;
  
  return content.replace(standaloneBoxShadowRegex, (match, indent, shadowValue) => {
    return `${indent}...Platform.select({
${indent}  ios: {
${indent}    shadowColor: '#000',
${indent}    shadowOffset: { width: 0, height: 2 },
${indent}    shadowOpacity: 0.1,
${indent}    shadowRadius: 4,
${indent}  },
${indent}  android: {
${indent}    elevation: 4,
${indent}  },
${indent}  web: {
${indent}    boxShadow: '${shadowValue}',
${indent}  },
${indent}}),
`;
  });
}

// Função para verificar e corrigir keys em .map()
function fixMapKeys(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Buscar por .map( seguido de uma função
    if (line.includes('.map(') && (line.includes('(') || line.includes('=>'))) {
      // Verificar se há uma key nas próximas linhas
      let hasKey = false;
      let checkLines = Math.min(5, lines.length - i - 1);
      
      for (let j = 1; j <= checkLines; j++) {
        if (lines[i + j] && lines[i + j].includes('key=')) {
          hasKey = true;
          break;
        }
      }
      
      if (!hasKey) {
        issues.push({
          file: filePath,
          line: i + 1,
          content: line.trim(),
          suggestion: 'Adicionar key prop única no elemento retornado pelo .map()'
        });
      }
    }
  }
  
  return issues;
}

// Função para encontrar componentes do react-native-paper restantes
function findPaperComponents(content, filePath) {
  const paperComponents = [
    'Appbar', 'FAB', 'Portal', 'Modal', 'Dialog', 'Snackbar', 
    'Surface', 'Divider', 'Chip', 'DataTable', 'Menu',
    'ProgressBar', 'RadioButton', 'Switch', 'ToggleButton'
  ];
  
  const issues = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (const component of paperComponents) {
      if (line.includes(`<${component}`) || line.includes(`${component}.`)) {
        issues.push({
          file: filePath,
          line: i + 1,
          content: line.trim(),
          component: component,
          suggestion: `Substituir ${component} por componente equivalente do react-native-elements`
        });
      }
    }
  }
  
  return issues;
}

// Função principal
function main() {
  console.log('🔧 Iniciando correção automática dos problemas React Native Web...\n');
  
  const jsFiles = findJSFiles(SRC_DIR);
  let totalFixed = 0;
  let mapIssues = [];
  let paperIssues = [];
  
  console.log(`📁 Encontrados ${jsFiles.length} arquivos .js para processar\n`);
  
  // Processar cada arquivo
  for (const filePath of jsFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`📄 Processando: ${relativePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Corrigir boxShadow
    content = fixBoxShadow(content);
    
    // Verificar problemas de .map() keys
    const mapProblems = fixMapKeys(content, relativePath);
    mapIssues.push(...mapProblems);
    
    // Verificar componentes react-native-paper restantes
    const paperProblems = findPaperComponents(content, relativePath);
    paperIssues.push(...paperProblems);
    
    // Salvar arquivo se houve mudanças
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFixed++;
      console.log(`  ✅ Corrigido boxShadow`);
    } else {
      console.log(`  ⚪ Nenhuma correção necessária`);
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE CORREÇÕES');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos com boxShadow corrigidos: ${totalFixed}`);
  
  // Relatório de problemas de .map() keys
  if (mapIssues.length > 0) {
    console.log(`\n⚠️  PROBLEMAS DE KEYS EM .map() (${mapIssues.length}):`);
    console.log('-'.repeat(40));
    
    mapIssues.forEach(issue => {
      console.log(`📁 ${issue.file}:${issue.line}`);
      console.log(`   ${issue.content}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  } else {
    console.log(`✅ Nenhum problema de key em .map() encontrado`);
  }
  
  // Relatório de componentes react-native-paper
  if (paperIssues.length > 0) {
    console.log(`\n⚠️  COMPONENTES REACT-NATIVE-PAPER RESTANTES (${paperIssues.length}):`);
    console.log('-'.repeat(40));
    
    // Agrupar por componente
    const groupedIssues = {};
    paperIssues.forEach(issue => {
      if (!groupedIssues[issue.component]) {
        groupedIssues[issue.component] = [];
      }
      groupedIssues[issue.component].push(issue);
    });
    
    Object.keys(groupedIssues).forEach(component => {
      console.log(`\n🔧 ${component} (${groupedIssues[component].length} ocorrências):`);
      groupedIssues[component].forEach(issue => {
        console.log(`   📁 ${issue.file}:${issue.line}`);
        console.log(`      ${issue.content}`);
      });
    });
  } else {
    console.log(`✅ Nenhum componente react-native-paper restante encontrado`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Correção automática concluída!');
  console.log('='.repeat(60));
  
  if (mapIssues.length > 0 || paperIssues.length > 0) {
    console.log('\n📋 PRÓXIMOS PASSOS MANUAIS:');
    if (mapIssues.length > 0) {
      console.log('1. Revisar e corrigir as keys em .map() listadas acima');
    }
    if (paperIssues.length > 0) {
      console.log('2. Migrar os componentes react-native-paper restantes');
    }
    console.log('3. Testar o app no navegador e mobile');
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { fixBoxShadow, fixMapKeys, findPaperComponents };
