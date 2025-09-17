#!/bin/bash

# Script para corrigir Custom Claims diretamente via Firebase CLI
echo "🔧 Corrigindo Custom Claims via Firebase CLI..."

# Usuário correto identificado
USER_ID="rnrDk4ZCuERLDlSNAiYmMGS431T2"
ACADEMIA_ID="Tgg6tZynnTbQUxeAFJAB"

echo "📋 Usuário: $USER_ID"
echo "🏢 Academia: $ACADEMIA_ID"

# Criar script temporário para o Functions Shell
cat > /tmp/fix-claims-script.js << EOF
// Script para definir Custom Claims
const userId = '$USER_ID';
const claims = {
  role: 'admin',
  academiaId: '$ACADEMIA_ID'
};

console.log('🔧 Definindo claims para:', userId);
console.log('📋 Claims:', claims);

admin.auth().setCustomUserClaims(userId, claims)
  .then(() => {
    console.log('✅ Custom Claims definidos com sucesso!');
    return admin.firestore().collection('users').doc(userId).update({
      claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  })
  .then(() => {
    console.log('✅ Timestamp atualizado no Firestore');
    console.log('🎉 Correção concluída!');
  })
  .catch(error => {
    console.error('❌ Erro:', error);
  });
EOF

echo "📝 Script criado em /tmp/fix-claims-script.js"
echo ""
echo "🚀 Para executar manualmente:"
echo "1. cd functions"
echo "2. firebase functions:shell"
echo "3. require('/tmp/fix-claims-script.js')"
echo ""
echo "Ou execute: node -e \"require('/tmp/fix-claims-script.js')\" no contexto das functions"
