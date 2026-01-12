# Planejamento de Sprints - Vitta

App de Agendamento de Consultas Nutricionais  
React Native + Expo + Firebase + Supabase (push)

---

## Documentação Relacionada

- [Casos de Uso (UC)](./UC.md)
- [Requisitos Funcionais (RF)](./RF.md)
- [Requisitos Não Funcionais (RNF)](./RNF.md)
- [Histórias de Usuário - Paciente (HUP)](./HUP.md)
- [Histórias de Usuário - Nutricionista (HUN)](./HUN.md)
- [Histórias de Usuário - Sistema (HUS)](./HUS.md)
- [Arquitetura](./ARQUITETURA.md)
- [Componentes](./COMPONENTES.md)
- [Modelo de Entidades e Relacionamentos](./ERD.md)
- [Telas](./TELAS.md)

---

## Visão Geral Estratégica

Este documento define o planejamento de desenvolvimento em sprints, priorizando entregas incrementais e funcionais. A estratégia segue um modelo incremental onde cada sprint entrega valor de negócio tangível, culminando em um MVP funcional.

As integrações de notificações push e calendário nativo (Supabase Edge Functions + Expo Notifications/Calendar), exigem build nativo para funcionamento fora do Metro.

---

## Cronograma Executivo

| Sprint | Duração | Foco Principal | Valor Entregue | Criticidade |
|--------|---------|---|---|---|
| 1 | 1-2 sem | Autenticação e Fundação | Estrutura base + Login | Essencial |
| 2 | 1-2 sem | Gestão Paciente | Solicitações de Consulta | Essencial |
| 3 | 1-2 sem | Gestão Nutricionista | Aceitação/Recusa de Consultas | Essencial |
| 4 | 1 sem | Cancelamento e UX | Refinamentos Funcionais | Essencial |
| 5 | 3-5 dias | Integrações Reais | Calendário + Push | Essencial |
| 6 | 3-5 dias | Polimento Final | Qualidade Produção | Essencial |

**Duração Total Estimada:** 5-8 semanas  
**MVP Funcional:** Sprints 1-5 (4-7 semanas)

---

## SPRINT 1: Fundação e Autenticação

**Duração:** 1-2 semanas  
**Objetivo:** Estruturar base do projeto e implementar autenticação funcional

### Histórias de Usuário Relacionadas

- [x] [P01](./HUP.md) - Paciente: Registrar no aplicativo com nome, e-mail e senha

### Entregas

#### Domínio (Model)
- [x] Entidade `User` (id, email, name, role: "patient" | "nutritionist", createdAt)
- [x] Entidade `Appointment` (id, patientId, nutritionistId, date, timeStart, timeEnd, status, createdAt, updatedAt)
- [x] Factory `makeUser` (name, email, role)
- [x] Interface `IAuthService` (login, signup, logout, onAuthStateChanged)
- [x] Interface `IUserRepository` (createUser, getUserByID, getByRole)
- [x] Erros de domínio: `AuthError`, `ValidationError`, `RepositoryError`

#### Infraestrutura
- [x] Configurar Firebase (Auth + Firestore)
- [x] Implementar `FirebaseAuthService`
- [x] Implementar `FirebaseUserRepository`
- [x] Configurar regras de segurança básicas do Firestore

#### Casos de Uso
- [x] `AuthUseCases` (login, signUp, logout, onAuthStateChanged)
  - [x] Validações via `AuthValidator` (email válido, senha >= 6 caracteres)
  - [x] Busca dados completos do usuário no Firestore após autenticação

#### ViewModel
- [x] `useHomeViewModel` (state: user, error, loading; actions: logout)
- [x] `useLoginViewModel` (state: user, error, loading, isAuthenticated; actions: login, clearerror)
- [x] `useSignUpViewModel` (state: user, error, loading; actions: signup, clearerror)

#### View

##### Pages
- [x] `SplashScreen.tsx`
- [x] `LoginScreen.tsx`
- [x] `RegisterScreen.tsx`
- [x] `ForgotPasswordScreen.tsx`
- [x] `patient/PatientHomeScreen.tsx`
- [x] `nutritionist/NutritionistHomeScreen.tsx`

