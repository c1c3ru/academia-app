# 📊 Análise Completa da Aplicação Academia App

## 🏗️ Arquitetura Geral

### Estrutura do Projeto
```
academia-app/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Contextos React (Auth, Theme, Notification)
│   ├── hooks/           # Hooks customizados
│   ├── navigation/      # Navegação por perfil
│   ├── screens/         # Telas organizadas por perfil
│   ├── services/        # Serviços (Firebase, APIs)
│   └── utils/           # Utilitários
├── functions/           # Cloud Functions
└── firestore.rules     # Regras de segurança
```

## 🔐 Sistema de Autenticação e Autorização

### Fluxo de Autenticação
```mermaid
graph TD
    A[Login] --> B{Usuário Existe?}
    B -->|Não| C[Registro]
    B -->|Sim| D[Verificar Custom Claims]
    C --> E[Criar Perfil]
    E --> F[Aguardar Convite/Associação]
    D --> G{Tem Academia?}
    G -->|Não| H[Seleção de Academia]
    G -->|Sim| I[Dashboard por Perfil]
    H --> J[Buscar por Código]
    H --> K[Criar Nova Academia]
    J --> L[Associar à Academia]
    K --> M[Inicializar Subcoleções]
    L --> I
    M --> I
```

### Perfis de Usuário
- **Admin**: Controle total da academia
- **Instrutor**: Gerenciamento de aulas e alunos
- **Aluno**: Visualização de dados pessoais e pagamentos

## 🏢 Estrutura de Dados (Firestore)

### Coleções Principais
```
gyms/{academiaId}/
├── students/           # Alunos
├── instructors/        # Instrutores
├── classes/            # Turmas
├── modalities/         # Modalidades
├── plans/              # Planos de pagamento
├── payments/           # Pagamentos
├── announcements/      # Avisos
├── invites/            # Convites
├── graduations/        # Graduações
├── evaluations/        # Avaliações físicas
├── injuries/           # Lesões
├── checkins/           # Check-ins
└── notifications/      # Notificações
```

## 📱 Funcionalidades por Perfil

### 👑 ADMIN - Funcionalidades

#### Dashboard Admin
```mermaid
graph LR
    A[Dashboard] --> B[Estatísticas Gerais]
    A --> C[Alunos Ativos]
    A --> D[Receita Mensal]
    A --> E[Avisos Recentes]
    A --> F[Ações Rápidas]
```

#### Gestão de Alunos
```mermaid
graph TD
    A[Gestão de Alunos] --> B[Listar Alunos]
    A --> C[Adicionar Aluno]
    A --> D[Editar Aluno]
    A --> E[Desassociar Aluno]
    B --> F[Filtros por Modalidade]
    B --> G[Status Ativo/Inativo]
    C --> H[Dados Pessoais]
    C --> I[Modalidades]
    C --> J[Plano de Pagamento]
```

#### Gestão de Turmas
```mermaid
graph TD
    A[Gestão de Turmas] --> B[Listar Turmas]
    A --> C[Criar Turma]
    A --> D[Editar Turma]
    A --> E[Gerenciar Alunos da Turma]
    C --> F[Nome e Modalidade]
    C --> G[Instrutor]
    C --> H[Horários]
    C --> I[Capacidade]
```

#### Gestão de Modalidades
```mermaid
graph TD
    A[Modalidades] --> B[Listar Modalidades]
    A --> C[Criar Modalidade]
    A --> D[Editar Modalidade]
    A --> E[Gerenciar Graduações]
    C --> F[Nome e Descrição]
    C --> G[Preço Mensal]
    C --> H[Níveis de Graduação]
```

#### Sistema de Convites
```mermaid
graph TD
    A[Convites] --> B[Criar Convite]
    A --> C[Listar Convites]
    A --> D[Gerenciar Status]
    B --> E[Email do Convidado]
    B --> F[Tipo: Instrutor/Aluno]
    B --> G[Gerar Token]
    C --> H[Pendentes]
    C --> I[Aceitos]
    C --> J[Expirados]
```

### 👨‍🏫 INSTRUTOR - Funcionalidades

#### Dashboard Instrutor
```mermaid
graph LR
    A[Dashboard] --> B[Minhas Turmas]
    A --> C[Alunos Ativos]
    A --> D[Próximas Aulas]
    A --> E[Graduações Pendentes]
```

#### Gestão de Aulas
```mermaid
graph TD
    A[Minhas Aulas] --> B[Aulas de Hoje]
    A --> C[Histórico]
    A --> D[Criar Nova Aula]
    B --> E[Check-in de Alunos]
    B --> F[Marcar Presença]
    D --> G[Selecionar Turma]
    D --> H[Data e Horário]
```

#### Gestão de Alunos
```mermaid
graph TD
    A[Meus Alunos] --> B[Por Turma]
    A --> C[Todos os Alunos]
    A --> D[Avaliações Físicas]
    A --> E[Graduações]
    D --> F[Criar Avaliação]
    D --> G[Histórico]
    E --> H[Promover Aluno]
    E --> I[Gerar Certificado]
```

### 👨‍🎓 ALUNO - Funcionalidades

#### Dashboard Aluno
```mermaid
graph LR
    A[Dashboard] --> B[Próximas Aulas]
    A --> C[Graduação Atual]
    A --> D[Pagamentos]
    A --> E[Evolução]
```

