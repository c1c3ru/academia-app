#!/bin/bash

# Script simples para merge desenvolvimento → master
# Uso: ./merge-dev-to-master.sh

echo "🚀 Iniciando merge desenvolvimento → master..."

# Verificar se estamos em um repo Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git!"
    exit 1
fi

# Salvar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

# Verificar se há mudanças não salvas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Há mudanças não commitadas. Commitando automaticamente..."
    git add .
    git commit -m "chore: auto-commit antes do merge - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Ir para desenvolvimento e atualizar
echo "🔄 Atualizando branch desenvolvimento..."
git checkout desenvolvimento
git pull origin desenvolvimento 2>/dev/null || echo "⚠️  Sem remote origin ou erro no pull"

# Ir para master e atualizar
echo "🔄 Atualizando branch master..."
git checkout master
git pull origin master 2>/dev/null || echo "⚠️  Sem remote origin ou erro no pull"

# Fazer o merge
echo "🔀 Fazendo merge desenvolvimento → master..."
if git merge desenvolvimento --no-ff -m "feat: merge desenvolvimento para master - $(date '+%Y-%m-%d %H:%M:%S')"; then
    echo "✅ Merge realizado com sucesso!"
else
    echo "❌ Erro no merge! Resolva os conflitos manualmente."
    exit 1
fi

# Push para origin
echo "📤 Enviando para origin/master..."
if git push origin master; then
    echo "✅ Push realizado com sucesso!"
else
    echo "⚠️  Erro no push ou sem remote origin"
fi

# Voltar para branch original se não era master
if [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "desenvolvimento" ]; then
    echo "🔙 Voltando para branch original: $CURRENT_BRANCH"
    git checkout "$CURRENT_BRANCH"
fi

echo ""
echo "🎉 Merge concluído!"
echo "📊 Últimos commits:"
git log --oneline -3
