#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Iniciando análise do bundle...\n');

// Função para obter tamanho de arquivo em KB
const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    return 'N/A';
  }
};

// Função para analisar dependências do package.json
const analyzeDependencies = () => {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  
  console.log('📦 ANÁLISE DE DEPENDÊNCIAS');
  console.log('=' .repeat(50));
  console.log(`Total de dependências: ${Object.keys(deps).length}`);
  console.log(`Total de dev dependencies: ${Object.keys(devDeps).length}`);
  console.log(`Total geral: ${Object.keys(deps).length + Object.keys(devDeps).length}\n`);
  
  // Dependências por categoria
  const categories = {
    'React/Navigation': ['react', 'react-dom', 'react-native', '@react-navigation'],
    'Expo': ['expo'],
    'Firebase': ['firebase'],
    'UI': ['react-native-paper', 'react-native-elements', 'react-native-vector-icons'],
    'State Management': ['zustand'],
    'Utils': ['dotenv']
  };
  
  Object.entries(categories).forEach(([category, prefixes]) => {
    const categoryDeps = Object.keys(deps).filter(dep => 
      prefixes.some(prefix => dep.startsWith(prefix))
    );
    if (categoryDeps.length > 0) {
      console.log(`${category}: ${categoryDeps.length} packages`);
      categoryDeps.forEach(dep => console.log(`  - ${dep}@${deps[dep]}`));
      console.log('');
    }
  });
};

// Função para analisar estrutura de arquivos
const analyzeFileStructure = () => {
  console.log('📁 ANÁLISE DE ESTRUTURA');
  console.log('=' .repeat(50));
  
  const srcPath = path.join(__dirname, '../src');
  const analyzeDir = (dirPath, indent = '') => {
    try {
      const items = fs.readdirSync(dirPath);
      let totalSize = 0;
      let fileCount = 0;
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          console.log(`${indent}📂 ${item}/`);
          const subResult = analyzeDir(itemPath, indent + '  ');
          totalSize += subResult.size;
          fileCount += subResult.count;
        } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
          const size = parseFloat(getFileSize(itemPath));
          console.log(`${indent}📄 ${item} (${size} KB)`);
          totalSize += size;
          fileCount++;
        }
      });
      
      if (indent === '') {
        console.log(`\nTotal: ${fileCount} arquivos, ${totalSize.toFixed(2)} KB\n`);
      }
      
      return { size: totalSize, count: fileCount };
    } catch (error) {
      console.log(`${indent}❌ Erro ao analisar: ${error.message}`);
      return { size: 0, count: 0 };
    }
  };
  
  analyzeDir(srcPath);
};

// Função para verificar imports desnecessários
const analyzeImports = () => {
  console.log('🔍 ANÁLISE DE IMPORTS');
  console.log('=' .repeat(50));
  
  const findUnusedImports = (dirPath) => {
    const issues = [];
    
    const analyzeFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Procurar por imports não utilizados (análise básica)
        lines.forEach((line, index) => {
          if (line.trim().startsWith('import') && line.includes('from')) {
            // Extrair nome do import
            const importMatch = line.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))/);
            if (importMatch) {
              const importName = importMatch[1] || importMatch[2] || importMatch[3];
              if (importName && !content.includes(importName.trim()) && content.indexOf(line) === content.lastIndexOf(line)) {
                // Possível import não utilizado (análise simples)
                const relativePath = path.relative(path.join(__dirname, '..'), filePath);
                issues.push({
                  file: relativePath,
                  line: index + 1,
                  import: line.trim()
                });
              }
            }
          }
        });
      } catch (error) {
        // Ignorar erros de leitura
      }
    };
    
    const walkDir = (dirPath) => {
      try {
        const items = fs.readdirSync(dirPath);
        items.forEach(item => {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            walkDir(itemPath);
          } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
            analyzeFile(itemPath);
          }
        });
      } catch (error) {
        // Ignorar erros
      }
    };
    
    walkDir(dirPath);
    return issues;
  };
  
  const srcPath = path.join(__dirname, '../src');
  const issues = findUnusedImports(srcPath);
  
  if (issues.length > 0) {
    console.log('⚠️  Possíveis imports não utilizados encontrados:');
    issues.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.import}`);
    });
    if (issues.length > 10) {
      console.log(`  ... e mais ${issues.length - 10} issues`);
    }
  } else {
    console.log('✅ Nenhum import suspeito encontrado');
  }
  console.log('');
};

// Executar análises
try {
  analyzeDependencies();
  analyzeFileStructure();
  analyzeImports();
  
  console.log('🎯 RECOMENDAÇÕES');
  console.log('=' .repeat(50));
  console.log('1. Considere usar react-native-fast-image quando compatível com React 19');
  console.log('2. Remova react-native-elements se usando apenas react-native-paper');
  console.log('3. Implemente code splitting para telas menos utilizadas');
  console.log('4. Use lazy loading para componentes pesados');
  console.log('5. Considere tree-shaking para reduzir bundle size');
  
} catch (error) {
  console.error('❌ Erro durante análise:', error.message);
  process.exit(1);
}

console.log('\n✅ Análise concluída!');
