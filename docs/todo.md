## Validação e Refinamento de Requisitos

- [x] Módulo 1: Autenticação e Perfis
  - [x] Detalhar fluxo de login/cadastro (e-mail/senha e Google OAuth)
    - **Fluxo de Cadastro (e-mail/senha):**
      1. Usuário informa nome, e-mail e senha.
      2. Sistema envia e-mail de verificação.
      3. Após verificação, usuário pode fazer login.
    - **Fluxo de Login (e-mail/senha):**
      1. Usuário informa e-mail e senha.
      2. Sistema valida as credenciais e libera o acesso.
    - **Fluxo de Login (Google OAuth):**
      1. Usuário clica em "Entrar com Google".
      2. Sistema redireciona para a tela de login do Google.
      3. Após autorização, usuário é autenticado no app.
  - [x] Definir campos de perfil e fluxo de upload de foto
    - **Campos do Perfil:**
      - **Todos:** Nome, E-mail, Foto de Perfil, Telefone/WhatsApp.
      - **Aluno:** Plano, Data de Início, Graduação Atual, Histórico de Graduações.
      - **Professor:** Especialidades (Modalidades), Turmas.
      - **Admin:** Cargo.
    - **Fluxo de Upload de Foto:**
      1. Usuário clica na foto de perfil.
      2. App abre a galeria ou a câmera do celular.
      3. Usuário seleciona ou tira uma foto.
      4. App faz o upload para o Firebase Storage e atualiza a URL da foto no perfil do usuário.
  - [x] Esboçar regras de permissão para cada tipo de usuário
    - **Regras no Firestore:**
      - `/users/{userId}`: Usuário só pode ler e escrever seus próprios dados. Admin pode ler todos.
      - `/students/{studentId}`: Aluno só pode ler seus próprios dados. Professor pode ler dados de seus alunos. Admin pode ler e escrever todos.
      - `/classes/{classId}`: Aluno pode ler dados de turmas. Professor pode ler e escrever dados de suas turmas. Admin pode ler e escrever todas.
      - `/payments/{paymentId}`: Aluno pode ler seus próprios pagamentos. Admin pode ler e escrever todos.

- [x] Módulo 2: Gestão de Alunos (Visão do Admin/Professor)
  - [x] Detalhar fluxo de adição de alunos (link de convite)
    - **Fluxo de Adição de Aluno (Admin/Professor):**
      1. Admin/Professor clica em "Adicionar Aluno".
      2. Insere o nome e e-mail/WhatsApp do aluno.
      3. Sistema gera um link de convite único.
      4. Admin/Professor envia o link para o aluno.
    - **Fluxo de Cadastro (Aluno via Convite):**
      1. Aluno clica no link de convite.
      2. É redirecionado para uma tela de cadastro pré-preenchida (se possível).
      3. Aluno completa o cadastro com seus dados (senha, etc.).
      4. O perfil do aluno é criado e vinculado à academia.
  - [x] Definir campos para listagem, busca e edição de alunos
    - **Listagem de Alunos:**
      - Nome, Foto, Status do Pagamento (em dia/atrasado), Graduação.
    - **Busca de Alunos:**
      - Por nome, por modalidade, por status de pagamento.
    - **Edição de Alunos (Admin):**
      - Todos os campos do perfil do aluno.
  - [x] Detalhar registro de graduações na timeline
    - **Fluxo de Registro de Graduação (Admin/Professor):**
      1. Acessa o perfil do aluno.
      2. Clica em "Adicionar Graduação".
      3. Seleciona a modalidade e a nova graduação.
      4. Adiciona uma data e, opcionalmente, uma observação.
      5. O registro aparece na timeline de evolução do aluno.

