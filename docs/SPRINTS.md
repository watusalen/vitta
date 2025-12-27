<!--
Objetivo: Definir o planejamento de sprints do projeto.
Escopo: Entregas incrementais, priorização e cronograma de desenvolvimento.
-->

# Planejamento de Sprints - Vitta

App de Agendamento de Consultas Nutricionais  
React Native + Expo + Firebase

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

As integrações complexas (notificações push e calendário nativo) serão implementadas com implementações stub, permitindo que o app seja 100% funcional enquanto mantém a arquitetura preparada para futuras integrações reais.

---

## Cronograma Executivo

| Sprint | Duração | Foco Principal | Valor Entregue | Criticidade |
|--------|---------|---|---|---|
| 1 | 1-2 sem | Autenticação e Fundação | Estrutura base + Login | Essencial |
| 2 | 1-2 sem | Gestão Paciente | Solicitações de Consulta | Essencial |
| 3 | 1-2 sem | Gestão Nutricionista | Aceitação/Recusa de Consultas | Essencial |
| 4 | 1 sem | Cancelamento e UX | Refinamentos Funcionais | Essencial |
| 5 | 3-5 dias | Integrações Stub | Arquitetura Futura | Opcional |
| 6 | 3-5 dias | Polimento Final | Qualidade Produção | Essencial |

**Duração Total Estimada:** 5-8 semanas  
**MVP Funcional:** Sprints 1-4 (4-6 semanas)

---

## SPRINT 1: Fundação e Autenticação

**Duração:** 1-2 semanas  
**Objetivo:** Estruturar base do projeto e implementar autenticação funcional

### Histórias de Usuário Relacionadas

- [x] [P01](./HUP.md) - Paciente: Registrar no aplicativo com nome, e-mail e senha

### Entregas

#### Domínio (Model)
- [x] Entidade `User` (id, email, name, role: "patient" | "nutritionist", createdAt)
- [x] Entidade `Appointment` (id, patientId, nutritionistId, date, timeStart, timeEnd, status, observations?, createdAt, updatedAt)
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

**Cobertura:**
- Statements: 92.42%
- Branches: 88.57%
- Functions: 100%
- Lines: 92.42%

### Critérios de Aceitação

- [x] Paciente consegue se registrar com nome, email e senha
- [x] Paciente e nutricionista fazem login com credenciais válidas
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
- [x] Factory `makeAppointment` (patientId, nutritionistId, date, timeStart, timeEnd, observations?)
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
- [x] `RequestAppointmentUseCase` (validar slot disponível + capturar observações opcionais do paciente + criar)
- [x] `ListPatientAppointmentsUseCase` (buscar por patientId, ordenar por data)
- [x] `GetAppointmentDetailsUseCase` (buscar por id)

#### ViewModel
- [x] `useScheduleViewModel` (availableSlots, selectedDate, selectedTime, observations, loading)
- [x] `useMyAppointmentsViewModel` (appointments list, loading, refresh)
- [x] `useAppointmentDetailsViewModel` (appointment, loading)
- [x] Hooks correspondentes para as Views

#### View
- [x] Tela: `ScheduleScreen.tsx` (calendário + seleção de horário)
  - [x] Integrar `react-native-calendars`
  - [x] Marcar dias úteis disponíveis
  - [x] Listar slots do dia selecionado
  - [x] Text input opcional para observações (capturadas do paciente)
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

#### Testes
- [x] Testes: `GetAvailableTimeSlotsUseCase` (fins de semana, slots ocupados)
- [x] Testes: `RequestAppointmentUseCase` (validações)
- [x] Testes: ViewModels

### Critérios de Aceitação

- [x] Paciente vê calendário mensal com dias úteis disponíveis
- [x] Fins de semana aparecem desabilitados
- [x] Ao clicar em dia, vê slots: 9-11h, 11-13h, 13-15h, 14-16h
- [x] Horários ocupados não aparecem na lista
- [x] Paciente seleciona horário e solicita consulta
- [x] Consulta criada com status "pending"
- [x] Paciente vê lista de suas consultas com status colorido
- [x] Atualização em tempo real (Firebase listeners)

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
  - Calendário com consultas aceitas
  - Dias com consulta marcados (verde)
  - Lista de consultas do dia selecionado
  - Filtros: Todos, Esta Semana, Hoje
- [x] Tela: `NutritionistAppointmentDetailsScreen.tsx`
  - Detalhes completos
  - Ações: Aceitar, Recusar (se pendente)
  - Aviso de conflito de horário

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
- Agenda mostra apenas consultas aceitas em calendário
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

- [ ] [P08](./HUP.md) - Paciente: Cancelar consulta aceita
- [ ] [N06](./HUN.md) - Nutricionista: Cancelar consulta já aceita
- [ ] [N07](./HUN.md) - Nutricionista: Reativar consulta cancelada

### Entregas

#### Casos de Uso
- [ ] `CancelAppointmentUseCase` (paciente ou nutricionista)
  - Validar que consulta está "accepted" ou "pending"
  - Atualizar status para "cancelled"
