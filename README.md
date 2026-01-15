# Vitta - App de Agendamento Nutricional

Sistema de agendamento de consultas nutricionais desenvolvido com React Native + Expo Router + Firebase, com notificações push via Supabase e integração com calendário nativo.

## Sobre o Projeto

O Vitta facilita o agendamento de consultas entre pacientes e nutricionistas, oferecendo:

- **Para Pacientes**: Visualização de horários disponíveis, solicitação de consultas, acompanhamento de status, cancelamento
- **Para Nutricionistas**: Gestão de solicitações, confirmação/recusa, agenda diária, cancelamento e reativação
- **Conflitos**: Tela para resolver conflitos de horário (apenas consultas canceladas)
- **Integrações**: Calendário nativo, notificações push e lembretes do calendário

## Arquitetura

O projeto segue o padrão **MVVM Sofisticado** com separação clara de responsabilidades:

```
src/
├── app/              # Expo Router - Roteamento (sem lógica de negócio)
├── view/             # Interface do usuário
│   ├── pages/        # Telas (Patient, Nutritionist)
│   ├── components/   # Componentes reutilizáveis
│   └── themes/       # Tokens de design
├── viewmodel/        # ViewModels (estado e comandos da UI)
├── usecase/          # Casos de uso (regras de negócio)
├── model/            # Domínio
│   ├── entities/     # Entidades (User, Appointment)
│   ├── services/     # Interfaces de serviços
│   └── errors/       # Erros de domínio
├── infra/            # Implementações concretas
│   ├── firebase/     # Firebase Auth + Firestore
│   ├── calendar/     # Expo Calendar
│   └── notifications/# Expo Notifications + Supabase Edge
└── di/               # Injeção de dependências
```

## Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Xcode (iOS) e/ou Android Studio (Android) para builds nativos
- Conta Firebase configurada (Auth + Firestore)
- Conta Supabase configurada (push via Edge Function)

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie `.env` de exemplo (ou crie o arquivo)
   - Preencha as chaves:
     - `EXPO_PUBLIC_FIREBASE_API_KEY`
     - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
     - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `EXPO_PUBLIC_FIREBASE_APP_ID`
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. Inicie o app:
   ```bash
   npm start
   ```

### Builds nativos (necessário para push e calendário)

- iOS (debug):
  ```bash
  npx expo run:ios
  ```
- Android (debug):
  ```bash
  npx expo run:android
  ```

## Documentação

Toda a documentação do projeto está em `/docs`:

- **ARQUITETURA.md**: Padrões, estrutura e boas práticas
- **RF.md**: Requisitos Funcionais
- **RNF.md**: Requisitos Não Funcionais
- **UC.md**: Casos de Uso
- **TELAS.md**: Especificação de interfaces
- **HUN.md, HUP.md, HUS.md**: Histórias de Usuário
- **ERD.md**: Modelo de entidades e relacionamentos
- **COMPONENTES.md**: Diagramas e comunicação entre camadas

## Testes

```bash
npm test              # Rodar testes
npm run test:verbose  # Suítes
npm run test:coverage # Cobertura
```

## Scripts Disponíveis

- `npm start` - Inicia o servidor Expo
- `npm run android` - Abre no emulador Android
- `npm run ios` - Abre no simulador iOS
- `npm run web` - Abre no navegador
- `npm run lint` - Executa linting

## Princípios Arquiteturais

1. **Inversão de Dependência**: ViewModels e Use Cases dependem de interfaces, não de implementações
2. **Separação de Camadas**: View não conhece Firebase, ViewModel não conhece React Native diretamente
3. **Testabilidade**: Injeção de dependências permite testes com mocks
4. **Single Responsibility**: Cada camada tem uma responsabilidade clara

## Stack Tecnológica

- **Framework**: React Native + Expo
- **Roteamento**: Expo Router (file-based)
- **Backend**: Firebase (Auth + Firestore)
- **Notificações**: Expo Notifications + Supabase Edge Function
- **Calendário**: Expo Calendar
- **Linguagem**: TypeScript
- **Testes**: Jest + React Native Testing Library

## Perfis de Usuário

- **Paciente**: Pode se auto-registrar, visualizar disponibilidade, solicitar consultas
- **Nutricionista**: Gerencia solicitações, confirma/recusa consultas, visualiza agenda
