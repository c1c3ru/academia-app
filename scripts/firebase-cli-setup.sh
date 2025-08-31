#!/bin/bash

# 🔥 Script de Configuração Firebase via CLI
# Automatiza a criação de coleções e documentos no Firestore

echo "🔥 Configuração Firebase via Linha de Comando"
echo "============================================="

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instalando..."
    npm install -g firebase-tools
fi

# Fazer login no Firebase (se necessário)
echo "🔐 Verificando autenticação Firebase..."
firebase login --no-localhost

# Inicializar projeto Firebase
echo "📁 Inicializando projeto Firebase..."
firebase init firestore --project default

# Aplicar regras de segurança
echo "🔐 Aplicando regras de segurança..."
firebase deploy --only firestore:rules

# Executar script de criação de dados
echo "📊 Criando coleções e documentos iniciais..."
cd ..
node scripts/setup-firebase.js all

echo ""
echo "✅ Configuração concluída!"
echo "📱 Agora você pode testar o app"
