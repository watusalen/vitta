# Especificação de Telas do Sistema

## 1. Visão Geral

O aplicativo tem como objetivo apoiar o processo de agendamento de consultas nutricionais, permitindo que pacientes solicitem horários e que a nutricionista gerencie, aceite ou recuse solicitações, além de acompanhar sua agenda confirmada.

O sistema possui dois perfis de usuário:
- **Paciente**
- **Nutricionista**

Cada perfil possui telas específicas, acessíveis após autenticação.

---

## 2. Telas Comuns (Ambos os Perfis)

### 2.1 Tela de Abertura / Splash

**Arquivo:** `src/view/pages/SplashScreen.tsx`

**Objetivo:**  
Identificar visualmente o aplicativo e preparar o ambiente inicial.

**Descrição:**  
Exibe a identidade visual do aplicativo enquanto o sistema verifica:
- estado de autenticação do usuário;

**Comportamento:**
- Se o usuário estiver autenticado, redireciona para a tela inicial do seu perfil.
- Caso contrário, redireciona para a tela de login.

---

### 2.2 Tela de Login

**Arquivo:** `src/view/pages/auth/LoginScreen.tsx`

**Objetivo:**  
Permitir o acesso seguro ao aplicativo.

**Descrição:**  
Apresenta campos para autenticação via e-mail e senha (Firebase Authentication).

**Elementos principais:**
- Campo de e-mail
- Campo de senha
- Botão "Entrar"
- Link "Esqueceu sua senha?"
- Mensagens de erro por campo (e-mail/senha) e erro geral

**Comportamento:**  
Após login bem-sucedido, o sistema identifica o papel do usuário (paciente ou nutricionista) e redireciona para o fluxo correspondente.

---

### 2.3 Tela de Registro

**Arquivo:** `src/view/pages/auth/RegisterScreen.tsx`

**Objetivo:**  
Permitir que novos pacientes criem uma conta no aplicativo.

**Descrição:**  
Apresenta campos para cadastro de novo usuário.

**Elementos principais:**
- Campo de nome
- Campo de e-mail
- Campo de senha
- Campo de confirmar senha
- Botão "Criar Conta"
- Link "Já tenho conta" para voltar ao login
- Mensagens de erro por campo (nome/e-mail/senha/confirmação)

**Comportamento:**  
Após registro bem-sucedido, o usuário é automaticamente autenticado e redirecionado para a tela inicial do paciente.

---

### 2.4 Tela de Recuperação de Senha

**Arquivo:** `src/view/pages/auth/ForgotPasswordScreen.tsx`

**Objetivo:**  
Permitir que o usuário solicite redefinição de senha via e-mail.

**Descrição:**  
Exibe o campo de e-mail e envia solicitação de recuperação via Firebase.

**Comportamento:**  
Após enviar o e-mail, o usuário recebe confirmação visual e pode retornar ao login.

---

### 2.5 Permissão de Notificações

**Arquivo:** `src/view/pages/NotificationsPermissionScreen.tsx`

**Objetivo:**  
Solicitar autorização de notificações para receber atualizações de consultas.

**Comportamento:**  
Esta tela é apresentada após o login, quando as permissões de calendário já foram concedidas.  
Se o usuário negar a permissão, o app permanece nesta tela e orienta a abrir os ajustes.

---

### 2.6 Permissão de Calendário

**Arquivo:** `src/view/pages/CalendarPermissionScreen.tsx`

**Objetivo:**  
Solicitar autorização para integrar o app ao calendário do dispositivo.

**Comportamento:**  
Esta tela é apresentada logo após o login.  
Se o usuário negar a permissão, o app permanece nesta tela e orienta a abrir os ajustes.

---

## 3. Telas do Perfil Paciente

### 3.1 Tela Inicial do Paciente

**Arquivo:** `src/view/pages/patient/PatientHomeScreen.tsx`

**Objetivo:**  
Servir como ponto de entrada para as principais funcionalidades do paciente.