- [x] Módulo 3: Gestão da Academia (Visão do Admin)
  - [x] Detalhar CRUD de Modalidades de Luta
    - **Campos:** Nome da Modalidade (ex: Jiu-Jitsu, Muay Thai), Descrição.
    - **Funcionalidades:** Criar, Visualizar, Editar, Excluir modalidades.
  - [x] Detalhar CRUD de Planos de Pagamento (ex: Mensal, Trimestral).
    - **Campos:** Nome do Plano (ex: Mensal, Trimestral, Anual), Valor, Duração (em meses), Descrição.
    - **Funcionalidades:** Criar, Visualizar, Editar, Excluir planos.
  - [x] Detalhar CRUD de Turmas, definindo horários, professor responsável e modalidade.
    - **Campos:** Nome da Turma, Modalidade (link para Modalidades de Luta), Professor Responsável (link para Professores), Horários (dias da semana e horários), Capacidade Máxima de Alunos.
    - **Funcionalidades:** Criar, Visualizar, Editar, Excluir turmas.
  - [x] Detalhar ferramenta para criar e publicar avisos no mural geral da academia.
    - **Fluxo:**
      1. Admin acessa a tela "Mural de Avisos".
      2. Clica em "Novo Aviso".
      3. Preenche Título, Conteúdo e, opcionalmente, Data de Expiração.
      4. Publica o aviso, que fica visível para todos os alunos no app.
- [x] Módulo 4: Funcionalidades do Aluno (Core do App)
  - [x] Detalhar Dashboard (acesso rápido)
    - **Conteúdo:** Resumo de aulas próximas, status de pagamento, avisos recentes.
    - **Acesso Rápido:** Botões para check-in, pagamentos, evolução.
  - [x] Detalhar sistema de check-in (condições de ativação)
    - **Condições:** Botão de check-in ativo apenas 15 minutos antes e 15 minutos depois do horário da aula.
    - **Fluxo:** Aluno clica em check-in, sistema registra presença na turma.
  - [x] Detalhar tela "Meus Pagamentos" (histórico, status)
    - **Conteúdo:** Lista de pagamentos realizados (data, valor, plano), status da mensalidade atual (em dia, atrasado, próximo vencimento).
  - [x] Detalhar tela "Minha Evolução" (timeline de graduações)
    - **Conteúdo:** Linha do tempo com todas as graduações do aluno (data, modalidade, graduação, observações).
  - [x] Detalhar Calendário/Agenda com os horários de todas as aulas, filtrável por modalidade.
    - **Funcionalidades:** Visualização diária/semanal/mensal, filtro por modalidade, detalhes da aula (professor, horário, local).
  - [x] Detalhar Mural de Avisos (modo leitura).
    - **Conteúdo:** Lista de avisos publicados pela academia (título, conteúdo, data de publicação).

- [x] Módulo 5: Funcionalidades do Professor
  - [x] Detalhar painel para visualizar, em tempo real, a lista de alunos que fizeram check-in em sua aula atual.
    - **Conteúdo:** Lista dinâmica de alunos com status de check-in (presente/ausente).
    - **Atualização:** Atualização em tempo real conforme alunos fazem check-in.
  - [x] Detalhar acesso rápido para registrar graduações nos perfis de seus alunos.
    - **Fluxo:** Acesso direto ao formulário de registro de graduação a partir da lista de alunos da turma.

- [x] Módulo 6: Pagamentos e Financeiro
  - [x] Detalhar ferramenta manual para registrar pagamentos e marcar mensalidades como "pagas" (Admin).
    - **Fluxo:**
      1. Admin acessa o perfil do aluno.
      2. Clica em "Registrar Pagamento".
      3. Seleciona o plano, valor, data do pagamento e método (manual).
      4. O status da mensalidade do aluno é atualizado para "paga".
  - [x] (V2 - Completo) Detalhar integração com sistema de pagamento via PIX para que o aluno pague diretamente pelo app, com baixa automática no sistema.
    - **Fluxo:**
      1. Aluno acessa a tela "Meus Pagamentos".
      2. Se a mensalidade estiver pendente, um botão "Pagar com PIX" é exibido.
      3. Ao clicar, o app gera um QR Code PIX ou código "copia e cola".
      4. Após o pagamento ser confirmado pelo banco, o status da mensalidade é automaticamente atualizado no sistema.

- [x] Módulo 7: Comunicação e Engajamento
  - [x] Detalhar links de contato rápido para grupos de WhatsApp ou para falar diretamente com o professor.
    - **Funcionalidade:** Botões ou links diretos para abrir o WhatsApp com o número do professor ou link para o grupo da academia.
  - [x] (V2 - Completo) Detalhar sistema de Notificações Push para:
    - **Lembrar o aluno sobre aulas que estão para começar:** Notificação 15-30 minutos antes do início da aula.
    - **Avisar sobre vencimento de pagamentos:** Notificação 3-5 dias antes do vencimento e no dia do vencimento.
    - **Notificar sobre novos avisos no mural:** Notificação imediata quando um novo aviso é publicado.

