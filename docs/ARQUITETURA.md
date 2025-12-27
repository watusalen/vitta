<!--
Objetivo: Definir a arquitetura e padrões de desenvolvimento do projeto.
Escopo: Estrutura de código, organização de camadas e boas práticas.
-->

# Guia de Arquitetura do Projeto

**App de Agendamento de Consultas Nutricionais**  
*React Native + Expo + Firebase*

---

## 1. Objetivo da Arquitetura

Este documento estabelece a organização do código e as boas práticas a serem seguidas no desenvolvimento do aplicativo de agendamento de consultas nutricionais.

### Principais objetivos:
- Aplicar o padrão **MVVM simplificado** em React Native
- Garantir **separação de responsabilidades** (View, ViewModel, Model, Use Case, Infra, DI)
- Facilitar **testes automatizados** (unitários e de integração)
- Implementar **Inversão de Dependência** (DIP) e **Injeção de Dependência** (via construtor/fábricas)
- Evitar código monolítico ("Big Tripe" - tudo junto na tela)

Este guia deve ser seguido por todos os desenvolvedores e agentes que contribuírem com este projeto.

---

## 2. Padrão MVVM no Projeto (Sofisticado)

Adotamos o **MVVM Sofisticado** com camadas claras e independentes:

### **View (React Native)**
- `src/app` usa Expo Router para roteamento.
- `src/view` contém páginas e componentes de UI.
- A View recebe apenas **state** e **actions** da ViewModel.
- Não acessa Use Cases, serviços ou repositórios diretamente.

### **ViewModel**
- Intermediária entre View e Use Cases.
- Gerencia estado da UI (loading, erros, dados) e expõe comandos.
- Depende apenas de **interfaces de Use Cases** (injeção via DI).
- Não contém regras de negócio.

### **Use Case**
- Vive em `src/usecase`.
- Contém interfaces e implementações.
- Implementa regras de negócio e orquestra o fluxo entre entidades e interfaces de serviços.
- Independente de UI e de implementações concretas (infra).

### **Model (Domínio)**
- Entidades (`User`, `Appointment`, etc.).
- Contratos/Interfaces para serviços externos e repositórios (ex.: `IAuthService`, `IAppointmentRepository`).
- Definições de erros de domínio.

### **Infra**
- Implementações concretas das interfaces de domínio (Firebase, calendário, notificações, etc.).
- Não vaza detalhes de tecnologia para o domínio.

### **Dependency Injection (DI)**
- `src/di` monta dependências.
- View consome **hooks de ViewModel já injetados** (ex.: factories/containers) sem acessar Use Cases.

### Princípio Central:
> A **ViewModel** depende apenas de **interfaces de Use Cases**, e a View só conhece **state/actions**. As dependências são injetadas via DI.

---

## 3. Estrutura de Pastas

O código do projeto está organizado no diretório `/src`. O **Expo Router** fica em `src/app`
para rotas, e as páginas/componentes ficam em `src/view`.

```
src/
├─ app/                      # Expo Router - rotas (sem regra de negócio)
│  ├─ _layout.tsx
│  └─ (arquivos de rota)     # mapeiam para páginas em src/view/pages
├─ view/                     # UI (páginas e componentes)
│  ├─ pages/
│  │   ├─ patient/
│  │   └─ nutritionist/
│  ├─ components/
│  └─ themes/
├─ viewmodel/                # ViewModels (hooks)
├─ usecase/                  # Use Cases (interfaces + implementações)
├─ model/                    # Domínio (puro)
│  ├─ entities/
│  ├─ factories/
│  ├─ services/
│  ├─ repositories/
│  └─ errors/
├─ infra/                    # Implementações concretas
│  ├─ firebase/
│  ├─ notifications/
│  └─ calendar/
├─ di/                       # Injeção de dependências
│  ├─ container.ts
│  └─ viewmodelContainer.ts  # Fábricas de ViewModels
└─ tests/
  ├─ unit/
  │   ├─ model/
  │   ├─ usecase/
  │   └─ viewmodel/
  └─ integration/
```