- [ ] `ReactivateAppointmentUseCase` (nutricionista apenas)
  - Validar que consulta está "cancelled"
  - Verificar conflito de horário
  - Atualizar status para "accepted"

#### View - Melhorias
- [ ] Botão "Cancelar Consulta" em `AppointmentDetailsScreen` (paciente)
  - Apenas para status: pending ou accepted
  - Modal de confirmação
- [ ] Botão "Cancelar Consulta" em `NutritionistAppointmentDetailsScreen` (nutricionista)
  - Apenas para status: accepted
  - Modal de confirmação
- [ ] Botão "Aceitar Novamente" em `NutritionistAppointmentDetailsScreen`
  - Apenas para status: cancelled
  - Verificar conflito antes de aceitar
- [ ] Pull-to-refresh em TODAS as listas
- [ ] Estados de loading em todas as telas
- [ ] Tratamento de erro com mensagens amigáveis
- [ ] Feedback visual (toasts/alerts) para sucesso/erro

#### Componentes Reutilizáveis
- [ ] `ConfirmationModal` (título, mensagem, ações)
- [ ] `ErrorMessage` (mensagem + retry)
- [ ] `EmptyState` (mensagem quando lista vazia)
- [ ] `LoadingIndicator` (spinner centralizado)

#### Validações
- [ ] Validar formulário de registro (email, senha, nome)
- [ ] Validar seleção de horário antes de solicitar
- [ ] Sanitizar inputs

#### Testes
- [ ] Testes: `CancelAppointmentUseCase`
- [ ] Testes: `ReactivateAppointmentUseCase`
- [ ] Testes de integração: fluxo completo paciente
- [ ] Testes de integração: fluxo completo nutricionista

### Critérios de Aceitação

- Paciente cancela consulta aceita (status → "cancelled")
- Nutricionista cancela consulta aceita
- Nutricionista reativa consulta cancelada (verifica conflitos)
- Modais de confirmação antes de ações críticas
- Todas as listas têm pull-to-refresh
- Loading é mostrado durante operações
- Erros são tratados com mensagens claras
- Feedback visual em todas as ações
- App não quebra em cenários de erro  

### Notas Técnicas

- Usar biblioteca de toast/snackbar (ex: `react-native-toast-message`)
- Implementar debounce em ações críticas
- Garantir que listeners do Firebase sejam limpos (cleanup)

---

## SPRINT 5: Integrações Stub (Arquitetura Futura)

**Duração:** 3-5 dias  
**Objetivo:** Preparar arquitetura para integrações futuras com implementações stub

### Histórias de Usuário Relacionadas

- [ ] [P06](./HUP.md) - Paciente: Adicionar consulta ao calendário do celular (stub)
- [ ] [P07](./HUP.md) - Paciente: Receber notificações de lembrete (stub)
- [ ] [N05](./HUN.md) - Nutricionista: Adicionar consultas ao calendário (stub)
- [ ] [S03](./HUS.md) - Sistema: Agendar notificações locais (stub)

### Entregas

#### Domínio (Model)
- [ ] Interface `INotificationProvider`
  - `scheduleReminder(appointmentId, date, time): Promise<void>`
  - `cancelReminder(appointmentId): Promise<void>`
  - `sendStatusUpdate(userId, message): Promise<void>`
- [ ] Interface `ICalendarProvider`
  - `addEvent(title, date, time, duration): Promise<string>`
  - `removeEvent(eventId): Promise<void>`
  - `requestPermission(): Promise<boolean>`

#### Infraestrutura - Stubs
- [ ] `StubNotificationProvider` (implementa `INotificationProvider`)
  - Apenas loga no console: `"[Stub] Notificação: lembrete agendado para..."`
  - Simula sucesso sempre
- [ ] `StubCalendarProvider` (implementa `ICalendarProvider`)
  - Apenas loga no console: `"[Stub] Calendário: evento criado para..."`
  - Retorna ID fake
  - Simula permissão concedida

#### Integração nos Use Cases
- [ ] `AcceptAppointmentUseCase` → chamar `notificationProvider.scheduleReminder()`
- [ ] `AcceptAppointmentUseCase` → chamar `calendarProvider.addEvent()`
- [ ] `CancelAppointmentUseCase` → chamar `notificationProvider.cancelReminder()`
- [ ] `CancelAppointmentUseCase` → chamar `calendarProvider.removeEvent()`

#### DI Container
- [ ] Registrar `StubNotificationProvider` como implementação de `INotificationProvider`
- [ ] Registrar `StubCalendarProvider` como implementação de `ICalendarProvider`
- [ ] Documentar como trocar stub por implementação real

#### Documentação
- [ ] Guia: "Como Implementar Notificações Reais" (expo-notifications)
- [ ] Guia: "Como Implementar Calendário Real" (expo-calendar)
- [ ] Atualizar ARQUITETURA.md com seção de stubs