**Descrição:**  
Apresenta atalhos claros para:
- solicitar nova consulta;
- visualizar consultas já solicitadas.

**Comportamento:**  
Funciona como menu principal do paciente, com navegação simples e intuitiva.

---

### 3.2 Tela de Disponibilidade / Agendamento

**Arquivo:** `src/view/pages/patient/ScheduleScreen.tsx`

**Objetivo:**  
Permitir que o paciente visualize os dias e horários disponíveis para consulta.

**Descrição:**  
Exibe um calendário interativo mensal (react-native-calendars) onde:
- Apenas dias úteis (Segunda a Sexta) são marcados como disponíveis
- Ao clicar em um dia, são exibidos os horários vagos daquele dia
- Horários disponíveis configurados: **9h-11h, 11h-13h, 13h-15h, 14h-16h** (consultas de 2 horas)
- O paciente seleciona um horário e confirma a solicitação

**Elementos principais:**
- Calendário mensal interativo com dias marcados
- Lista de horários disponíveis do dia selecionado (filtrando já ocupados)
- Cards de horário selecionáveis
- Botão "Solicitar Consulta" (habilitado apenas quando há horário selecionado)
- Indicador de carregamento durante operações

**Restrições:**
- Apenas horários disponíveis são exibidos
- Horários já ocupados por consultas aceitas não aparecem
- Horários com solicitação pendente do próprio paciente não aparecem
- Horários no passado (inclusive no dia atual) não aparecem
- Fins de semana não são exibidos como disponíveis
- Não é possível solicitar sem selecionar um horário
- Caso outro paciente já tenha uma solicitação pendente para o mesmo horário, o sistema bloqueia a solicitação no momento do envio

**Comportamento:**  
Ao confirmar a solicitação:
- O sistema registra no Firebase com status "pendente"
- O horário é removido da lista de disponíveis
- Feedback visual de sucesso é exibido

---

### 3.3 Tela de Minhas Consultas

**Arquivo:** `src/view/pages/patient/MyAppointmentsScreen.tsx`

**Objetivo:**  
Permitir ao paciente acompanhar o andamento de suas consultas em tempo real.

**Descrição:**  
Exibe uma lista de todas as consultas solicitadas pelo paciente com atualização em tempo real via Firebase.

**Informações exibidas:**
- Data (formatada em português: "10 de dezembro de 2025")
- Horário
- Status com cores diferenciadas:
  - Pendente (amarelo/laranja)
  - Aceita (verde)
  - Recusada (vermelho)
  - Cancelada (cinza)

**Elementos principais:**
- Lista de cards de consultas clicáveis
- Pull-to-refresh para atualização manual
- Indicador de carregamento
- Mensagem quando não há consultas

**Comportamento:**
- Lista atualiza automaticamente quando status muda
- Ao clicar em uma consulta, navega para os detalhes

---

### 3.4 Tela de Detalhes da Consulta (Paciente)

**Arquivo:** `src/view/pages/patient/AppointmentDetailsScreen.tsx`

**Objetivo:**  
Exibir informações completas de uma consulta específica e permitir ações.

**Descrição:**  
Mostra os detalhes da consulta selecionada com status visual e ações disponíveis.

**Elementos principais:**
- Botão de retorno "← Voltar" no topo
- Badge de status com cor e descrição
- Data e horário formatados
- Nome da nutricionista
- Informações de criação/atualização
- Botão "Cancelar Consulta" (quando aplicável)
- Dicas contextuais baseadas no status

**Informações exibidas:**
- Data e horário
- Status atual com descrição
- Nome da nutricionista
- Data de solicitação
- Data de atualização (se houver)

**Comportamento:**
- Consultas pendentes ou aceitas podem ser canceladas
- Ao cancelar, mantém a consulta listada com status "cancelada"
- Consultas recusadas ou canceladas exibem apenas informações

---

## 4. Telas do Perfil Nutricionista

### 4.1 Tela Inicial da Nutricionista

