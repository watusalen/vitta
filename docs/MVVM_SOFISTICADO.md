# MVVM Sofisticado com React Native, TypeScript e Expo

Este capítulo evolui o MVVM Simplificado para uma versão mais robusta, inspirada em
Clean Architecture, DIP e testabilidade. O objetivo é reduzir acoplamento e preparar o
projeto para escala.

## Objetivos de aprendizagem
- Compreender os princípios do MVVM Sofisticado.
- Diferenciar entidades, repositórios, serviços e use cases.
- Implementar Use Cases com inversão de dependência.
- Criar ViewModels que dependem apenas de abstrações.
- Organizar o projeto em camadas bem definidas.
- Configurar fábricas/DI para compor camadas.
- Escrever Views simples e desacopladas (state + actions).

## Do MVVM Simplificado ao MVVM Sofisticado
No modelo simplificado, a ViewModel concentrava estado, ações e algumas regras de negócio.
Isso melhora o “big tripe”, mas ainda:
- Dificulta testes unitários.
- Faz a ViewModel conhecer detalhes do Model.
- Não centraliza regras de negócio.
- Torna difícil trocar infraestrutura (ex.: Firebase → Supabase).

O MVVM Sofisticado move regras para Use Cases e exige dependência por abstrações.

## Camadas do MVVM Sofisticado
Fluxo de dependências:
View → ViewModel → Use Cases → Domínio

1. **View**
   - React Native: renderização e interação.
   - Recebe apenas **state** e **actions**.
   - Não acessa Use Cases, serviços ou repositórios.

2. **ViewModel**
   - Gerencia estado da tela e expõe ações.
   - Depende apenas de interfaces de Use Case.
   - Não implementa regra de negócio.

3. **Use Cases**
   - Representam o que a aplicação faz.
   - Orquestram regras de negócio.
   - Trabalham apenas com interfaces (DIP).

4. **Domínio (Model)**
   - Entidades puras.
   - Interfaces de serviços e repositórios.
   - Interfaces/implementações de Use Cases.
   - Sem dependências externas (React, Expo, Firebase, etc.).

5. **Infraestrutura**
   - Implementações concretas de serviços e repositórios.
   - Não vaza erros específicos; converte para erros de domínio.

## Use Cases (interfaces e implementações)
### Interface do Use Case
As interfaces são o contrato conhecido pelas ViewModels.

Exemplo:
```ts
import User from "../model/entities/user";

export interface IAuthUseCases {
  login(userName: string, password: string): Promise<User>;
  signup(userName: string, password: string): Promise<User>;
  logout(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): void;
}
```

### Implementação do Use Case
O Use Case orquestra e aplica regras de negócio. Depende apenas de interfaces.

```ts
import User from "../model/entities/user";
import { ValidationError } from "../model/errors/validationError";
import { IAuthService } from "../model/services/iAuthService";
import { IAuthUseCases } from "./iAuthUseCases";

export class AuthUseCases implements IAuthUseCases {
  constructor(private authService: IAuthService) {}

  async login(userName: string, password: string): Promise<User> {
    AuthValidator.validateLogin(userName, password);
    return this.authService.login(userName, password);
  }

  async signup(userName: string, password: string): Promise<User> {
    AuthValidator.validateSignup(userName, password);
    return this.authService.signup(userName, password);
  }

  async logout(): Promise<void> {
    return this.authService.logout();
  }

  onAuthStateChanged(callback: (user: User | null) => void): void {
    this.authService.onAuthStateChanged(callback);
  }
}
```

## ViewModel no MVVM Sofisticado
ViewModel:
- Não implementa regra de negócio.
- Depende apenas de interfaces de Use Case.
- Converte erros em estados para a View.

Exemplo:
```ts
import { useState } from "react";
import { IAuthenticateUserUseCase } from "../domain/usecases/IAuthenticateUserUseCase";

export type LoginState = {
  userId: string | null;
  loading: boolean;
  error: string | null;
};

export type LoginActions = {
  handleLogin: (email: string, password: string) => Promise<void>;
};

export function useLoginViewModel(
  authenticateUser: IAuthenticateUserUseCase
): LoginState & LoginActions {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await authenticateUser.execute(email, password);
      setUserId(user.uID);
    } catch (err: any) {
      setError(err.message ?? "Falha inesperada.");
    } finally {
      setLoading(false);
    }
  }

  return { userId, loading, error, handleLogin };
}
```

## View consumindo ViewModel
View:
- Renderiza e chama actions.
- Não faz try/catch.
- Não conhece Use Cases/serviços.

```ts
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import { makeLoginViewModel } from "../di/loginFactory";

export default function LoginScreen() {
  const vm = makeLoginViewModel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (vm.userId) router.replace("/home");
  }, [vm.userId]);

  if (vm.loading) return <Text>loading...</Text>;

  return (
    <View style={styles.container}>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="login" onPress={() => vm.handleLogin(email, password)} />
      {vm.error && <Text style={styles.error}>{vm.error}</Text>}
    </View>
  );
}
```

## Injeção de Dependências
Fábricas simples já resolvem:

```ts
import { FirebaseAuthService } from "../infrastructure/services/FirebaseAuthService";
import { FirestoreUserRepository } from "../infrastructure/repositories/FirestoreUserRepository";
import { AuthenticateUserUseCase } from "../domain/usecases/AuthenticateUserUseCase";
import { useLoginViewModel } from "../viewmodel/useLoginViewModel";

export function makeLoginViewModel() {
  const authService = new FirebaseAuthService();
  const userRepo = new FirestoreUserRepository();
  const usecase = new AuthenticateUserUseCase(authService, userRepo);
  return useLoginViewModel(usecase);
}
```

## Tratamento de erros
Fluxo:
1) Infra captura erro específico
2) Converte para erro de domínio
3) Use Case mapeia regra
4) ViewModel traduz para estado
5) View exibe

## Testabilidade
- Use Cases: mocks de serviços/repositórios.
- ViewModels: mocks de Use Cases.
- View: testes de renderização e ações.

## Conclusão
O MVVM Sofisticado:
- Reduz acoplamento.
- Aumenta testabilidade.
- Separa regras de negócio em Use Cases.
- Permite trocar infraestrutura sem quebrar camadas superiores.
