#!/bin/bash

# Script de Deployment - Remoção do SuperAdmin
# Este script automatiza o processo de deployment da nova arquitetura

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando deployment da remoção do SuperAdmin..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Instale Node.js"
        exit 1
    fi
    
    if [ ! -f "firebase.json" ]; then
        log_error "firebase.json não encontrado. Execute este script na raiz do projeto"
        exit 1
    fi
    
    log_success "Pré-requisitos verificados"
}

# Deploy das Cloud Functions
deploy_functions() {
    log_info "Fazendo deploy das Cloud Functions..."
    
    cd functions
    
    if [ ! -f "package.json" ]; then
        log_error "package.json não encontrado na pasta functions"
        exit 1
    fi
    
    log_info "Instalando dependências das functions..."
    npm install
    
    cd ..
    
    log_info "Fazendo deploy das functions..."
    firebase deploy --only functions
    
    log_success "Cloud Functions deployadas com sucesso"
}

# Deploy das regras do Firestore
deploy_firestore_rules() {
    log_info "Fazendo deploy das regras do Firestore..."
    
    if [ ! -f "firestore.rules" ]; then
        log_error "firestore.rules não encontrado"
        exit 1
    fi
    
    firebase deploy --only firestore:rules
    
    log_success "Regras do Firestore deployadas com sucesso"
}

# Executar migração dos dados
run_migration() {
    log_info "Executando migração dos dados..."
    
    if [ ! -f "scripts/migrate-global-collections.js" ]; then
        log_error "Script de migração não encontrado"
        exit 1
    fi
    
    cd scripts
    
    log_info "Iniciando migração das coleções globais..."
    node migrate-global-collections.js migrate
    
    log_info "Verificando integridade da migração..."
    node migrate-global-collections.js verify
    
    cd ..
    
    log_success "Migração concluída com sucesso"
}

# Verificar se tudo está funcionando
verify_deployment() {
    log_info "Verificando deployment..."
    
    # Verificar se as functions estão ativas
    log_info "Verificando Cloud Functions..."
    firebase functions:list | grep -E "(createAcademy|generateInvite|useInvite)" || {
        log_warning "Algumas functions podem não estar ativas ainda. Aguarde alguns minutos."
    }
    
    log_success "Verificação concluída"
}

# Função principal
main() {
    echo
    log_info "Este script irá:"
    echo "  1. Fazer deploy das Cloud Functions"
    echo "  2. Fazer deploy das regras do Firestore"
    echo "  3. Executar migração dos dados"
    echo "  4. Verificar o deployment"
    echo
    
    read -p "Deseja continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelado pelo usuário"
        exit 0
    fi
    
    check_prerequisites
    
    echo
    log_info "Passo 1/4: Deploy das Cloud Functions"
    deploy_functions
    
    echo
    log_info "Passo 2/4: Deploy das regras do Firestore"
    deploy_firestore_rules
    
    echo
    log_info "Passo 3/4: Migração dos dados"
    log_warning "ATENÇÃO: Este passo irá migrar dados das coleções globais para subcoleções por academia"
    read -p "Continuar com a migração? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_migration
    else
        log_warning "Migração pulada. Execute manualmente quando estiver pronto:"
        log_info "cd scripts && node migrate-global-collections.js migrate"
    fi
    
    echo
    log_info "Passo 4/4: Verificação do deployment"
    verify_deployment
    
    echo
    echo "=================================================="
    log_success "Deployment concluído com sucesso! 🎉"
    echo
    log_info "Próximos passos:"
    echo "  1. Teste a aplicação localmente: npm start"
    echo "  2. Execute os testes de segurança"
    echo "  3. Faça deploy do código cliente"
    echo "  4. Monitore os logs: firebase functions:log"
    echo
    log_warning "Lembre-se de testar todas as funcionalidades antes de usar em produção!"
}

# Executar função principal
main "$@"