**Arquivo:** `src/view/pages/nutritionist/NutritionistHomeScreen.tsx`

**Objetivo:**  
Organizar o acesso rápido às funções principais da nutricionista.

**Descrição:**  
Apresenta acesso direto a:
- solicitações pendentes;
- agenda confirmada.

---

### 4.2 Tela de Solicitações Pendentes

**Arquivo:** `src/view/pages/nutritionist/PendingRequestsScreen.tsx`

**Objetivo:**  
Permitir que a nutricionista visualize e gerencie pedidos de consulta pendentes.

**Descrição:**  
Exibe uma lista de solicitações com status "pendente" com atualização em tempo real via Firebase.

**Informações exibidas por item:**
- Nome do paciente
- Data solicitada (formatada em português)
- Horário solicitado
- Botões de ação inline

**Elementos principais:**
- Lista de cards de solicitações pendentes
- Botão "Aceitar" (verde) em cada card
- Botão "Recusar" (vermelho) em cada card
- Pull-to-refresh para atualização manual
- Indicador de carregamento
- Mensagem quando não há pendentes

**Comportamento:**  
Ao aceitar:
- O status é alterado para "aceita"
- A consulta é removida da lista de pendentes
- A lista atualiza automaticamente

Ao recusar:
- O status é alterado para "recusada"
- A consulta é removida da lista de pendentes

---

### 4.3 Tela de Agenda da Nutricionista

**Arquivo:** `src/view/pages/nutritionist/AgendaScreen.tsx`

**Objetivo:**  
Visualizar todas as consultas confirmadas em formato de calendário.

**Descrição:**  
Apresenta um calendário interativo (react-native-calendars) mostrando consultas com status "aceita" e "cancelada".

**Elementos principais:**
- Calendário mensal interativo
- Dias com consultas marcados com indicador visual
- Lista de consultas do dia selecionado
- Cards clicáveis para cada consulta
- Filtros: Todos, Esta Semana, Hoje

**Informações exibidas:**
- Data no calendário
- Horário da consulta
- Nome do paciente

**Comportamento:**
- Ao selecionar um dia, mostra as consultas daquele dia
- Ao clicar em uma consulta, navega para os detalhes
- Atualização em tempo real via Firebase

---

### 4.4 Tela de Detalhes da Consulta (Nutricionista)

**Arquivo:** `src/view/pages/nutritionist/NutritionistAppointmentDetailsScreen.tsx`

**Objetivo:**  
Visualizar e gerenciar uma consulta (pendente, aceita ou cancelada).

**Descrição:**  
Exibe os detalhes completos da consulta com ações baseadas no status.

**Elementos principais:**
- Botão de retorno "← Voltar" no topo
- Badge de status com cor
- Nome do paciente
- Data e horário formatados
- Aviso de conflito de horário (quando aplicável)
- Botões de ação:
  - Pendente: "Aceitar" e "Recusar"
  - Aceita: "Cancelar Consulta"
  - Cancelada: "Aceitar Novamente"

**Comportamento:**
- Ao aceitar pendente, verifica conflitos e alerta se houver
- Ao recusar, atualiza status e retorna
- Ao cancelar, atualiza status e retorna para Agenda
- Ao aceitar novamente consulta cancelada, verifica conflitos e pode abrir a tela de resolução de conflitos
- Consultas recusadas exibem apenas informações

---

### 4.5 Tela de Resolução de Conflitos (Nutricionista)

**Arquivo:** `src/view/pages/nutritionist/NutritionistConflictResolutionScreen.tsx`

**Objetivo:**  
Resolver conflitos quando a nutricionista tenta aceitar/reativar duas consultas no mesmo horário.

**Descrição:**  
Exibe as consultas aceitas e canceladas do mesmo horário para seleção da consulta válida.

**Comportamento:**  
Ao confirmar a escolha, a consulta selecionada permanece "aceita" e as demais ficam "canceladas". Em seguida, o app exibe mensagem de sucesso e retorna para a agenda ao confirmar.