### 3.1 Factories vs DI Container

O projeto usa dois tipos de "fábricas" com propósitos distintos:

| Local | Propósito | Exemplo |
|-------|-----------|---------|
| `model/factories/` | Criar **entidades de domínio** com validações | `makeUser()`, `makeAppointment()`, `makeTimeSlot()` |
| `di/container.ts` | Montar **dependências** (Use Cases, ViewModels, Repositórios) | `makeRequestAppointmentUseCase()` |

**Factories de Entidade (`model/factories/`):**
- Encapsulam lógica de criação de objetos de domínio
- Aplicam validações e valores default
- Retornam entidades prontas para uso

```typescript
// model/factories/makeUser.ts
export function makeUser(input: CreateUserInput): User {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role,
    createdAt: new Date(),
  };
}

// model/factories/makeAppointment.ts
export function makeAppointment(input: CreateAppointmentInput): Appointment {
  return {
    id: crypto.randomUUID(),
    patientId: input.patientId,
    nutritionistId: input.nutritionistId,
    date: input.date,
    timeStart: input.timeStart,
    timeEnd: input.timeEnd,
    status: 'pending',
    observations: input.observations ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// model/factories/makeTimeSlot.ts
export function makeTimeSlot(input: CreateTimeSlotInput): TimeSlot {
  return {
    date: input.date,
    timeStart: input.timeStart,
    timeEnd: input.timeEnd,
    available: input.available ?? true,
  };
}
```

**DI Container (`di/container.ts`):**
- Monta árvore de dependências
- Injeta repositórios e providers nos Use Cases
- Injeta Use Cases nas ViewModels

```typescript
// di/container.ts
export function makeRequestAppointmentUseCase(): RequestAppointmentUseCase {
  const appointmentRepository = new FirebaseAppointmentRepository();
  return new RequestAppointmentUseCase(appointmentRepository);
}
```

---

## 4. Inversão de Dependência e Injeção por Construtor

### 4.1 Princípio

- **Interfaces** vivem no domínio (`model/services` ou equivalente)
- **Implementações concretas** vivem em `infra/`
- **ViewModel** depende da interface, recebida via construtor

### 4.2 Exemplo Conceitual

#### Interface de domínio:
```typescript
// model/services/IAppointmentRepository.ts
export interface IAppointmentRepository {
  requestAppointment(data: RequestAppointmentDTO): Promise<void>;
  listPatientAppointments(patientId: string): Promise<Appointment[]>;
  listNutritionistPending(nutritionistId: string): Promise<Appointment[]>;
  acceptAppointment(id: string): Promise<void>;
}
```

#### Implementação na infraestrutura:
```typescript
// infra/firebase/FirebaseAppointmentRepository.ts
export class FirebaseAppointmentRepository implements IAppointmentRepository {
  /* Implementa os métodos usando Firebase */
}
```

#### Caso de uso (regra de negócio):
```typescript
// usecase/RequestAppointmentUseCase.ts
export class RequestAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository
  ) {}

  async execute(input: RequestAppointmentDTO): Promise<void> {
    // Regras de negócio (validações, conflitos, etc.)
    await this.appointmentRepository.requestAppointment(input);
  }
}
```

#### ViewModel usando injeção via construtor:
```typescript
// viewmodel/PatientScheduleViewModel.ts
export class PatientScheduleViewModel {
  constructor(
    private readonly requestAppointment: RequestAppointmentUseCase
  ) {}

  async handleRequestAppointment(/* dados da tela */) {
    await this.requestAppointment.execute(/* dados */);
    // Tratar estado, erros, feedback de sucesso
  }
}
```

### 4.3 Hook como Adaptador da ViewModel