#### Testes
- [ ] Testes: Use Cases com mocks de providers
- [ ] Verificar que stubs são chamados corretamente

### Critérios de Aceitação

- Interfaces de providers definidas no domínio
- Stubs implementados e registrados no DI
- Console mostra logs simulando ações (notificações, calendário)
- Use Cases chamam providers sem saber que são stubs
- Arquitetura permite trocar stub por implementação real facilmente
- Documentação clara de como implementar versões reais  

### Notas Técnicas

- Stubs são apenas para preparar a arquitetura, não fazem nada real
- Logs devem ser claros: `[Stub]` no início
- Em produção futura, basta trocar no DI Container

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
- [ ] Validar inputs no backend (Cloud Functions se necessário)

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
- [ ] Criar guia de deploy (Expo EAS)

#### Build & Deploy
- [ ] Testar build de desenvolvimento
- [ ] Testar build de produção (Expo EAS)
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

- Usar Expo EAS para builds
- Testar em iOS Simulator e Android Emulator
- Validar regras do Firestore com Emulator Suite

---

## Definição de MVP

### MVP Mínimo (Sprints 1-4)

O app estará **100% funcional** para uso real após Sprint 4:

**Funcionalidades Incluídas:**
-  Autenticação (login/registro)
-  Visualização de disponibilidade (calendário)
-  Solicitação de consultas
-  Aceitar/Recusar consultas
-  Cancelamento de consultas
-  Reativação de consultas (nutricionista)
-  Agendas funcionais (paciente e nutricionista)
-  Atualização em tempo real

**Não Incluído no MVP:**
-  Notificações push reais (apenas stubs)
-  Integração com calendário nativo (apenas stubs)
-  Edição de perfil
-  Recuperação de senha

**Tempo Estimado:** 4-6 semanas

---

## Roadmap Pós-MVP

### Fase 2: Integrações Reais (Futuro)

Quando viável implementar:

1. **Notificações Push**
   - Substituir `StubNotificationProvider` por `ExpoNotificationProvider`
   - Implementar lembretes (24h e 1h antes)
   - Notificações de mudança de status

2. **Calendário Nativo**
   - Substituir `StubCalendarProvider` por `ExpoCalendarProvider`
   - Solicitar permissões
   - Sincronizar eventos automaticamente

3. **Melhorias de UX**
   - Recuperação de senha
   - Edição de perfil
   - Upload de foto de perfil
   - Histórico de consultas

4. **Admin/Nutricionista**
   - Dashboard com estatísticas
   - Relatórios de consultas
   - Gestão de disponibilidade pelo app

---

## Checklist por Sprint

### Sprint 1
- [ ] Estrutura de pastas criada
- [ ] Firebase configurado
- [ ] Login funcionando
- [ ] Registro funcionando
- [ ] Navegação por perfil funcionando
- [ ] Testes passando

### Sprint 2
- [ ] Calendário exibindo disponibilidade
- [ ] Solicitação de consulta funcionando
- [ ] Lista de consultas do paciente funcionando
- [ ] Atualização em tempo real funcionando
- [ ] Testes passando

### Sprint 3
- [ ] Lista de pendentes funcionando
- [ ] Aceitar consulta funcionando
- [ ] Recusar consulta funcionando
- [ ] Validação de conflito funcionando
- [ ] Agenda da nutricionista funcionando
- [ ] Testes passando

### Sprint 4
- [ ] Cancelamento funcionando
- [ ] Reativação funcionando
- [ ] Pull-to-refresh em todas as listas
- [ ] Tratamento de erros completo
- [ ] Feedback visual em todas as ações
- [ ] Testes passando

### Sprint 5
- [ ] Interfaces de providers criadas
- [ ] Stubs implementados
- [ ] Use Cases integrados com stubs
- [ ] Documentação de implementação futura
- [ ] Testes passando

### Sprint 6
- [ ] UX revisado
- [ ] Testes de integração passando
- [ ] Regras de segurança configuradas
- [ ] README atualizado
- [ ] Build de produção funcionando
- [ ] App testado em dispositivo real

---

## Notas Importantes

### Priorização

**Alta Prioridade (MVP):**
- Sprints 1, 2, 3, 4

**Média Prioridade:**
- Sprint 6 (polimento)

**Baixa Prioridade (Opcional):**
- Sprint 5 (stubs)

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Complexidade do Firebase | Alto | Estudar documentação antes de começar |
| Validação de conflitos | Médio | Usar transactions do Firestore |
| Performance de listas | Médio | Implementar paginação se necessário |
| Testes complexos | Baixo | Começar com testes simples |

### Dependências Técnicas

- **React Native + Expo SDK 52+**
- **Firebase (Auth + Firestore)**
- **react-native-calendars**
- **TypeScript**
- **Jest + Testing Library**

---

## Meta Final

Após completar as sprints do MVP (1-4), o app estará:

- Funcional para uso real
- Testado com cobertura adequada
- Seguro com regras do Firebase
- Preparado para futuras integrações
- Documentado para manutenção
