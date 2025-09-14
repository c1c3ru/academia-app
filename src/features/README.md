# Features Architecture

Esta pasta implementa a **Clean Architecture** organizando o código por **features** (funcionalidades) em vez de por tipo de arquivo.

## 🏗️ Estrutura

```
src/features/
├── auth/           # Autenticação e autorização
├── students/       # Funcionalidades dos alunos
├── instructors/    # Funcionalidades dos instrutores
├── admin/          # Funcionalidades administrativas
└── shared/         # Componentes e utilitários compartilhados
```

## 📁 Anatomia de uma Feature

Cada feature segue a mesma estrutura padronizada:

```
feature/
├── index.js              # Exportações centralizadas
├── screens/              # Telas da feature
├── components/           # Componentes específicos
├── services/             # Lógica de negócio
├── hooks/                # Hooks customizados
├── stores/               # Estado local (Zustand)
├── types/                # TypeScript types
└── __tests__/            # Testes da feature
```

## 🎯 Benefícios

### **1. Separação de Responsabilidades**
- Cada feature é independente
- Fácil de encontrar código relacionado
- Reduz acoplamento entre módulos

### **2. Escalabilidade**
- Adicionar novas features é simples
- Times podem trabalhar em features diferentes
- Facilita code splitting

### **3. Manutenibilidade**
- Mudanças ficam isoladas na feature
- Testes organizados por funcionalidade
- Refatoração mais segura

### **4. Reutilização**
- Componentes compartilhados em `/shared`
- Services podem ser reutilizados
- Hooks customizados centralizados

## 📋 Convenções

### **Nomenclatura**
- Features: `camelCase` (auth, students)
- Componentes: `PascalCase` (StudentCard)
- Services: `camelCase` (studentService)
- Hooks: `use` prefix (useStudentData)

### **Exportações**
Cada feature deve ter um `index.js` que exporta todos os elementos públicos:

```javascript
// features/students/index.js
export { default as StudentDashboard } from './screens/StudentDashboard';
export { default as studentService } from './services/studentService';
export { useStudentData } from './hooks/useStudentData';
```

### **Imports**
Use imports relativos dentro da feature e absolutos entre features:

```javascript
// Dentro da feature
import StudentCard from '../components/StudentCard';

// Entre features
import { authService } from '../../auth';
import { OptimizedImage } from '../../shared';
```

## 🔄 Migração Gradual

A migração está sendo feita gradualmente:

1. ✅ **Estrutura criada** - Pastas e index.js
2. 🔄 **Movendo componentes** - Gradualmente por feature
3. ⏳ **Atualizando imports** - Conforme componentes são movidos
4. ⏳ **Testes** - Adicionando testes por feature

## 🚀 Próximos Passos

1. **Mover screens existentes** para as features apropriadas
2. **Extrair components** específicos de cada feature
3. **Criar services** dedicados por feature
4. **Implementar hooks** customizados
5. **Adicionar testes** unitários e de integração

## 📖 Exemplos de Uso

### Importando de uma feature:
```javascript
import { 
  StudentDashboard, 
  studentService, 
  useStudentData 
} from '../features/students';
```

### Usando componentes compartilhados:
```javascript
import { 
  OptimizedImage, 
  UniversalHeader, 
  usePerformanceMonitor 
} from '../shared';
```

Esta arquitetura prepara o projeto para crescimento sustentável e facilita a manutenção a longo prazo.
