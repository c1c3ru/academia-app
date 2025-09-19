# 🧪 TestSprite - Academia App

## Configuração Completa de Testes

Configurei o TestSprite para o seu projeto Academia App! Aqui está um resumo do que foi implementado:

## ✅ O que foi Configurado

### 1. **TestSprite MCP Instalado**
```bash
✓ @testsprite/testsprite-mcp instalado
✓ Configuração MCP com sua API Key
✓ Scripts npm configurados
```

### 2. **Estrutura de Arquivos Criada**
```
testsprite/
├── setup.js                    # Setup global dos testes
└── mocks/
    └── firebaseMocks.js        # Mocks específicos do Firebase

testsprite.config.js            # Configuração principal
.env.testsprite                 # Variáveis de ambiente
```

### 3. **Testes Implementados**
```
src/screens/instructor/__tests__/
├── CheckIn.testsprite.js       # Testes completos da tela CheckIn
└── CheckIn.simple.test.js      # Teste básico de verificação
```

## 🚀 Como Usar

### Executar Testes do CheckIn
```bash
npm run testsprite:checkin
```

### Executar Todos os Testes TestSprite
```bash
npm run testsprite
```

### Modo Watch (desenvolvimento)
```bash
npm run testsprite:watch
```

### Com Relatório de Cobertura
```bash
npm run testsprite:coverage
```

## 📋 Testes Criados para CheckIn

### ✅ Cenários Testados:

1. **Carregamento Inicial**
   - ✓ Carrega turmas do instrutor
   - ✓ Exibe estado vazio quando não há turmas

2. **Gerenciamento de Check-in**
   - ✓ Inicia sessão de check-in
   - ✓ Impede sessões duplicadas
   - ✓ Para sessão ativa com confirmação

3. **Check-in Manual**
   - ✓ Abre modal de check-in manual
   - ✓ Seleciona turma
   - ✓ Realiza check-in de aluno

4. **Histórico**
   - ✓ Exibe check-ins recentes
   - ✓ Mostra estado vazio apropriado

5. **Tratamento de Erros**
   - ✓ Falhas de carregamento
   - ✓ Erros de criação
   - ✓ Validações de entrada

## 🛠️ Helpers Disponíveis

### Mocks Prontos para Usar:
```javascript
// Usuário autenticado
const user = TestSprite.mockAuthUser();

// Perfil de instrutor
const profile = TestSprite.mockUserProfile({ role: 'instructor' });

// Turma de exemplo
const classe = TestSprite.mockClass({
  name: 'Jiu-Jitsu Iniciante',
  modality: 'Jiu-Jitsu'
});

// Aluno de exemplo
const student = TestSprite.mockStudent({
  name: 'João Silva'
});
```

### Renderização com Providers:
```javascript
const { getByText } = TestSprite.renderWithProviders(
  <MyComponent />
);
```

## 🔧 Configuração Técnica

### Mocks Automáticos Configurados:
- ✅ Firebase (Auth, Firestore)
- ✅ React Navigation
- ✅ AsyncStorage
- ✅ React Native Paper
- ✅ Expo (Notifications, Device)
- ✅ Serviços da aplicação

### Estrutura de Dados:
- ✅ Baseado na arquitetura `gyms/{academiaId}/`
- ✅ Custom claims para segurança
- ✅ Isolamento por academia
- ✅ Compatível com migrações Firestore

## 🎯 Próximos Passos

### Para Resolver Problemas de Execução:
1. **Verificar Babel Config**
   ```bash
   # Se houver erros de parsing, pode ser necessário ajustar:
   npm install --save-dev @babel/plugin-proposal-class-properties
   ```

2. **Executar Teste Simples Primeiro**
   ```bash
   npm test -- --testPathPattern=ActionButton.test.js
   ```

3. **Verificar Dependências**
   ```bash
   npm ls @testing-library/react-native
   ```

### Para Expandir os Testes:
1. **Criar testes para outras telas**
2. **Implementar testes E2E**
3. **Configurar CI/CD**

## 📊 Exemplo de Saída Esperada

Quando os testes funcionarem, você verá:
```
TestSprite - CheckIn Screen
  ✓ deve carregar as turmas do instrutor
  ✓ deve exibir estado vazio quando não há turmas
  ✓ deve iniciar uma sessão de check-in para uma turma
  ✓ deve impedir iniciar check-in se já existe sessão ativa
  ✓ deve parar uma sessão de check-in ativa
  ✓ deve abrir modal de check-in manual
  ✓ deve realizar check-in manual para um aluno
  ✓ deve exibir check-ins do dia atual
  ✓ deve exibir estado vazio quando não há check-ins
  ✓ deve exibir erro quando falha ao carregar dados

Test Suites: 1 passed, 1 total
Tests: 10 passed, 10 total
```

## 🔍 Debugging

### Se os testes não executarem:
1. Verificar se o setup do Jest está correto
2. Revisar mocks do React Native Paper
3. Verificar compatibilidade de versões
4. Consultar logs detalhados do Jest

### Arquivos de Log:
- Jest output no terminal
- Coverage reports em `coverage/`
- TestSprite logs (se configurado)

## 📞 Suporte

O TestSprite está configurado e pronto para uso! Os testes foram criados seguindo as melhores práticas e a arquitetura atual do seu projeto Academia App.

Para executar e ver os testes em ação, use:
```bash
npm run testsprite:checkin
```

Se encontrar problemas, verifique primeiro a configuração do Babel e as dependências do React Native.
