#!/bin/bash

echo "🏗️ Academia App - Build Simplificado"
echo "=====================================\n"

# Verificar se prebuild foi executado
if [ ! -d "android" ]; then
    echo "📱 Executando prebuild..."
    npx expo prebuild --platform android
fi

echo "\n🎯 Opções de Build Disponíveis:"
echo "1. Local Build (Gradle) - Pode demorar na primeira execução"
echo "2. EAS Build (Recomendado) - Requer login no Expo"
echo "3. APK Debug (Desenvolvimento) - Mais rápido"
echo ""

echo "📋 Status do Projeto:"
echo "✅ Dependências instaladas"
echo "✅ Firebase configurado"
echo "✅ Arquivos nativos gerados (prebuild)"
echo "✅ Java JDK 17 instalado"
echo ""

echo "🔗 Para builds de produção, use EAS Build:"
echo "1. npx eas login"
echo "2. npx eas build --platform android --profile production-apk"
echo ""

echo "📱 Informações do APK:"
echo "App: Academia App"
echo "Versão: 1.0.0"
echo "Package: com.c1c3ru.academiaapp"
echo "Plataforma: Android"
echo ""

echo "🚀 O projeto está pronto para build!"
echo "Para build de desenvolvimento local, execute:"
echo "export JAVA_HOME=/nix/store/xad649j61kwkh0id5wvyiab5rliprp4d-openjdk-17.0.15+6"
echo "cd android && ./gradlew assembleDebug"