##### Components
- [x] `LoadingIndicator.tsx`
- [x] `ErrorMessage.tsx`
- [x] `Button.tsx`

##### Themes
- [x] `theme.ts`

##### Navegação
- [x] Configurar navegação básica (redirecionar conforme perfil)

#### DI & Configuração
- [x] Criar `di/container.ts` com fábricas básicas
- [x] Configurar path aliases (`@/*` → `./src/*`)
- [x] Configurar variáveis de ambiente (Firebase config)

#### Testes

##### Testes Unitários (6 suítes, 65 testes)
- [x] **Model/Entities**: User, Appointment (type safety, structure)
- [x] **Model/Factories**: makeUser (creation, data integrity)
- [x] **Model/Errors**: AuthError, ValidationError, RepositoryError
- [x] **Usecase/Validator**: authValidator (email/password validation)
- [x] **Usecase/Auth**: authUseCases (login, signup, logout, onAuthStateChanged com mocks)

### Critérios de Aceitação

- [x] Paciente consegue se registrar com nome, email e senha
- [x] Paciente e nutricionista fazem login com credenciais válidas
- [x] Usuário consegue solicitar recuperação de senha por e-mail
- [x] Sistema diferencia perfis e redireciona corretamente
- [x] Nutricionista já existe no Firebase (cadastrada manualmente)
- [x] Mensagens de erro são exibidas de forma amigável
- [x] Loading é mostrado durante operações assíncronas  

### Notas Técnicas

- [x] Nutricionista deve ser pré-cadastrada manualmente no Firebase Console com `role: "nutritionist"`
- [x] Validar email no lado cliente e servidor (Firebase já valida)
- [x] Senha mínima de 6 caracteres (regra do Firebase)

---

## SPRINT 2: Gestão de Consultas - Paciente

**Duração:** 1-2 semanas  
**Objetivo:** Paciente visualiza disponibilidade e solicita consultas

### Histórias de Usuário Relacionadas

- [x] [P02](./HUP.md) - Paciente: Visualizar dias e horários disponíveis
- [x] [P03](./HUP.md) - Paciente: Solicitar consulta em dia e horário específicos
- [x] [P04](./HUP.md) - Paciente: Acompanhar status das solicitações
- [x] [P05](./HUP.md) - Paciente: Ver lista de consultas futuras

### Entregas

#### Domínio (Model)
- [x] Interface `IAppointmentRepository` (createAppointment, getAppointmentByID, listAppointmentsByPatient, listAppointmentsByNutritionist, listAppointmentsByDate, updateAppointmentStatus)
- [x] Factory `makeAppointment` (patientId, nutritionistId, date, timeStart, timeEnd)
- [x] Factory `makeTimeSlot` (date, timeStart, timeEnd, available)
- [x] Tipo `AppointmentStatus` (union: pending | accepted | rejected | cancelled)

#### Infraestrutura
- [x] Implementar `FirebaseAppointmentRepository`
- [x] Coleção Firestore: `appointments`
- [x] Índices necessários (Firestore):
  - [x] Composto: `patientId` + `date` + `status`
  - [x] Composto: `nutritionistId` + `date` + `status`

#### Casos de Uso
- [x] `GetAvailableTimeSlotsUseCase` (hardcoded: Seg-Sex, 9-16h, slots 2h)
  - [x] Slots: 9-11h, 11-13h, 13-15h, 14-16h
  - [x] Filtrar fins de semana
  - [x] Filtrar horários já ocupados (consultas aceitas)
- [x] `RequestAppointmentUseCase` (validar slot disponível + criar solicitação)
- [x] `ListPatientAppointmentsUseCase` (buscar por patientId, ordenar por data)
- [x] `GetAppointmentDetailsUseCase` (buscar por id)

