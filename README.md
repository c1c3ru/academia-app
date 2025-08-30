# Academia App

Um aplicativo completo para gerenciamento de academias de artes marciais, desenvolvido com React Native e Expo.

## 📱 Funcionalidades

### Para Alunos
- ✅ Dashboard personalizado com próximas aulas e avisos
- ✅ Calendário de aulas com check-in
- ✅ Acompanhamento de pagamentos e histórico
- ✅ Evolução e graduações
- ✅ Perfil completo com informações pessoais

### Para Instrutores
- ✅ Dashboard com estatísticas das turmas
- ✅ Gerenciamento de alunos e turmas
- ✅ Controle de presenças e graduações
- ✅ Visualização de horários e calendário

### Para Administradores
- ✅ Dashboard administrativo completo
- ✅ Gerenciamento de alunos, instrutores e turmas
- ✅ Controle financeiro e pagamentos
- ✅ Gerenciamento de modalidades e planos
- ✅ Sistema de avisos e comunicação

### Funcionalidades Gerais
- ✅ Autenticação segura com Firebase
- ✅ Login com Google (configurável)
- ✅ Sistema de notificações
- ✅ Interface moderna com React Native Paper
- ✅ Validação completa de formulários
- ✅ Tratamento de erros com ErrorBoundary
- ✅ Responsivo para diferentes tamanhos de tela

## 🛠 Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **Firebase** - Backend as a Service
  - Authentication (autenticação)
  - Firestore (banco de dados)
  - Storage (armazenamento de arquivos)
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes de UI
- **Context API** - Gerenciamento de estado
- **React Native Calendars** - Componente de calendário

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Expo CLI (`npm install -g @expo/cli`)
- Conta no Firebase

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd academia-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication, Firestore e Storage
   - Baixe as credenciais e configure em `src/services/firebase.js`
   - Implemente as regras de segurança do arquivo `firestore.rules`

4. **Execute o projeto**
   ```bash
   expo start
   ```

## 🏗 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ErrorBoundary.js       # Tratamento de erros
│   ├── FormInput.js           # Input com validação
│   ├── FormSelect.js          # Seletor customizado
│   ├── LoadingButton.js       # Botão com loading
│   └── NotificationManager.js # Sistema de notificações
├── contexts/            # Contextos do React
│   └── AuthContext.js         # Contexto de autenticação
├── navigation/          # Configuração de navegação
│   └── AppNavigator.js        # Navegação principal
├── screens/             # Telas da aplicação
│   ├── admin/               # Telas do administrador
│   ├── auth/                # Telas de autenticação
│   ├── instructor/          # Telas do instrutor
│   ├── shared/              # Telas compartilhadas
│   └── student/             # Telas do aluno
├── services/            # Serviços externos
│   ├── firebase.js          # Configuração Firebase
│   └── firestoreService.js  # Serviços Firestore
└── utils/               # Utilitários
    ├── constants.js         # Constantes da aplicação
    └── validation.js        # Validações e formatadores
```

## 🔧 Configuração Detalhada

### Firebase Setup
1. Substitua as credenciais em `src/services/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "sua-api-key",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto-id",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "sua-app-id"
   };
   ```

2. Configure as regras de segurança no Firestore usando o arquivo `firestore.rules`

### Tipos de Usuário
O sistema suporta três tipos de usuário:
- `student` - Aluno
- `instructor` - Instrutor/Professor
- `admin` - Administrador

## 📱 Deploy

Para instruções detalhadas de deploy, consulte o arquivo [DEPLOYMENT.md](./DEPLOYMENT.md).

### Deploy Rápido
```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios

# Ou usando EAS Build (recomendado)
eas build --platform all
```

## 📋 Funcionalidades Implementadas

- [x] Sistema de autenticação completo
- [x] Dashboard para todos os tipos de usuário
- [x] Gerenciamento de alunos e instrutores
- [x] Sistema de pagamentos
- [x] Calendário de aulas
- [x] Acompanhamento de evolução
- [x] Sistema de notificações
- [x] Validação de formulários
- [x] Tratamento de erros
- [x] Interface responsiva

## 🚀 Próximas Funcionalidades

- [ ] Sistema de check-in com geolocalização
- [ ] Notificações push
- [ ] Chat entre usuários
- [ ] Relatórios avançados
- [ ] Integração com pagamentos online
- [ ] Sistema de avaliações
- [ ] Backup automático de dados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação do [Expo](https://docs.expo.dev/)
2. Verifique os logs no [Firebase Console](https://console.firebase.google.com)
3. Abra uma issue neste repositório

## 👥 Autores

- Desenvolvido com ❤️ para academias de artes marciais

---

**Academia App** - Transformando o gerenciamento de academias com tecnologia moderna e interface intuitiva.