O Hook (ex.: `usePatientScheduleViewModel`) apenas:
- Cria uma instância da ViewModel com as dependências corretas
- Gerencia estado de React (`useState`/`useEffect`)
- Chama os métodos da ViewModel

**Benefícios:**
- Testar a ViewModel isoladamente (apenas classes TypeScript)
- Injetar mocks das interfaces nos testes
- Manter a integração fácil com React Native

---

## 5. Ferramentas e Boas Práticas de Teste

### 5.1 Stack de Testes

- **Jest**: testes unitários e de integração
- **@testing-library/react-native**: testes de componentes / Views
- **Mocks**: `jest.fn()` ou mocks manuais para repositórios e providers

### 5.2 O que Testar

#### **Model / Use Cases (Domínio)**
- Regras de negócio (ex.: impedir duas consultas no mesmo horário)
- Casos de uso: Login, Solicitar Consulta, Aceitar Consulta
- Independentes de Firebase, notificações, calendário

#### **ViewModels**
- Mudanças de estado (loading, erro, sucesso)
- Comportamento frente a respostas dos serviços
- Usando repositórios / serviços mockados

#### **Views (telas)**
- Renderizam o estado corretamente
- Chamam ações certas quando o usuário interage
- Não precisam saber nada de Firebase

### 5.3 Organização dos Testes

```
tests/
  unit/
    usecase/
    viewmodel/
  integration/
    views/
```

### 5.4 Boas Práticas de Teste

- Cada teste deve focar em **um comportamento específico**
- Não testar detalhes de implementação desnecessários
- Evitar acessar Firebase real em testes unitários (usar mocks)
- Nomear testes de forma descritiva:
  - Exemplo: `should_not_accept_two_appointments_at_same_time_for_same_nutritionist`

---

## 6. Boas Práticas Gerais do Projeto

### Views "burras"
- Apenas exibem dados e disparam ações da ViewModel
- Sem lógica de negócio, sem `if` aninhado pesado

### Tipos e Entidades Bem Definidas
- Usar TypeScript em todas as camadas
- Entidades como `Appointment`, `User` devem estar em `model/entities`

### Naming Consistente
- **ViewModel**: `SomethingViewModel.ts` e hook `useSomethingViewModel.ts`
- **Repositórios/Serviços (contratos)**: `IAppointmentRepository`, `IAuthService`
- **Use Cases**: `ActionNameUseCase` (ex.: `RequestAppointmentUseCase`)

### Tratamento de Erros
- Serviços de domínio podem lançar erros específicos (`DomainError`, `ValidationError`)
- ViewModel traduz erros em mensagens amigáveis para a View

### Sem "Big Tripe"
- **Proibido** criar tela com: UI + regra de negócio + chamada Firebase tudo junto
- Se surgir, refatorar para MVVM + domínio + infra

### Configuração Centralizada
`di/container.ts` deve expor funções/fábricas para instanciar:
- Repositórios concretos
- Use Cases
- ViewModels (quando necessário)

---

## 7. Fluxo de Desenvolvimento de Funcionalidades

Sempre que for adicionar uma nova funcionalidade:

### 1. Comece pelo Domínio
- Precisa de nova entidade ou campo?
- Precisa de um novo caso de uso (Service)?

### 2. Crie/Atualize Interfaces de Repositório
- Métodos necessários para a funcionalidade

### 3. Implemente na Infraestrutura
- Firebase, expo-calendar, expo-notifications, etc.

### 4. Crie/Ajuste a ViewModel
- Injetando os casos de uso via construtor
- Preparando estados e actions para a View

### 5. Implemente a View
- Consumindo a ViewModel via Hook

### 6. Escreva Testes
- Unitário para o serviço
- Unitário para a ViewModel (com mocks)
- Opcionalmente de integração para a View

---

## 8. Firebase, Notificações e Calendário

### Firebase Auth / Firestore
- Somente acessado em `infra/firebase/`
- Regras de segurança configuradas para isolar dados por usuário

