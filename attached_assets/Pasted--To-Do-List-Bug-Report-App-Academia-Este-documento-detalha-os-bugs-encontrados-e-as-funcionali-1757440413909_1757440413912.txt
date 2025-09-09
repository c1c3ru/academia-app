# To-Do List & Bug Report - App Academia

Este documento detalha os bugs encontrados e as funcionalidades a serem implementadas/melhoradas no aplicativo.

 faça as correções e adiçõe necessárias mas mantenha as compatibilidades para o bom funcionamento do aplicativo
---

## 🐞 Bugs e Erros a Corrigir

### 1. Erro de Índice no Firestore (Comum a Todos os Perfis)

-   **Descrição:** Ocorre um erro ao tentar buscar notificações para qualquer tipo de usuário (aluno, instrutor, administrador) logo após o login. O Firestore exige a criação de um índice composto para a consulta.
-   **Mensagem de Erro:** `FirebaseError: The query requires an index. You can create it here:`
-   **Solução:** Criar o índice composto no console do Firebase usando o link fornecido no log de erro.
-   **Log de Erro (Exemplo):**
    ```
    Erro ao buscar documentos em academias/j61WtHsQLtiuUZGGSmkH/notifications: FirebaseError: The query requires an index. You can create it here: [https://console.firebase.google.com/v1/r/project/academia-app-5cf79/firestore/indexes?create_composite=Clhwcm9qZWN0cy9hY2FkZW1pYS1hcHAtNWNmNzkvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGlmaWNhdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg](https://console.firebase.google.com/v1/r/project/academia-app-5cf79/firestore/indexes?create_composite=Clhwcm9qZWN0cy9hY2FkZW1pYS1hcHAtNWNmNzkvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGlmaWNhdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)
    ```

### 2. Erro de Permissão no Firestore (Perfil Instrutor)

-   **Descrição:** O perfil de instrutor está enfrentando múltiplos erros de `Missing or insufficient permissions` ao tentar acessar dados de diferentes coleções. Isso impede o carregamento do dashboard, da lista de turmas e dos alunos.
-   **Mensagem de Erro:** `FirebaseError: Missing or insufficient permissions.`
-   **Locais do Erro:**
    -   `firestoreService.js:51`: Ao buscar documentos em `users` com `array-contains-any`.
    -   `firestoreService.js:110`: Ao buscar documentos filtrados em `users`.
    -   `InstructorDashboard.js:87`: Ao carregar os dados do dashboard do professor.
    -   `InstructorClasses.js:55`: Ao carregar as turmas do instrutor.
    -   `InstructorStudents.js:66`: Ao carregar os alunos associados ao instrutor.
-   **Solução:** Revisar e corrigir as regras de segurança (Security Rules) do Firestore para garantir que instrutores autenticados tenham permissão de leitura nas coleções `users` e outras coleções necessárias.

---

## ✨ Melhorias Gerais e Tela de Login

-   [ ] **Seleção de Idiomas:** Adicionar um campo de seleção de idiomas na tela de login.
    -   **Observação:** É necessário implementar um sistema de internacionalização (i18n) para traduzir todos os textos da UI com base na seleção do usuário.
-   [ ] **Tema Escuro (Dark Mode):** Adicionar uma opção para o usuário selecionar o tema escuro na tela de login, que deve ser aplicado imediatamente após o login.
-   [ ] **Logins Sociais:** Implementar botões de login social para **Google, Facebook, Apple e Microsoft**.

---

## 🛠️ Painel do Administrador

### Aba de Configurações
-   [ ] **Correção na Exclusão:** Corrigir a funcionalidade de exclusão que não está funcionando para **modalidades, avisos e planos**.
-   [ ] **Feedback Visual:** Adicionar feedback visual (ex: modal de confirmação, toast de sucesso/erro) para todas as ações de exclusão.

### Aba Gerenciar Turmas
-   [ ] **Feedback Visual:** Adicionar feedback visual para confirmação e exclusão de turmas.
-   [ ] **UI Pós-Exclusão:** A turma excluída não deve mais ser exibida na lista imediatamente após a ação.
-   [ ] **Melhorar UI de Ações:** Na coluna "Ações" (dentro de "Alunos"), os botões/elementos precisam ser redesenhados para não ficarem desproporcionais.
-   [ ] **Exibição de Dados:** Garantir que a lista de alunos da turma e os horários cadastrados sejam exibidos corretamente.
-   [ ] **Remover Elementos Redundantes:**
    -   Existem duas opções para "mostrar detalhes da turma"; manter apenas uma.
    -   Remover o elemento no topo do card da turma que não possui função.