- [x] Módulo 8: Eventos e Captação de Novos Alunos
  - [x] (V2 - Completo) Ferramenta de Gerenciamento de Campeonatos:
    - **(Admin) Criar e divulgar eventos (campeonatos, seminários):**
      1. Admin preenche formulário com nome do evento, descrição, data, local, valor da inscrição.
      2. Evento é publicado no app e visível para alunos.
    - **(Aluno) Visualizar e se inscrever nos eventos:**
      1. Aluno visualiza lista de eventos disponíveis.
      2. Clica em um evento para ver detalhes e se inscrever (se houver taxa, direciona para pagamento).
    - **(Admin) Gerenciar lista de inscritos e publicar resultados:**
      1. Admin visualiza lista de inscritos por evento.
      2. Pode registrar pagamentos de inscrição.
      3. Publica resultados ou fotos do evento.
  - [x] (V2 - Completo) Funcionalidade para Agendamento de Aulas Experimentais por novos interessados.
    - **Fluxo:**
      1. Novo interessado acessa uma tela específica no app (ou via link externo).
      2. Preenche nome, contato e seleciona modalidade/horário disponível para aula experimental.
      3. O agendamento é enviado para o Admin/Professor responsável para confirmação.

- [x] Módulo 9: Relatórios (Visão do Admin)
  - [x] (V2 - Completo) Detalhar Dashboard com relatórios visuais (gráficos) sobre:
    - **Faturamento mensal:** Gráfico de barras ou linha mostrando o faturamento ao longo dos meses.
    - **Número de alunos ativos:** Gráfico de linha ou área mostrando a evolução do número de alunos ativos.
    - **Frequência média nas aulas:** Gráfico de barras ou pizza mostrando a frequência por modalidade ou turma.

## Requisitos Não-Funcionais

- [x] UI/UX: Definir diretrizes de design (limpo, moderno, intuitivo, mobile-first)
  - **Design System:** Utilizar um design system consistente (ex: Material Design para Android, Human Interface Guidelines para iOS, ou um customizado).
  - **Responsividade:** Layouts adaptáveis para diferentes tamanhos de tela de dispositivos móveis.
  - **Acessibilidade:** Considerar padrões de acessibilidade (tamanho de fonte, contraste de cores, navegação por teclado).
  - **Feedback Visual:** Fornecer feedback visual para ações do usuário (botões clicados, carregamento de dados).
- [x] Segurança: Detalhar regras de segurança do Firestore
  - **Regras do Firestore:** Implementar regras de segurança robustas para garantir que cada usuário (Admin, Professor, Aluno) tenha acesso apenas aos dados permitidos, conforme esboçado no Módulo 1.
  - **Autenticação:** Utilizar o Firebase Authentication para gerenciar o acesso de usuários, incluindo e-mail/senha e Google OAuth.
  - **Proteção de Dados Sensíveis:** Criptografar ou tokenizar dados sensíveis, se aplicável (ex: informações de pagamento, embora o PIX seja via terceiros, garantir que dados do app não vazem).
  - **Validação de Entrada:** Validar todos os dados de entrada para prevenir ataques como injeção de código ou dados maliciosos.
- [x] Performance: Definir métricas e estratégias de otimização
  - **Velocidade de Carregamento:** Otimizar o carregamento inicial do aplicativo e das telas.
  - **Otimização de Consultas:** Otimizar as consultas ao Firestore para minimizar o uso de dados e o tempo de resposta.
  - **Cache de Dados:** Implementar cache de dados localmente no dispositivo para reduzir a dependência da rede e melhorar a experiência offline.
  - **Gerenciamento de Imagens:** Otimizar o carregamento e exibição de imagens (compressão, lazy loading).
  - **Testes de Performance:** Realizar testes de performance para identificar gargalos e otimizar o aplicativo.
- [x] Código: Definir padrões de código (limpo, organizado, comentado)
  - **Estrutura de Pastas:** Organizar o código em uma estrutura lógica (ex: por módulos, por funcionalidades, por tipo de arquivo).
  - **Componentização:** Utilizar componentes reutilizáveis no React Native para modularidade e fácil manutenção.
  - **Convenções de Nomenclatura:** Seguir convenções de nomenclatura consistentes para variáveis, funções, componentes e arquivos.
  - **Comentários:** Adicionar comentários claros e concisos onde necessário, especialmente em lógicas complexas ou não óbvias.
  - **Testes Unitários e de Integração:** Escrever testes para garantir a qualidade e a estabilidade do código.
  - **Linting e Formatação:** Utilizar ferramentas como ESLint e Prettier para manter a consistência do código e identificar erros.