#### ViewModel
- [x] `useScheduleViewModel` (availableSlots, selectedDate, selectedTime, loading)
- [x] `useMyAppointmentsViewModel` (appointments list, loading, refresh)
- [x] `useAppointmentDetailsViewModel` (appointment, loading)
- [x] Hooks correspondentes para as Views

#### View
- [x] Tela: `ScheduleScreen.tsx` (calendário + seleção de horário)
  - [x] Integrar `react-native-calendars`
  - [x] Marcar dias úteis disponíveis
  - [x] Listar slots do dia selecionado
  - [x] Botão "Solicitar Consulta"
- [x] Tela: `MyAppointmentsScreen.tsx` (lista de consultas)
  - [x] Cards com status colorido
  - [x] Pull-to-refresh
  - [x] Navegação para detalhes
- [x] Tela: `AppointmentDetailsScreen.tsx` (visualização paciente)
  - [x] Badge de status
  - [x] Data/horário formatados
  - [x] Nome da nutricionista
- [x] Componentes: `AppointmentCard`, `TimePill`, `StatusBadge`, `ScreenHeader`, `EmptyStateCard`, `InfoRow`

##### Themes
- [x] `theme.ts` (tipografia, cores e espaçamentos aplicados às telas novas)

##### Navegação
- [x] Rotas de paciente (schedule, minhas consultas, detalhes)

#### Testes
- [x] Testes: `GetAvailableTimeSlotsUseCase` (fins de semana, slots ocupados)
- [x] Testes: `RequestAppointmentUseCase` (validações)
- [x] Testes: ViewModels

### Critérios de Aceitação

- Paciente vê calendário mensal com dias úteis disponíveis
- Fins de semana aparecem desabilitados
- Ao clicar em dia, vê slots: 9-11h, 11-13h, 13-15h, 14-16h
- Horários ocupados não aparecem na lista
- Paciente seleciona horário e solicita consulta
- Consulta criada com status "pending"
- Paciente vê lista de suas consultas com status colorido
- Atualização em tempo real (Firebase listeners)

### Notas Técnicas
- [x] Usar `react-native-calendars` para calendário
- [x] Formatar datas em português: "10 de dezembro de 2025"
- [x] Cores de status: pending (laranja), accepted (verde), rejected (vermelho), cancelled (cinza)

---

## SPRINT 3: Gestão de Consultas - Nutricionista

**Duração:** 1-2 semanas  
**Objetivo:** Nutricionista gerencia solicitações e visualiza agenda

### Histórias de Usuário Relacionadas

- [x] [N01](./HUN.md) - Nutricionista: Visualizar solicitações de consulta pendentes
- [x] [N02](./HUN.md) - Nutricionista: Aceitar solicitação de consulta
- [x] [N03](./HUN.md) - Nutricionista: Recusar solicitação de consulta
- [x] [N04](./HUN.md) - Nutricionista: Visualizar agenda de consultas confirmadas
- [x] [S01](./HUS.md) - Sistema: Evitar conflito de horários
- [x] [S02](./HUS.md) - Sistema: Atualizar status em tempo real

### Entregas

#### Casos de Uso
- [x] `ListPendingAppointmentsUseCase` (filtrar status, ordenar por data)
- [x] `AcceptAppointmentUseCase` (validar conflito + atualizar status)
- [x] `RejectAppointmentUseCase` (atualizar status para "rejected")
- [x] `ListNutritionistAgendaUseCase` (filtrar status "accepted", agrupar por data)
- [x] `CheckAppointmentConflictUseCase` (verificar mesmo horário/data)

#### ViewModel
- [x] `PendingRequestsViewModel` (pendingList, accept, reject, loading)
- [x] `NutritionistAgendaViewModel` (appointments, selectedDate, filter)
- [x] `NutritionistAppointmentDetailsViewModel` (appointment, actions)
- [x] Hooks correspondentes para as Views

#### View
- [x] Tela: `PendingRequestsScreen.tsx`
  - Lista de solicitações pendentes
  - Botões inline: Aceitar (verde) / Recusar (vermelho)
  - Pull-to-refresh
  - Atualização em tempo real