-   [ ] **Turmas por Idade/Nível:** Adicionar a opção de criar turmas com diferenciação por níveis de idade:
    -   Kids 1 (4-6 anos)
    -   Kids 2 (7-9 anos)
    -   Kids 3 (10-13 anos)
    -   Juvenil (16-17 anos)
    -   Adulto (18+ anos)

### Aba Gerenciar Alunos
-   [ ] **Pagamentos:** No botão "Pagamentos", exibir as informações do plano atual do aluno e permitir o cadastro de novas formas de pagamento.
-   [ ] **Botão Editar:** Corrigir o erro no botão "Editar".
-   [ ] **Perfil do Aluno (Visão do Admin):** Exibir as turmas em que o aluno está matriculado e seu histórico de pagamentos real.
-   [ ] **Opção de Excluir:** Além de "Desassociar Aluno", adicionar a funcionalidade de **excluir permanentemente** um aluno.
-   [ ] **Melhorar UI de Ações:** Aplicar as mesmas melhorias de UI da tela de turmas para os botões de ação.

---

## ⚙️ Funcionalidades Gerais

### Perfis (Todos os Usuários)
-   [ ] **Alterar Senha:** Implementar a funcionalidade de alterar a senha.
-   [ ] **Notificações e Privacidade:** Ativar e implementar as telas de configurações de notificações e privacidade.
-   [ ] **Política de Privacidade:** Na seção de privacidade, em vez de "Configurações", deve ser exibida a Política de Privacidade do app, em conformidade com a LGPD.

### Convites
-   [ ] **Email de Convite:** Corrigir o sistema de convite por email. Utilizar a API do Gmail/Google para enviar os convites a partir da conta de email cadastrada do administrador.

---

## 🧑‍🎓 Perfil e Painel do Aluno

### Tela de Perfil
-   [ ] **Plano Atual:** Exibir o plano atual do aluno (cadastrado pelo admin) e permitir que seja editável.
-   [ ] **Data de Início:** Permitir que a data de início seja editável.
-   [ ] **Detalhes do Contrato:** Ao clicar no card "Contratos", exibir os detalhes do contrato cadastrado.
-   [ ] **Avaliações Físicas:**
    -   Exibir campos para: peso, altura e idade.
    -   Calcular e mostrar o IMC (Índice de Massa Corporal) automaticamente.
    -   Adicionar campos para informações de bioimpedância.
-   [ ] **Minhas Lesões:** Criar uma seção para o aluno registrar lesões atuais ou passadas, incluindo o tempo de recuperação.

### Tela de Pagamentos
-   [ ] **Seleção de Plano:** Permitir que o aluno escolha um dos planos previamente cadastrados pelo administrador.
-   [ ] **Editar Vencimento:** Permitir que o aluno edite a data de vencimento.
-   [ ] **Remover Texto:** Remover o texto de multa e juros: "• Após o vencimento, será cobrada multa de 2% + juros de 1% ao mês".
-   [ ] **Botão de Contato:** O botão deve abrir uma conversa no WhatsApp com o número de contato do administrador da academia.

### Graduação
-   [ ] **Cálculo da Próxima Graduação:** O sistema deve calcular e exibir a data da próxima graduação do aluno, com base nas regras de cada modalidade e na data de início/última graduação.

---

## 👨‍🏫 Painel do Instrutor

### Dashboard
-   [ ] **Alterar Texto:** Renomear "Graduações Recentes" para "Data das Graduações".
-   [ ] **Link "Ver Todas":** Ao clicar em "Ver todas as graduações", exibir uma lista dos alunos (associados ao instrutor) com suas respectivas datas de graduação.

### Aba Minhas Turmas
-   [ ] **Turmas por Idade/Nível:** Implementar a mesma funcionalidade de criação de turmas por faixa etária do painel do administrador (Kids, Juvenil, Adulto). Limitar a um máximo de 5 turmas por instrutor.

### Aba Meus Alunos
-   [ ] **Adicionar Aluno:** Permitir que o instrutor adicione um aluno à sua lista somente se este aluno já estiver cadastrado na mesma academia que o instrutor.