# Build iOS - Vitta

## Pré-requisitos

- **Node.js** ≥ 18
- **Xcode** ≥ 15
- **CocoaPods** (`sudo gem install cocoapods`)
- **Conta Apple Developer** (para dispositivo físico)

---

## Build Rápido

### Primeiro Build (dispositivo físico)

```bash
npm install
npx expo run:ios --device
```

Selecione seu dispositivo na lista e aguarde a compilação.

### Build Dia a Dia

```bash
npx expo run:ios --device
```

---

## Quando Usar Cada Comando

| Situação | Comando |
|----------|---------|
| Desenvolvimento normal | `npx expo run:ios --device` |
| App para produção/testes | `npx expo run:ios --configuration Release --device` |
| Simulador | `npx expo run:ios` |
| Reconstruir após mudanças nativas | `npx expo prebuild --clean && npx expo run:ios --device` |
> **Dica:** Use `npx expo prebuild --clean` sempre que:
> - Alterar ícone, splash, permissões, ou arquivos nativos (Info.plist, entitlements, etc.)
> - Atualizar dependências nativas (pacotes que usam código nativo)
> - O app não refletir mudanças visuais (ícone, splash, etc.) mesmo após rebuild
> Isso força o Expo a regenerar os arquivos nativos e garante que as mudanças sejam aplicadas.


## Troubleshooting

### Ícone não atualiza

1. Confirme se o campo `icon` no `app.json` aponta para o novo arquivo PNG (ex: "icon": "./assets/icon.png").
2. O arquivo deve ser quadrado (ex: 1024x1024), sem transparência.
3. Rode:

```bash
npx expo prebuild --clean && npx expo run:ios --device
```

4. Se não funcionar, apague o app do simulador/dispositivo e instale novamente.
5. Limpe o cache do Expo:

```bash
npx expo start -c
```

---

### Firebase/Firestore: WebChannelConnection errored

Esse aviso geralmente indica instabilidade de rede ou configuração incorreta do Firebase. Certifique-se de:
- Usar as credenciais corretas do Firebase (`firebaseConfig`)
- Ter internet estável
- Não estar usando emulador do Firebase sem rodar o serviço local
- O Firestore estar ativo no console do Firebase
Se o app funcionar normalmente, pode ser apenas um aviso transitório.

### Módulo não encontrado

```bash
rm -rf node_modules
npm install
```

### Erro de Pods

```bash
cd ios && pod install --repo-update && cd ..
```

### Erro de assinatura

1. Abra `ios/vitta.xcworkspace` no Xcode
2. Selecione o target **vitta**
3. Em **Signing & Capabilities**, selecione seu Team
4. Marque **Automatically manage signing**

### Reset completo

```bash
rm -rf node_modules ios/Pods ios/build
npm install
cd ios && pod install && cd ..
npx expo run:ios --device
```

---

## Registrar Novo Dispositivo

1. Conecte o iPhone via USB
2. Acesse [Apple Developer > Devices](https://developer.apple.com/account/resources/devices/list)
3. Clique em **+** e adicione o UDID do dispositivo
4. Atualize o provisioning profile no Xcode

---

## Publicar na App Store

```bash
npx expo run:ios --configuration Release --device
```

1. Abra `ios/vitta.xcworkspace` no Xcode
2. **Product > Archive**
3. **Distribute App > App Store Connect**