- [x] Tela: `AgendaScreen.tsx`
  - Calendário com consultas aceitas e canceladas
  - Dias com consulta marcados (indicador visual)
  - Lista de consultas do dia selecionado
  - Filtros: Todos, Esta Semana, Hoje
- [x] Tela: `NutritionistAppointmentDetailsScreen.tsx`
  - Detalhes completos
  - Ações: Aceitar, Recusar (se pendente)
  - Aviso de conflito de horário

##### Components
- [x] `ConfirmActionModal`, `AlertModal`, `AppointmentCard`, `EmptyStateCard`

##### Themes
- [x] `theme.ts` (aplicado às telas e cards da nutricionista)

##### Navegação
- [x] Rotas de nutricionista (pendências, agenda, detalhes)

#### Regras de Negócio
- [x] Validação: não permitir 2 consultas aceitas no mesmo dia/horário
- [x] Alert/modal quando houver conflito
- [x] Atualização de status notifica paciente via Firebase (listeners)

#### Testes
- [x] Testes: `AcceptAppointmentUseCase` (conflito de horário)
- [x] Testes: `CheckAppointmentConflictUseCase`
- [x] Testes: ViewModels

### Critérios de Aceitação

- Nutricionista vê lista de solicitações pendentes
- Nutricionista aceita consulta (status → "accepted")
- Nutricionista recusa consulta (status → "rejected")
- Sistema impede aceitar 2 consultas no mesmo horário
- Mensagem de erro clara se houver conflito
- Agenda mostra consultas aceitas e canceladas em calendário
- Paciente vê atualização de status em tempo real
- Dados atualizados automaticamente (Firebase listeners)

### Notas Técnicas
- Validação de conflito deve ser atômica (considerar transactions do Firestore se necessário)
- Usar `react-native-calendars` para agenda também
- Implementar filtros com `useMemo` para performance

---

## SPRINT 4: Cancelamento e Refinamentos

**Duração:** 1 semana  
**Objetivo:** Funcionalidade de cancelamento + melhorias UX

### Histórias de Usuário Relacionadas

- [x] [P08](./HUP.md) - Paciente: Cancelar consulta aceita
- [x] [N06](./HUN.md) - Nutricionista: Cancelar consulta já aceita
- [x] [N07](./HUN.md) - Nutricionista: Reativar consulta cancelada

### Entregas

#### Casos de Uso
- [x] `CancelAppointmentUseCase` (paciente ou nutricionista)
  - Validar que consulta está "accepted" ou "pending" (paciente) e "accepted" (nutricionista)
  - Atualizar status para "cancelled"
- [x] `ReactivateAppointmentUseCase` (nutricionista apenas)
  - Validar que consulta está "cancelled"
  - Verificar conflito de horário
  - Atualizar status para "accepted"

#### View - Melhorias
- [x] Botão "Cancelar Consulta" em `AppointmentDetailsScreen` (paciente)
  - Apenas para status: pending ou accepted
  - Modal de confirmação
- [x] Botão "Cancelar Consulta" em `NutritionistAppointmentDetailsScreen` (nutricionista)
  - Apenas para status: accepted
  - Modal de confirmação
- [x] Botão "Aceitar Novamente" em `NutritionistAppointmentDetailsScreen`
  - Apenas para status: cancelled
  - Verificar conflito antes de aceitar
- [x] Pull-to-refresh em TODAS as listas
- [x] Estados de loading em todas as telas
- [x] Tratamento de erro com mensagens amigáveis
- [x] Feedback visual (toasts/alerts) para sucesso/erro

##### Components
- [x] Modais de confirmação e alerta reutilizados nas telas

##### Navegação
- [x] Rotas de detalhes e retorno para listas após ações

#### Componentes Reutilizáveis
- [x] `ConfirmActionModal` (título, mensagem, ações)
- [x] `AlertModal` (mensagem + ação)
- [x] `EmptyStateCard` (mensagem quando lista vazia)
- [x] `LoadingIndicator` (spinner centralizado)

