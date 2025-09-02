
# 📱 Guia de Build para Google Play Store

## Pré-requisitos

1. **EAS CLI instalado**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login no EAS**:
   ```bash
   eas login
   ```

3. **Firebase configurado** (google-services.json)

## 🚀 Builds Disponíveis

### 1. Build para Desenvolvimento (APK)
```bash
npm run build:preview
```
- Gera APK para testes internos
- Permite debugging
- Ideal para desenvolvimento

### 2. Build para Google Play Store (AAB)
```bash
npm run build:android
```
- Gera Android App Bundle (AAB)
- Otimizado para Google Play Store
- Tamanho reduzido

### 3. Build APK para Distribuição Manual
```bash
npm run build:android:apk
```
- Gera APK para distribuição fora da loja
- Tamanho maior que AAB
- Funciona em qualquer dispositivo Android

## 📋 Checklist Pré-Build

- [ ] Firebase configurado corretamente
- [ ] Ícones e splash screen atualizados
- [ ] Versão incrementada no app.json
- [ ] Testado localmente: `npm run build:test`
- [ ] Todas as funcionalidades testadas

## 🏪 Publicar na Google Play Store

### 1. Preparar o AAB
```bash
npm run build:android
```

### 2. Baixar o arquivo AAB
- Acesse: https://expo.dev/builds
- Baixe o arquivo .aab gerado

### 3. Upload no Google Play Console
1. Acesse [Google Play Console](https://play.google.com/console)
2. Vá em "Releases" > "Production"
3. Clique em "Create new release"
4. Faça upload do arquivo .aab
5. Preencha as informações da release
6. Envie para review

## 🔄 Atualizações

Para atualizações:
1. Incremente a versão no `app.json`
2. Incremente o `versionCode` no Android
3. Execute novo build
4. Faça upload da nova versão

## 🛠️ Troubleshooting

### Erro de Build
```bash
# Limpar cache
expo r -c

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Testar novamente
npm run build:test
```

### Erro de Assinatura
- Verifique se o projeto EAS está configurado
- Confirme se está logado: `eas whoami`

### Erro de Firebase
- Verifique se `google-services.json` está correto
- Confirme se o package name é: `com.c1c3ru.academiaapp`

## 📊 Monitoramento

Após publicar:
- Monitore crashes no Firebase Crashlytics
- Verifique métricas no Google Play Console
- Colete feedback dos usuários

## 🔗 Links Úteis

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com)
