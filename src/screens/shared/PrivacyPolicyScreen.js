import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../../components/ActionButton';

const PrivacyPolicyScreen = ({ navigation }) => {
  const lastUpdated = new Date().toLocaleDateString('pt-BR');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              🔒 Política de Privacidade
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Academia App - Sistema de Gestão de Academias
            </Text>
            <Text variant="bodySmall" style={styles.lastUpdated}>
              Última atualização: {lastUpdated}
            </Text>
          </Card.Content>
        </Card>

        {/* Introdução */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              1. Introdução
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              O Academia App respeita a sua privacidade e está comprometido em proteger seus dados pessoais. 
              Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações 
              pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </Text>
          </Card.Content>
        </Card>

        {/* Dados Coletados */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              2. Dados Pessoais Coletados
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Coletamos os seguintes tipos de dados pessoais:
            </Text>
            
            <View style={styles.subSection}>
              <Text variant="titleSmall" style={styles.subSectionTitle}>
                2.1 Dados de Identificação:
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Nome completo
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Endereço de e-mail
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Número de telefone
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Data de nascimento
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Endereço residencial
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text variant="titleSmall" style={styles.subSectionTitle}>
                2.2 Dados de Saúde:
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Avaliações físicas (peso, altura, IMC)
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Histórico de lesões
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Condições médicas declaradas
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Contato de emergência
              </Text>
            </View>

            <View style={styles.subSection}>
              <Text variant="titleSmall" style={styles.subSectionTitle}>
                2.3 Dados de Pagamento:
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Histórico de pagamentos
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Planos contratados
              </Text>
              <Text variant="bodySmall" style={styles.listItem}>
                • Status de adimplência
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Finalidade do Tratamento */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              3. Finalidade do Tratamento de Dados
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Gestão de matrículas e cadastros de alunos
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Controle de acesso às instalações da academia
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Agendamento de aulas e avaliações
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Acompanhamento da evolução física dos alunos
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Gestão financeira e cobrança de mensalidades
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Comunicação sobre serviços e novidades
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Cumprimento de obrigações legais e regulamentares
            </Text>
          </Card.Content>
        </Card>

        {/* Base Legal */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              4. Base Legal para o Tratamento
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              O tratamento de seus dados pessoais é baseado nas seguintes hipóteses legais:
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Consentimento:</Text> Para dados sensíveis de saúde
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Execução de contrato:</Text> Para prestação dos serviços da academia
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Legítimo interesse:</Text> Para melhorias do serviço e comunicação
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Cumprimento de obrigação legal:</Text> Para questões fiscais e sanitárias
            </Text>
          </Card.Content>
        </Card>

        {/* Compartilhamento */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              5. Compartilhamento de Dados
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Seus dados pessoais podem ser compartilhados apenas nas seguintes situações:
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Com instrutores e profissionais da academia para prestação dos serviços
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Com prestadores de serviços (processamento de pagamentos, tecnologia)
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Com autoridades competentes, quando exigido por lei
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Em situações de emergência médica, com profissionais de saúde
            </Text>
            
            <View style={styles.warningBox}>
              <Text variant="bodySmall" style={styles.warningText}>
                ⚠️ <Text style={styles.bold}>Importante:</Text> Nunca vendemos ou alugamos seus dados pessoais para terceiros.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Segurança */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              6. Segurança dos Dados
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Criptografia de dados em trânsito e em repouso
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Controle de acesso restrito aos dados
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Backup regular e seguro das informações
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Monitoramento contínuo de segurança
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • Treinamento regular da equipe sobre proteção de dados
            </Text>
          </Card.Content>
        </Card>

        {/* Retenção */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              7. Retenção de Dados
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Mantemos seus dados pessoais apenas pelo tempo necessário:
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Dados de cadastro:</Text> Durante a vigência do contrato + 5 anos
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Dados financeiros:</Text> 5 anos (conforme legislação fiscal)
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Dados de saúde:</Text> 20 anos (conforme CFM)
            </Text>
            <Text variant="bodySmall" style={styles.listItem}>
              • <Text style={styles.bold}>Dados de marketing:</Text> Até revogação do consentimento
            </Text>
          </Card.Content>
        </Card>

        {/* Direitos do Titular */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              8. Seus Direitos como Titular
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Você tem os seguintes direitos em relação aos seus dados pessoais:
            </Text>
            
            <View style={styles.rightsGrid}>
              <View style={styles.rightCard}>
                <Text variant="titleSmall" style={styles.rightTitle}>📋 Acesso</Text>
                <Text variant="bodySmall" style={styles.rightDescription}>
                  Confirmar a existência de tratamento e acessar seus dados
                </Text>
              </View>
              
              <View style={styles.rightCard}>
                <Text variant="titleSmall" style={styles.rightTitle}>✏️ Correção</Text>
                <Text variant="bodySmall" style={styles.rightDescription}>
                  Solicitar correção de dados incompletos ou incorretos
                </Text>
              </View>
              
              <View style={styles.rightCard}>
                <Text variant="titleSmall" style={styles.rightTitle}>🗑️ Exclusão</Text>
                <Text variant="bodySmall" style={styles.rightDescription}>
                  Solicitar eliminação de dados desnecessários
                </Text>
              </View>
              
              <View style={styles.rightCard}>
                <Text variant="titleSmall" style={styles.rightTitle}>🚫 Oposição</Text>
                <Text variant="bodySmall" style={styles.rightDescription}>
                  Opor-se ao tratamento baseado em legítimo interesse
                </Text>
              </View>
              
              <View style={styles.rightCard}>
                <Text variant="titleSmall" style={styles.rightTitle}>📱 Portabilidade</Text>
                <Text variant="bodySmall" style={styles.rightDescription}>
                  Solicitar portabilidade para outro fornecedor
                </Text>
              </View>
              
              <View style={styles.rightCard}>
                <Text variant="titleSmall" style={styles.rightTitle}>❌ Revogação</Text>
                <Text variant="bodySmall" style={styles.rightDescription}>
                  Revogar consentimento a qualquer momento
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contato */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              9. Contato e Exercício de Direitos
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
            </Text>
            
            <View style={styles.contactBox}>
              <Text variant="titleSmall" style={styles.contactTitle}>
                📧 Encarregado de Dados (DPO)
              </Text>
              <Text variant="bodySmall" style={styles.contactItem}>
                E-mail: privacidade@academiaapp.com
              </Text>
              <Text variant="bodySmall" style={styles.contactItem}>
                Telefone: (11) 9999-9999
              </Text>
              <Text variant="bodySmall" style={styles.contactItem}>
                Resposta em até 15 dias úteis
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Alterações */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              10. Alterações nesta Política
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas 
              serão comunicadas por e-mail ou através do aplicativo com antecedência mínima de 30 dias.
            </Text>
            
            <Text variant="bodyMedium" style={[styles.bodyText, { marginTop: 16 }]}>
              Recomendamos que você revise esta política regularmente para se manter informado sobre 
              como protegemos seus dados pessoais.
            </Text>
          </Card.Content>
        </Card>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <ActionButton
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
            variant="secondary"
            icon="arrow-left"
          >
            Voltar
          </ActionButton>
          
          <ActionButton
            mode="contained"
            onPress={() => {
              // Aqui poderia abrir um modal ou navegar para tela de contato
              alert('Para exercer seus direitos, entre em contato através do e-mail: privacidade@academiaapp.com');
            }}
            style={styles.actionButton}
            variant="primary"
            icon="email"
          >
            Contatar DPO
          </ActionButton>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Academia App - Sistema de Gestão de Academias
          </Text>
          <Text variant="bodySmall" style={styles.footerText}>
            Em conformidade com a LGPD (Lei nº 13.709/2018)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976D2',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  lastUpdated: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  sectionCard: {
    margin: 16,
    marginVertical: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976D2',
  },
  bodyText: {
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'justify',
  },
  subSection: {
    marginTop: 16,
    marginLeft: 8,
  },
  subSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#424242',
  },
  listItem: {
    marginBottom: 4,
    lineHeight: 20,
    color: '#424242',
  },
  bold: {
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#FF9800',
    marginTop: 16,
  },
  warningText: {
    color: '#E65100',
    lineHeight: 18,
  },
  rightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rightCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeft: 4,
    borderLeftColor: '#2196F3',
  },
  rightTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1976D2',
  },
  rightDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: '#424242',
  },
  contactBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  contactTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  contactItem: {
    marginBottom: 4,
    color: '#424242',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 4,
  },
});

export default PrivacyPolicyScreen;