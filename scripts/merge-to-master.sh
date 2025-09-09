#!/bin/bash

# Script para fazer merge da branch desenvolvimento para master
# Autor: Academia App Development Team
# Data: $(date +%Y-%m-%d)

set -e  # Parar execução se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se estamos em um repositório Git
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Este diretório não é um repositório Git!"
        exit 1
    fi
}

# Função para verificar se a branch existe
check_branch_exists() {
    local branch=$1
    if ! git show-ref --verify --quiet refs/heads/$branch; then
        print_error "A branch '$branch' não existe!"
        exit 1
    fi
}

# Função para verificar se há mudanças não commitadas
check_clean_working_tree() {
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Há mudanças não commitadas no working tree."
        read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operação cancelada pelo usuário."
            exit 0
        fi
    fi
}

# Função principal
main() {
    print_info "Iniciando processo de merge desenvolvimento → master"
    
    # Verificações iniciais
    check_git_repo
    check_branch_exists "desenvolvimento"
    check_branch_exists "master"
    
    # Mostrar status atual
    current_branch=$(git branch --show-current)
    print_info "Branch atual: $current_branch"
    
    # Se não estiver na branch desenvolvimento, mudar para ela
    if [ "$current_branch" != "desenvolvimento" ]; then
        print_info "Mudando para branch desenvolvimento..."
        git checkout desenvolvimento
    fi
    
    # Verificar se há mudanças não commitadas
    check_clean_working_tree
    
    # Fazer pull da branch desenvolvimento para garantir que está atualizada
    print_info "Atualizando branch desenvolvimento..."
    if git remote | grep -q origin; then
        git pull origin desenvolvimento
        print_success "Branch desenvolvimento atualizada"
    else
        print_warning "Nenhum remote 'origin' encontrado, pulando pull"
    fi
    
    # Mudar para master
    print_info "Mudando para branch master..."
    git checkout master
    
    # Fazer pull da master para garantir que está atualizada
    print_info "Atualizando branch master..."
    if git remote | grep -q origin; then
        git pull origin master
        print_success "Branch master atualizada"
    else
        print_warning "Nenhum remote 'origin' encontrado, pulando pull"
    fi
    
    # Fazer o merge
    print_info "Fazendo merge desenvolvimento → master..."
    if git merge desenvolvimento --no-ff -m "feat: merge branch desenvolvimento para master - $(date '+%Y-%m-%d %H:%M:%S')"; then
        print_success "Merge realizado com sucesso!"
    else
        print_error "Conflitos detectados durante o merge!"
        print_info "Resolva os conflitos manualmente e execute:"
        print_info "  git add ."
        print_info "  git commit"
        print_info "  git push origin master"
        exit 1
    fi
    
    # Push para origin/master
    if git remote | grep -q origin; then
        print_info "Fazendo push para origin/master..."
        if git push origin master; then
            print_success "Push realizado com sucesso!"
        else
            print_error "Erro ao fazer push para origin/master"
            exit 1
        fi
    else
        print_warning "Nenhum remote 'origin' encontrado, pulando push"
    fi
    
    # Mostrar estatísticas do merge
    print_info "Estatísticas do merge:"
    git log --oneline -5
    
    print_success "Processo de merge concluído com sucesso! 🎉"
    print_info "Branch master atualizada com as mudanças da branch desenvolvimento"
}

# Função de ajuda
show_help() {
    echo "Script para merge da branch desenvolvimento para master"
    echo ""
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  -h, --help     Mostrar esta ajuda"
    echo "  -f, --force    Forçar merge mesmo com mudanças não commitadas"
    echo ""
    echo "Este script irá:"
    echo "  1. Verificar se estamos em um repositório Git"
    echo "  2. Verificar se as branches desenvolvimento e master existem"
    echo "  3. Atualizar ambas as branches com pull do remote"
    echo "  4. Fazer merge da desenvolvimento para master"
    echo "  5. Fazer push da master atualizada"
}

# Verificar argumentos da linha de comando
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -f|--force)
        FORCE_MERGE=true
        ;;
    "")
        # Sem argumentos, continuar normalmente
        ;;
    *)
        print_error "Argumento inválido: $1"
        show_help
        exit 1
        ;;
esac

# Executar função principal
main