#### Validações
- [x] Validar formulário de registro (email, senha, nome)
- [x] Validar seleção de horário antes de solicitar
- [x] Sanitizar inputs

#### Testes
- [x] Testes: `CancelAppointmentUseCase`
- [x] Testes: `ReactivateAppointmentUseCase`
- [x] Testes de integração: fluxo completo paciente
- [x] Testes de integração: fluxo completo nutricionista

### Critérios de Aceitação

- Paciente cancela consulta pendente ou aceita (status → "cancelled")
- Nutricionista cancela consulta aceita
- Nutricionista reativa consulta cancelada (verifica conflitos)
- Modais de confirmação antes de ações críticas
- Todas as listas têm pull-to-refresh
- Loading é mostrado durante operações
- Erros são tratados com mensagens claras
- Feedback visual em todas as ações
- App não quebra em cenários de erro  

### Notas Técnicas

- Implementar debounce em ações críticas
- Garantir que listeners do Firebase sejam limpos (cleanup)

---

## SPRINT 5: Integrações Reais (Calendário + Push)

**Duração:** 3-5 dias  
**Objetivo:** Entregar notificações push reais e sincronização com calendário nativo

### Histórias de Usuário Relacionadas

- [x] [P06](./HUP.md) - Paciente: Adicionar consulta ao calendário do celular
- [x] [P07](./HUP.md) - Paciente: Receber notificações quando a consulta mudar
- [x] [N05](./HUN.md) - Nutricionista: Adicionar consultas ao calendário
- [x] [N08](./HUN.md) - Nutricionista: Receber notificações sobre solicitações
- [x] [S03](./HUS.md) - Sistema: Enviar notificações push de atualização

### Entregas

#### Domínio (Model)
- [x] Interface `ICalendarService`
- [x] Interface `IPushNotificationService`
- [x] Interface `IPushNotificationSender`
- [x] Campos `calendarEventIdPatient` e `calendarEventIdNutritionist` na consulta
- [x] Lista de `pushTokens` no usuário

#### Infraestrutura
- [x] `CalendarService` (Expo Calendar)
  - Criação/remoção de eventos no calendário
  - Lembrete padrão de 24h antes
- [x] `PushNotificationService` (Expo Notifications)
  - Permissões, token, canal Android
- [x] `PushNotificationSender` (Supabase Edge Function → Expo Push API)

#### Integração nos Use Cases
- [x] `AppointmentCalendarSyncUseCase` (cria/atualiza/remove evento)
- [x] `AppointmentPushNotificationUseCase` (solicitação, aceite, recusa, cancelamento, reativação)

#### View
- [x] Tela de permissão de calendário (bloqueio até conceder)
- [x] Tela de permissão de notificações (bloqueio até conceder)

#### Components
- [x] Layout e mensagens de orientação para permissões

#### Navegação
- [x] Fluxo após login: calendário → notificações → home

#### DI Container
- [x] Registrar serviços reais (calendar + push) no DI

#### Documentação
- [x] Atualizar arquitetura e requisitos para refletir integrações reais

#### Testes
- [x] Testes unitários para serviços e use cases de push

### Critérios de Aceitação

- Notificações push chegam com o app fechado
- Eventos de calendário são criados ao aceitar consulta
- Eventos são removidos ao cancelar/recusar
- Fluxo de permissões bloqueia uso do app até liberar
- Tokens são armazenados no usuário

### Notas Técnicas

- Push requer build nativo (development/release), não funciona no Expo Go
- O envio é feito via Supabase Edge Function

---

## SPRINT 6: Polimento e Testes Finais

**Duração:** 3-5 dias  
**Objetivo:** App pronto para uso com qualidade de produção

### Histórias de Usuário Relacionadas

> Todas as histórias das sprints anteriores devem estar completas. Esta sprint foca em qualidade e validação.

### Entregas

#### UX/UI
- [ ] Revisar consistência visual em todas as telas
- [ ] Ajustar espaçamentos e paddings
- [ ] Validar acessibilidade básica (tamanhos de fonte, contraste)
- [ ] Melhorar animações de transição
- [ ] Testar em diferentes tamanhos de tela (iOS/Android)

