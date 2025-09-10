# ✅ Checklist de Internacionalização - Academia App

## 📋 Status Geral
- ✅ **Sistema i18n implementado** - `src/utils/i18n.js`
- ✅ **Funções de formatação** - Data, moeda, números, porcentagem
- ✅ **Navigation títulos** - AppNavigator.js convertido
- ⚠️  **Strings hardcoded** - Ainda existem muitas em várias telas

---

## 🎯 Pendências por Categoria

### 🚨 **CRÍTICO - Alerts e Mensagens de Sistema**

#### ❌ **Alert.alert() Hardcoded**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `Alert.alert('Info', 'Funcionalidade disponível apenas para administradores')`
  - `Alert.alert('Erro', 'Não foi possível carregar as turmas.')`

- [ ] `src/screens/instructor/InstructorStudents.js`
  - `Alert.alert('Info', 'Funcionalidade disponível apenas para administradores')`

- [ ] `src/screens/admin/AddClassScreen.js`
  - `Alert.alert('Erro de Navegação', 'Não foi possível acessar...')`
  - `Alert.alert('Erro ao Criar Turma', 'Não foi possível criar...')`

- [ ] `src/screens/admin/AddStudentScreen.js`
  - `Alert.alert('Erro ao Cadastrar Aluno', 'Não foi possível cadastrar...')`
  - `Alert.alert('Sucesso!', 'Aluno foi cadastrado com sucesso!')`

#### ❌ **Snackbar Messages**
- [ ] `src/screens/admin/AddClassScreen.js`
  - `'Turma criada com sucesso!'`
  - `'Erro ao criar turma. Tente novamente.'`

---

### 📱 **UI Components - Formulários**

#### ❌ **Labels de Campos**
- [ ] `src/screens/admin/AddClassScreen.js`
  - `'Nome da Turma'`, `'Descrição'`, `'Máximo de Alunos'`
  - `'Horário'`, `'Preço'`, `'Instrutor'`

- [ ] `src/screens/admin/AddStudentScreen.js`
  - `'Nome Completo'`, `'Email'`, `'Telefone'`
  - `'Data de Nascimento'`, `'Endereço'`
  - `'Contato de Emergência'`, `'Telefone de Emergência'`
  - `'Condições Médicas'`, `'Objetivos'`

#### ❌ **Placeholders**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'Buscar turmas...'`
  
- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Buscar alunos...'`

#### ❌ **Helper Text e Validações**
- [ ] `src/screens/admin/AddClassScreen.js`
  - `'Nome da turma é obrigatório'`
  - `'Modalidade é obrigatória'`
  - `'Número máximo de alunos deve ser um número positivo'`
  - `'Instrutor é obrigatório'`
  - `'Horário é obrigatório'`
  - `'Preço deve ser um número válido'`
  - `'Categoria de idade é obrigatória'`

- [ ] `src/screens/admin/AddStudentScreen.js`
  - `'Nome é obrigatório'`
  - `'Email é obrigatório'`
  - `'Email inválido'`
  - `'Telefone é obrigatório'`
  - `'Data de nascimento é obrigatória'`
  - `'Contato de emergência é obrigatório'`
  - `'Telefone de emergência é obrigatório'`

---

### 🏷️ **Chips e Status**

#### ❌ **Status de Turmas**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'Ativa'`, `'Inativa'`

#### ❌ **Categorias de Idade**
- [ ] `src/screens/admin/AddClassScreen.js`
  - `'Kids 1 (4-6 anos)'`, `'Kids 2 (7-9 anos)'`, `'Kids 3 (10-13 anos)'`
  - `'Juvenil (14-17 anos)'`, `'Adulto (18+ anos)'`

#### ❌ **Status de Pagamento**
- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Pago'`, `'Pendente'`, `'Em Atraso'`

---

### 🔘 **Botões e Ações**

#### ❌ **Botões de Formulário**
- [ ] `src/screens/admin/AddClassScreen.js`
  - `'Criar Turma'`, `'Cancelar'`

- [ ] `src/screens/admin/AddStudentScreen.js`
  - `'Cadastrar Aluno'`, `'Cancelar'`

