# 🔥 Firebase CLI - Comandos para Criar Coleções

## **Métodos Disponíveis:**

### **1. Firebase CLI + Script Node.js (Recomendado)**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Fazer login
firebase login

# Executar script automatizado
node scripts/setup-firebase.js all
```

### **2. Firebase CLI Direto**

```bash
# Fazer login
firebase login

# Inicializar projeto
firebase init firestore

# Aplicar regras
firebase deploy --only firestore:rules

# Importar dados de arquivo JSON
firebase firestore:import dados-iniciais.json
```

### **3. Script Node.js com Firebase Admin**

```bash
# Instalar dependência
npm install firebase-admin

# Executar comandos específicos
node scripts/setup-firebase.js setup    # Criar coleções
node scripts/setup-firebase.js check    # Verificar existentes
node scripts/setup-firebase.js admin    # Criar admin
```

---

## **📋 Comandos Disponíveis:**

### **Verificar Status:**
```bash
node scripts/setup-firebase.js check
```

### **Criar Dados Iniciais:**
```bash
node scripts/setup-firebase.js setup
```

### **Criar Usuário Admin:**
```bash
node scripts/setup-firebase.js admin
```

### **Configuração Completa:**
```bash
./scripts/firebase-cli-setup.sh
# ou
node scripts/setup-firebase.js all
```

---

## **🎯 Vantagens do CLI:**

- ✅ **Automação completa**
- ✅ **Reproduzível em qualquer ambiente**
- ✅ **Controle de versão dos dados**
- ✅ **Backup e restore fácil**
- ✅ **Configuração em lote**

---

## **📊 Dados Criados Automaticamente:**

### **Modalidades:**
- Judô (R$ 150/mês)
- Karatê (R$ 140/mês) 
- Jiu-Jitsu (R$ 160/mês)

### **Anúncios:**
- Mensagem de boas-vindas
- Informações sobre check-in
- Informações sobre pagamentos

### **Usuário Admin:**
- Email: admin@academia.com
- Senha: admin123456

---

## **🚀 Como Usar:**

1. **Configure o arquivo `google-services.json`**
2. **Execute:** `node scripts/setup-firebase.js all`
3. **Teste o login admin no app**

**Pronto! Seu Firebase estará configurado via linha de comando! 🎉**