### Notificações (expo-notifications)
- Encapsuladas em `INotificationProvider` + `ExpoNotificationProvider`

### Calendário (expo-calendar)
- Encapsulado em `ICalendarProvider` + `ExpoCalendarProvider`
- Pedir permissão e lidar com negativa de forma graciosa (sem quebrar o app)

---

## 9. Configuração de Disponibilidade de Horários

### 9.1 Regras de Disponibilidade

A disponibilidade de horários para consultas é **configurada no código** (hardcoded) com as seguintes regras:

- **Dias disponíveis:** Segunda a Sexta-feira (dias úteis)
- **Horário de funcionamento:** 9h às 16h
- **Duração da consulta:** 2 horas cada
- **Slots de horário:**
  - 09:00 - 11:00
  - 11:00 - 13:00
  - 13:00 - 15:00
  - 14:00 - 16:00
- **Fins de semana:** Não disponíveis
- **Feriados:** Não há tratamento especial (futura implementação se necessário)

### 9.2 Implementação

A lógica de disponibilidade deve estar em:
- **Use Case:** `GetAvailableTimeSlotsUseCase` ou equivalente
- **Localização:** `src/usecase/`
- **Responsabilidade:** Gerar lista de slots disponíveis e filtrar os já ocupados

**Exemplo conceitual:**
```typescript
// usecase/GetAvailableTimeSlotsUseCase.ts
export class GetAvailableTimeSlotsUseCase {
  private readonly TIME_SLOTS = [
    { start: '09:00', end: '11:00' },
    { start: '11:00', end: '13:00' },
    { start: '13:00', end: '15:00' },
    { start: '14:00', end: '16:00' },
  ];

  constructor(
    private readonly appointmentRepository: IAppointmentRepository
  ) {}

  async execute(date: Date): Promise<TimeSlot[]> {
    // Verifica se é dia útil (seg-sex)
    if (isWeekend(date)) return [];
    
    // Busca consultas aceitas para aquela data
    const acceptedAppointments = await this.appointmentRepository
      .getAcceptedByDate(date);
    
    // Filtra slots já ocupados
    return this.TIME_SLOTS.filter(slot => 
      !acceptedAppointments.some(apt => 
        apt.time === slot.start
      )
    );
  }
}
```

### 9.3 Restrições

- **Não há edição de disponibilidade pelo usuário:** A configuração é fixa no código
- **Conflitos são verificados automaticamente:** Sistema não permite duas consultas aceitas no mesmo horário do mesmo dia
- **Paciente vê apenas slots livres:** Horários ocupados não aparecem na lista

---

## 10. Funcionalidades Não Implementadas

Para manter o escopo do projeto gerenciável, as seguintes funcionalidades **NÃO** serão implementadas:

### 10.1 Edição de Perfil
- Usuários não podem editar nome, e-mail ou outros dados
- Alterações devem ser feitas manualmente no Firebase Console

### 10.2 Recuperação de Senha
- Não há funcionalidade de "Esqueci minha senha" no app
- Redefinição de senha deve ser feita manualmente no Firebase Console

### 10.3 Gestão de Disponibilidade
- Nutricionista não pode alterar horários de funcionamento pelo app
- Mudanças na configuração de horários requerem alteração no código

---

## 11. Resumo

- O projeto segue **MVVM simplificado** com camadas claras
- **Domínio não conhece Firebase nem Expo**: apenas interfaces e regras de negócio
- **Inversão de dependência**: interfaces no domínio, implementações na infra
- **Injeção por construtor** permite:
  - Testes fáceis (mocks)
  - Substituição de implementações (ex.: trocar Firebase por outra solução)
- **Qualquer nova funcionalidade deve respeitar esta arquitetura** antes de ser implementada

---

## Referências

- [Padrão MVVM](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [Princípios SOLID](https://en.wikipedia.org/wiki/SOLID)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Testing Library React Native](https://callstack.github.io/react-native-testing-library/)