#### Check-in
```mermaid
graph TD
    A[Check-in] --> B[Verificar Localização]
    A --> C[Selecionar Aula]
    B --> D{Dentro da Academia?}
    D -->|Sim| E[Confirmar Check-in]
    D -->|Não| F[Erro de Localização]
```

#### Pagamentos
```mermaid
graph TD
    A[Pagamentos] --> B[Histórico]
    A --> C[Pendentes]
    A --> D[Realizar Pagamento]
    D --> E[PIX]
    D --> F[Cartão]
    D --> G[Dinheiro]
```

#### Evolução
```mermaid
graph TD
    A[Evolução] --> B[Graduações]
    A --> C[Avaliações Físicas]
    A --> D[Frequência]
    B --> E[Histórico de Graduações]
    B --> F[Próxima Graduação]
    C --> G[Medidas Corporais]
    C --> H[Progresso]
```

## 🔄 Fluxos Principais

### 1. Fluxo de Criação de Academia
```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Firebase
    participant S as Sistema
    
    A->>F: Criar Academia
    F->>S: Gerar ID único
    S->>F: Inicializar Subcoleções
    F->>F: Criar modalidades padrão
    F->>F: Criar planos padrão
    F->>F: Criar avisos padrão
    F->>A: Academia criada
```

### 2. Fluxo de Convite e Associação
```mermaid
sequenceDiagram
    participant A as Admin
    participant S as Sistema
    participant U as Usuário
    participant E as Email
    
    A->>S: Criar convite
    S->>E: Enviar email com token
    U->>S: Acessar link do convite
    S->>U: Validar token
    U->>S: Aceitar convite
    S->>S: Associar à academia
    S->>U: Acesso liberado
```

### 3. Fluxo de Check-in
```mermaid
sequenceDiagram
    participant A as Aluno
    participant G as GPS
    participant S as Sistema
    participant I as Instrutor
    
    A->>G: Solicitar localização
    G->>A: Coordenadas
    A->>S: Tentar check-in
    S->>S: Validar localização
    S->>S: Registrar presença
    S->>I: Notificar instrutor
```

### 4. Fluxo de Pagamento
```mermaid
sequenceDiagram
    participant A as Aluno
    participant S as Sistema
    participant P as Gateway Pagamento
    participant Ad as Admin
    
    A->>S: Selecionar pagamento
    S->>P: Processar pagamento
    P->>S: Confirmar transação
    S->>S: Atualizar status
    S->>Ad: Notificar recebimento
```

## 🛡️ Segurança (Firestore Rules)

### Estrutura de Segurança
```javascript
// Custom Claims utilizados
{
  role: 'admin' | 'instructor' | 'student',
  academiaId: 'gym_id',
  superAdmin: true // para admins da plataforma
}
```

### Níveis de Acesso
- **SuperAdmin**: Acesso a todas as academias
- **Admin**: Acesso total à sua academia
- **Instrutor**: Acesso às suas turmas e alunos
- **Aluno**: Acesso apenas aos seus dados

## 📊 Métricas e Relatórios

### Relatórios Admin
- Receita mensal/anual
- Frequência de alunos
- Modalidades mais populares
- Taxa de retenção
- Pagamentos em atraso

### Relatórios Instrutor
- Frequência por turma
- Evolução dos alunos
- Graduações realizadas
- Avaliações físicas

## 🔧 Serviços e Integrações

### Serviços Implementados
- **Firebase Auth**: Autenticação
- **Firestore**: Banco de dados
- **Firebase Functions**: Lógica backend
- **Expo Notifications**: Notificações push
- **Geolocation**: Check-in por localização

### APIs Externas
- Gateway de pagamento (PIX/Cartão)
- Serviço de email (convites)
- Maps API (localização)

## 🚀 Funcionalidades Avançadas

### 1. Sistema de Graduações
- Níveis por modalidade
- Certificados digitais
- Histórico completo
- Validação por instrutor

### 2. Avaliações Físicas
- Medidas corporais
- Acompanhamento de progresso
- Gráficos de evolução
- Relatórios personalizados

### 3. Sistema de Lesões
- Registro de lesões
- Acompanhamento médico
- Restrições de atividades
- Histórico completo

### 4. Notificações Inteligentes
- Lembretes de aula
- Pagamentos vencendo
- Graduações disponíveis
- Avisos da academia

## 📱 Compatibilidade

### Plataformas Suportadas
- **Web**: React Native Web
- **Mobile**: iOS e Android (Expo)
- **Responsivo**: Adaptável a diferentes telas

### Tecnologias Utilizadas
- React Native + Expo
- Firebase (Auth, Firestore, Functions)
- React Navigation
- React Native Paper (UI)
- Context API (Estado global)

## 🔄 Fluxo de Dados

### Estado Global (Contexts)
- **AuthContext**: Usuário, perfil, academia
- **ThemeContext**: Tema, idioma
- **NotificationContext**: Notificações

### Sincronização
- Real-time com Firestore
- Offline-first (cache local)
- Sincronização automática

## 📈 Escalabilidade

### Arquitetura Preparada Para:
- Múltiplas academias
- Milhares de usuários
- Crescimento horizontal
- Novas funcionalidades

### Performance
- Lazy loading de telas
- Paginação de dados
- Cache inteligente
- Otimização de queries
