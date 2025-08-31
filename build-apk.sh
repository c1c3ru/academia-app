#!/bin/bash

# Script para build do APK com novos ícones
# Academia App - Build Script

echo "🏗️  Iniciando build do APK com novos ícones..."

# Configurar variáveis de ambiente
export NODE_ENV=production

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
cd android
./gradlew clean
cd ..

# Gerar recursos do Expo
echo "📱 Gerando recursos do Expo..."
npx expo export --platform android

# Build do APK release
echo "🔨 Construindo APK release..."
cd android
NODE_ENV=production ./gradlew assembleRelease

# Verificar se o APK foi gerado
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK gerado com sucesso!"
    echo "📍 Localização: android/$APK_PATH"
    
    # Mostrar informações do APK
    echo "📊 Informações do APK:"
    ls -lh "$APK_PATH"
    
    # Copiar APK para diretório raiz com nome mais amigável
    cp "$APK_PATH" "../academia-app-release.apk"
    echo "📋 APK copiado para: academia-app-release.apk"
else
    echo "❌ Erro: APK não foi gerado!"
    exit 1
fi

echo "🎉 Build concluído com sucesso!"