## Configuração do Ambiente

- [x] Criar projeto Expo React Native
- [x] Instalar Firebase SDK
- [ ] Configurar Firebase no console (aguardando credenciais do usuário)
- [ ] Adicionar credenciais Firebase ao projeto
  - [x] Detalhar Dashboard (acesso rápido)
    - **Conteúdo:** Resumo de aulas próximas, status de pagamento, avisos recentes.
    - **Acesso Rápido:** Botões para check-in, pagamentos, evolução.
  - [x] Detalhar sistema de check-in (condições de ativação)
    - **Condições:** Botão de check-in ativo apenas 15 minutos antes e 15 minutos depois do horário da aula.
    - **Fluxo:** Aluno clica em check-in, sistema registra presença na turma.
  - [x] Detalhar tela "Meus Pagamentos" (histórico, status)
    - **Conteúdo:** Lista de pagamentos realizados (data, valor, plano), status da mensalidade atual (em dia, atrasado, próximo vencimento).
  - [x] Detalhar tela "Minha Evolução" (timeline de graduações)
    - **Conteúdo:** Linha do tempo com todas as graduações do aluno (data, modalidade, graduação, observações).
  - [x] Detalhar Calendário/Agenda com os horários de todas as aulas, filtrável por modalidade.
    - **Funcionalidades:** Visualização diária/semanal/mensal, filtro por modalidade, detalhes da aula (professor, horário, local).
  - [x] Detalhar Mural de Avisos da academia (modo leitura).
    - **Conteúdo:** Lista de avisos publicados pela academia (título, conteúdo, data de publicação).

- [x] Módulo 5: Funcionalidades do Professor
  - [x] Detalhar painel para visualizar, em tempo real, a lista de alunos que fizeram check-in em sua aula atual.
    - **Conteúdo:** Lista dinâmica de alunos com status de check-in (presente/ausente).
    - **Atualização:** Atualização em tempo real conforme alunos fazem check-in.
  - [x] Detalhar acesso rápido para registrar graduações nos perfis de seus alunos.
    - **Fluxo:** Acesso direto ao formulário de registro de graduação a partir da lista de alunos da turma.

- [x] Módulo 6: Pagamentos e Financeiro
  - [x] Detalhar ferramenta manual para registrar pagamentos e marcar mensalidades como "pagas" (Admin).
    - **Fluxo:**
      1. Admin acessa o perfil do aluno.
      2. Clica em "Registrar Pagamento".
      3. Seleciona o plano, valor, data do pagamento e método (manual).
      4. O status da mensalidade do aluno é atualizado para "paga".
  - [x] (V2 - Completo) Detalhar integração com sistema de pagamento via PIX para que o aluno pague diretamente pelo app, com baixa automática no sistema.
    - **Fluxo:**
      1. Aluno acessa a tela "Meus Pagamentos".
      2. Se a mensalidade estiver pendente, um botão "Pagar com PIX" é exibido.
      3. Ao clicar, o app gera um QR Code PIX ou código "copia e cola".
      4. Após o pagamento ser confirmado pelo banco, o status da mensalidade é automaticamente atualizado no sistema.

- [x] Módulo 7: Comunicação e Engajamento
  - [x] Detalhar links de contato rápido para grupos de WhatsApp ou para falar diretamente com o professor.
    - **Funcionalidade:** Botões ou links diretos para abrir o WhatsApp com o número do professor ou link para o grupo da academia.
  - [x] (V2 - Completo) Detalhar sistema de Notificações Push para:
    - **Lembrar o aluno sobre aulas que estão para começar:** Notificação 15-30 minutos antes do início da aula.
    - **Avisar sobre vencimento de pagamentos:** Notificação 3-5 dias antes do vencimento e no dia do vencimento.
    - **Notificar sobre novos avisos no mural:** Notificação imediata quando um novo aviso é publicado.

