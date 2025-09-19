# TestSprite - Guia de Testes para Academia App

## 📋 Visão Geral

O TestSprite foi configurado para o projeto Academia App, fornecendo uma estrutura robusta de testes para React Native com Expo. Esta configuração inclui mocks automáticos, helpers personalizados e integração com Firebase.

## 🚀 Configuração Realizada

### 1. Instalação do TestSprite
```bash
npm install --save-dev @testsprite/testsprite-mcp
```

### 2. Arquivos de Configuração

#### `testsprite.config.js`
- Configuração principal do TestSprite
- Integração com Jest e React Native
- Mocks automáticos para Firebase, AsyncStorage e Navigation
- Configurações de cobertura de código

#### `.env.testsprite`
- Variáveis de ambiente específicas para testes
- API Key do TestSprite
- Configurações de mock

#### `testsprite/setup.js`
- Setup global para todos os testes
- Mocks automáticos dos principais serviços
- Helpers personalizados (TestSprite.*)

#### `testsprite/mocks/firebaseMocks.js`
- Mocks específicos para serviços Firebase
- Geradores de dados de teste
- Funções de reset e configuração

## 📝 Scripts Disponíveis

```json
{
  "testsprite": "jest --config=testsprite.config.js",
  "testsprite:watch": "jest --config=testsprite.config.js --watch",
  "testsprite:coverage": "jest --config=testsprite.config.js --coverage",
  "testsprite:checkin": "jest --config=testsprite.config.js --testPathPattern=CheckIn.testsprite.js"
}
```

## 🧪 Estrutura de Testes

### Convenção de Nomenclatura
- Arquivos de teste: `*.testsprite.js`
- Localização: `src/**/__tests__/`
- Mocks: `testsprite/mocks/`

### Exemplo de Teste Criado
`src/screens/instructor/__tests__/CheckIn.testsprite.js`

## 🛠️ Helpers Disponíveis

### TestSprite.mockAuthUser()
```javascript
const user = TestSprite.mockAuthUser({
  uid: 'custom-id',
  email: 'custom@email.com'
});
```

### TestSprite.mockUserProfile()
```javascript
const profile = TestSprite.mockUserProfile({
  role: 'instructor',
  academiaId: 'academia-123'
});
```

### TestSprite.mockClass()
```javascript
const classe = TestSprite.mockClass({
  name: 'Jiu-Jitsu Avançado',
  modality: 'Jiu-Jitsu'
});
```

### TestSprite.renderWithProviders()
```javascript
const { getByText } = TestSprite.renderWithProviders(
  <MyComponent />
);
```

## 🔧 Mocks Automáticos

### Firebase
- `firebase/app`
- `firebase/auth`
- `firebase/firestore`

### React Native
- `@react-native-async-storage/async-storage`
- `@react-navigation/native`
- `react-native-paper`
- `expo-notifications`
- `expo-device`

### Serviços da Aplicação
- `academyFirestoreService`
- `academyClassService`
- `authService`
- `notificationService`

## 📊 Cobertura de Código

### Configuração Atual
- Branches: 75%
- Functions: 75%
- Lines: 75%
- Statements: 75%

### Relatórios
- Console: Padrão do Jest
- Arquivos: `coverage/` (quando executado com `--coverage`)

## 🎯 Testes Implementados para CheckIn

### Cenários Cobertos
1. **Carregamento Inicial**
   - Carregamento de turmas do instrutor
   - Estado vazio quando não há turmas

2. **Iniciar Check-in**
   - Criação de sessão de check-in
   - Prevenção de sessões duplicadas

3. **Parar Check-in**
   - Finalização de sessão ativa
   - Confirmação do usuário

4. **Check-in Manual**
   - Abertura do modal
   - Seleção de turma
   - Check-in de aluno

5. **Check-ins Recentes**
   - Exibição de check-ins do dia
   - Estado vazio

6. **Tratamento de Erros**
   - Falhas de rede
   - Erros de criação
   - Validações

## 🚨 Problemas Conhecidos

### 1. Configuração do Babel
- Alguns mocks podem precisar de ajustes
- Transformações específicas do React Native

### 2. Dependências
- Conflitos entre versões do AsyncStorage
- Compatibilidade com Expo

## 🔄 Como Executar

### Todos os Testes TestSprite
```bash
npm run testsprite
```

### Modo Watch
```bash
npm run testsprite:watch
```

### Com Cobertura
```bash
npm run testsprite:coverage
```

### Teste Específico (CheckIn)
```bash
npm run testsprite:checkin
```

## 📚 Próximos Passos

### 1. Corrigir Configuração
- Resolver problemas de parsing do Babel
- Ajustar mocks para React Native Paper

### 2. Expandir Testes
- Criar testes para outras telas
- Implementar testes E2E

### 3. Integração CI/CD
- Configurar pipeline de testes
- Relatórios automáticos

### 4. Documentação
- Guias específicos por componente
- Exemplos de mocks complexos

## 🔗 Recursos Úteis

### TestSprite MCP
- API Key configurada
- Integração com servidor MCP
- Comandos via `npx @testsprite/testsprite-mcp@latest`

### Arquitetura do Projeto
- Baseado nas memórias do projeto
- Estrutura de subcoleções Firestore
- Isolamento por academia (gyms/{academiaId})
- Custom claims para segurança

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs do Jest
2. Revisar configuração do Babel
3. Consultar documentação do TestSprite
4. Verificar compatibilidade de dependências

---

**Nota**: Esta configuração foi criada baseada na estrutura atual do projeto Academia App, considerando as migrações de Firestore, sistema de autenticação e arquitetura de componentes já implementados.