#### ❌ **FAB Labels**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'Nova Turma'`

- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Novo Aluno'`

#### ❌ **Card Actions**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'Detalhes'`, `'Check-ins'`

---

### 📋 **Filtros e Menus**

#### ❌ **Filtros de Status**
- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Todos'`, `'Ativos'`, `'Inativos'`
  - `'Pagamento Pendente'`

#### ❌ **Filtros de Gênero**
- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Todos os sexos'`, `'Masculino'`, `'Feminino'`

#### ❌ **Filtros de Modalidade**
- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Todas modalidades'`, `'Modalidade'`

---

### 📄 **Textos de Interface**

#### ❌ **Empty States**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'Nenhuma turma encontrada'`
  - `'Nenhuma turma cadastrada'`
  - `'Entre em contato com o administrador para criar turmas'`

- [ ] `src/screens/instructor/InstructorStudents.js`
  - `'Nenhum aluno encontrado'`
  - `'Nenhum aluno cadastrado'`

#### ❌ **Loading States**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'Carregando turmas...'`

#### ❌ **Info Items**
- [ ] `src/screens/instructor/InstructorClasses.js`
  - `'alunos'` (ex: "5/20 alunos")
  - `'Horário não definido'`

---

### 🏗️ **Títulos de Seções**

#### ❌ **Títulos de Formulário**
- [ ] `src/screens/admin/AddClassScreen.js`
  - `'Nova Turma'`, `'Informações da Turma'`
  - `'Configurações'`, `'Categoria de Idade'`

- [ ] `src/screens/admin/AddStudentScreen.js`
  - `'Novo Aluno'`, `'Dados Pessoais'`
  - `'Informações de Contato'`, `'Informações Médicas'`

---

## 🎯 **Prioridades de Implementação**

### 🚨 **ALTA PRIORIDADE**
1. **Alerts e mensagens de erro/sucesso** - Crítico para UX
2. **Labels de formulários** - Essencial para usabilidade
3. **Validações de campos** - Importante para feedback

### ⚡ **MÉDIA PRIORIDADE**
4. **Botões e ações** - Melhora experiência
5. **Status e chips** - Consistência visual
6. **Filtros e menus** - Funcionalidade avançada

### 📝 **BAIXA PRIORIDADE**
7. **Empty states** - Polimento final
8. **Loading states** - Detalhes de UX
9. **Títulos de seção** - Organização visual

---

## 🔧 **Como Implementar**

### 1️⃣ **Adicionar novas chaves ao i18n.js**
```javascript
// Exemplo para alerts
alerts: {
  adminOnlyFeature: 'Funcionalidade disponível apenas para administradores',
  classLoadError: 'Não foi possível carregar as turmas.',
  classCreated: 'Turma criada com sucesso!',
  studentCreated: 'Aluno foi cadastrado com sucesso!'
}
```

### 2️⃣ **Substituir strings hardcoded**
```javascript
// ❌ Antes
Alert.alert('Erro', 'Não foi possível carregar as turmas.');

// ✅ Depois  
Alert.alert(getString('error'), getString('alerts.classLoadError'));
```

### 3️⃣ **Aplicar nas props de componentes**
```javascript
// ❌ Antes
<TextInput label="Nome Completo" />

// ✅ Depois
<TextInput label={getString('forms.fullName')} />
```

---

## 📊 **Estimativa de Trabalho**

- **Total de strings identificadas**: ~80-100
- **Arquivos a modificar**: 15-20 arquivos
- **Tempo estimado**: 4-6 horas
- **Testes necessários**: Todas as telas de instrutor e admin

---

## ✅ **Critérios de Conclusão**

- [ ] Nenhum Alert.alert() com strings hardcoded
- [ ] Todos os labels de formulário usando getString()
- [ ] Todas as mensagens de validação internacionalizadas
- [ ] Todos os botões e ações traduzidos
- [ ] Empty states e loading states com i18n
- [ ] Teste completo em português/inglês
- [ ] Documentação atualizada

---

*Última atualização: 10 de setembro de 2025*