- [x] Módulo 8: Eventos e Captação de Novos Alunos
  - [x] (V2 - Completo) Ferramenta de Gerenciamento de Campeonatos:
    - **(Admin) Criar e divulgar eventos (campeonatos, seminários):**
      1. Admin preenche formulário com nome do evento, descrição, data, local, valor da inscrição.
      2. Evento é publicado no app e visível para alunos.
    - **(Aluno) Visualizar e se inscrever nos eventos:**
      1. Aluno visualiza lista de eventos disponíveis.
      2. Clica em um evento para ver detalhes e se inscrever (se houver taxa, direciona para pagamento).
    - **(Admin) Gerenciar lista de inscritos e publicar resultados:**
      1. Admin visualiza lista de inscritos por evento.
      2. Pode registrar pagamentos de inscrição.
      3. Publica resultados ou fotos do evento.
  - [x] (V2 - Completo) Funcionalidade para Agendamento de Aulas Experimentais por novos interessados.
    - **Fluxo:**
      1. Novo interessado acessa uma tela específica no app (ou via link externo).
      2. Preenche nome, contato e seleciona modalidade/horário disponível para aula experimental.
      3. O agendamento é enviado para o Admin/Professor responsável para confirmação.

- [x] Módulo 9: Relatórios (Visão do Admin)
  - [x] (V2 - Completo) Detalhar Dashboard com relatórios visuais (gráficos) sobre:
    - **Faturamento mensal:** Gráfico de barras ou linha mostrando o faturamento ao longo dos meses.
    - **Número de alunos ativos:** Gráfico de linha ou área mostrando a evolução do número de alunos ativos.
    - **Frequência média nas aulas:** Gráfico de barras ou pizza mostrando a frequência por modalidade ou turma.

## Requisitos Não-Funcionais

- [x] UI/UX: Definir diretrizes de design (limpo, moderno, intuitivo, mobile-first)
  - **Design System:** Utilizar um design system consistente (ex: Material Design para Android, Human Interface Guidelines para iOS, ou um customizado).
  - **Responsividade:** Layouts adaptáveis para diferentes tamanhos de tela de dispositivos móveis.
  - **Acessibilidade:** Considerar padrões de acessibilidade (tamanho de fonte, contraste de cores, navegação por teclado).
  - **Feedback Visual:** Fornecer feedback visual para ações do usuário (botões clicados, carregamento de dados).
- [x] Segurança: Detalhar regras de segurança do Firestore
  - **Regras do Firestore:** Implementar regras de segurança robustas para garantir que cada usuário (Admin, Professor, Aluno) tenha acesso apenas aos dados permitidos, conforme esboçado no Módulo 1.
  - **Autenticação:** Utilizar o Firebase Authentication para gerenciar o acesso de usuários, incluindo e-mail/senha e Google OAuth.
  - **Proteção de Dados Sensíveis:** Criptografar ou tokenizar dados sensíveis, se aplicável (ex: informações de pagamento, embora o PIX seja via terceiros, garantir que dados do app não vazem).
  - **Validação de Entrada:** Validar todos os dados de entrada para prevenir ataques como injeção de código ou dados maliciosos.
- [x] Performance: Definir métricas e estratégias de otimização
  - **Velocidade de Carregamento:** Otimizar o carregamento inicial do aplicativo e das telas.
  - **Otimização de Consultas:** Otimizar as consultas ao Firestore para minimizar o uso de dados e o tempo de resposta.
  - **Cache de Dados:** Implementar cache de dados localmente no dispositivo para reduzir a dependência da rede e melhorar a experiência offline.
  - **Gerenciamento de Imagens:** Otimizar o carregamento e exibição de imagens (compressão, lazy loading).
  - **Testes de Performance:** Realizar testes de performance para identificar gargalos e otimizar o aplicativo.
- [x] Código: Definir padrões de código (limpo, organizado, comentado)
  - **Estrutura de Pastas:** Organizar o código em uma estrutura lógica (ex: por módulos, por funcionalidades, por tipo de arquivo).
  - **Componentização:** Utilizar componentes reutilizáveis no React Native para modularidade e fácil manutenção.
  - **Convenções de Nomenclatura:** Seguir convenções de nomenclatura consistentes para variáveis, funções, componentes e arquivos.
  - **Comentários:** Adicionar comentários claros e concisos onde necessário, especialmente em lógicas complexas ou não óbvias.
  - **Testes Unitários e de Integração:** Escrever testes para garantir a qualidade e a estabilidade do código.
  - **Linting e Formatação:** Utilizar ferramentas como ESLint e Prettier para manter a consistência do código e identificar erros.