#### Components
- [ ] Revisar componentes compartilhados (estado vazio, cards, modais)

#### Navegação
- [ ] Validar rota inicial e redirecionamentos em todos os fluxos

#### Testes
- [ ] Testes de integração: fluxo completo paciente
  - Registro → Login → Ver disponibilidade → Solicitar → Ver minhas consultas
- [ ] Testes de integração: fluxo completo nutricionista
  - Login → Ver pendentes → Aceitar → Ver agenda → Cancelar
- [ ] Testes de edge cases:
  - Login com credenciais inválidas
  - Solicitar consulta em horário já ocupado
  - Cancelar consulta já cancelada
  - Aceitar consulta com conflito
- [ ] Testes de performance (listas com muitos itens)

#### Segurança
- [ ] Configurar regras de segurança do Firestore:
  - Paciente só vê/edita suas consultas
  - Nutricionista vê todas as consultas
  - Validar role no backend
- [ ] Configurar regras de Auth do Firebase
- [ ] Remover console.logs sensíveis
- [ ] Validar inputs no backend (regras do Firestore e/ou Supabase Edge Functions quando necessário)

#### Tratamento de Erros
- [ ] Erro de rede → mensagem + retry
- [ ] Erro de autenticação → logout + redirect login
- [ ] Erro de permissão → mensagem clara
- [ ] Timeout → loading infinito → erro

#### Documentação
- [ ] Atualizar README.md:
  - Instruções de instalação
  - Como configurar Firebase
  - Como rodar o projeto
  - Como fazer build
- [ ] Criar CONTRIBUTING.md (se open source)
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de build local (Xcode/Gradle) e credenciais

#### Build & Deploy
- [ ] Testar build de desenvolvimento
- [ ] Testar build de produção local (Xcode/Gradle)
- [ ] Validar app em dispositivo real (Android/iOS)
- [ ] Configurar CI/CD básico (opcional)

### Critérios de Aceitação

- App funciona sem crashes em cenários normais
- Fluxos principais testados end-to-end
- Regras de segurança do Firebase validadas
- README com instruções claras de setup
- App pode ser instalado em dispositivo real
- Performance aceitável (listas, navegação)
- Erros tratados de forma amigável
- Build de produção funcionando  

### Notas Técnicas

- Build local (Xcode/Gradle) com credenciais configuradas
- Testar em iOS Simulator e Android Emulator
- Validar regras do Firestore com Emulator Suite

---

## Checklist por Sprint

### Sprint 1
- [x] Estrutura de pastas criada
- [x] Firebase configurado
- [x] Login funcionando
- [x] Registro funcionando
- [x] Navegação por perfil funcionando
- [x] Testes passando

### Sprint 2
- [x] Calendário exibindo disponibilidade
- [x] Solicitação de consulta funcionando
- [x] Lista de consultas do paciente funcionando
- [x] Atualização em tempo real funcionando
- [x] Testes passando

### Sprint 3
- [x] Lista de pendentes funcionando
- [x] Aceitar consulta funcionando
- [x] Recusar consulta funcionando
- [x] Validação de conflito funcionando
- [x] Agenda da nutricionista funcionando
- [x] Testes passando

### Sprint 4
- [x] Cancelamento funcionando
- [x] Reativação funcionando
- [x] Pull-to-refresh em todas as listas
- [x] Tratamento de erros completo
- [x] Feedback visual em todas as ações
- [x] Testes passando

### Sprint 5
- [x] Calendário nativo funcionando
- [x] Push notifications funcionando
- [x] Permissões obrigatórias implementadas
- [x] Tokens armazenados no usuário
- [x] Testes passando

### Sprint 6
- [ ] UX revisado
- [ ] Testes de integração passando
- [ ] Regras de segurança configuradas
- [ ] README atualizado
- [ ] Build de produção funcionando
- [ ] App testado em dispositivo real