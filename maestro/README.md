# Testes E2E com Maestro - Vitta App

## Instalação do Maestro

### macOS
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Verificar instalação
```bash
maestro --version
```

## Pré-requisitos

1. **iOS**: Xcode instalado e simulador disponível
2. **Android**: Android Studio com emulador configurado
3. **App buildado**: O app precisa estar instalado no simulador/emulador

### Build do App (Expo)

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Executar Testes

### Todos os testes
```bash
maestro test .maestro/flows/
```

### Teste específico
```bash
# Login do paciente
maestro test .maestro/flows/01_patient_login.yaml

# Agendamento de consulta
maestro test .maestro/flows/02_patient_schedule_appointment.yaml

# Nutricionista aceita consulta
maestro test .maestro/flows/03_nutritionist_accept_appointment.yaml
```

### Modo Studio (visual/interativo)
```bash
maestro studio
```

## Variáveis de Ambiente

Definidas em `config.yaml`:
- `PATIENT_EMAIL`: paciente@gmail.com
- `PATIENT_PASSWORD`: paciente1234
- `NUTRITIONIST_EMAIL`: nutricionista@gmail.com
- `NUTRITIONIST_PASSWORD`: nutri1234

## Dicas

1. **testID**: Todos os elementos clicáveis devem ter `testID` no React Native
2. **Regex**: Use `id: "time-slot-.*"` para selecionar por padrão
3. **Timeouts**: Ajuste timeouts para operações de rede (Firebase pode ser lento)
4. **Screenshots**: Use `takeScreenshot` para debug

## Troubleshooting

### App não encontrado
```bash
# Liste os apps instalados
maestro hierarchy

# Verifique se o bundleId está correto
# iOS: com.watusalen.vitta
# Android: com.watusalen.vitta
```

### Elemento não encontrado
```bash
# Use o Maestro Studio para inspecionar
maestro studio

# Ou capture a hierarquia
maestro hierarchy > hierarchy.txt
```