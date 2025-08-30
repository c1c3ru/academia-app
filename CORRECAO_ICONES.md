# 🔧 Correção de Ícones - Problema Identificado

## 🚨 **Problema Principal**

O React Native Paper usa **Material Community Icons**, mas muitos ícones no código estão usando nomes que não existem nesta biblioteca.

## 📋 **Mapeamento de Correções Necessárias**

### **Ícones Inválidos → Ícones Válidos (Material Community Icons)**

| Ícone Atual | Ícone Correto | Onde Usar |
|-------------|---------------|-----------|
| `check` | `check` ✅ | Já correto |
| `eye` | `eye` ✅ | Já correto |
| `plus` | `plus` ✅ | Já correto |
| `filter` | `filter` ✅ | Já correto |
| `trophy` | `trophy` ✅ | Já correto |
| `account` | `account` ✅ | Já correto |
| `account-plus` | `account-plus` ✅ | Já correto |
| `phone` | `phone` ✅ | Já correto |
| `close` | `close` ✅ | Já correto |
| `pencil` | `pencil` ✅ | Já correto |
| `google` | `google` ✅ | Já correto |
| `trending-up` | `trending-up` ✅ | Já correto |
| `card` | `credit-card` ❌ | Precisa correção |
| `qrcode` | `qrcode` ✅ | Já correto |
| `receipt` | `receipt` ✅ | Já correto |
| `message` | `message` ✅ | Já correto |
| `dots-vertical` | `dots-vertical` ✅ | Já correto |
| `check-circle-outline` | `check-circle-outline` ✅ | Já correto |
| `shield` | `shield` ✅ | Já correto |
| `bell` | `bell` ✅ | Já correto |
| `chevron-right` | `chevron-right` ✅ | Já correto |
| `logout` | `logout` ✅ | Já correto |

### **Navegação (Ionicons) - Separado**
- `home` / `home-outline` ✅
- `school` / `school-outline` ✅  
- `people` / `people-outline` ✅
- `settings` / `settings-outline` ✅

## 🎯 **Correções Necessárias**

Apenas **1 ícone** precisa ser corrigido:
- `card` → `credit-card` em StudentDashboard.js
