import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Serviço para gerenciar convites de academia
 */
export class InviteService {
  
  /**
   * Criar um convite para a academia
   * @param {string} academiaId - ID da academia
   * @param {string} email - Email do convidado
   * @param {string} tipo - Tipo do usuário (aluno, instrutor)
   * @param {string} createdBy - ID do usuário que criou o convite
   * @returns {Promise<string>} ID do convite criado
   */
  static async createInvite(academiaId, email, tipo, createdBy) {
    try {
      const inviteData = {
        academiaId,
        email: email.toLowerCase().trim(),
        tipo,
        createdBy,
        status: 'pending', // pending, accepted, expired
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        inviteToken: this.generateInviteToken()
      };

      const inviteRef = await addDoc(collection(db, 'invites'), inviteData);
      return inviteRef.id;
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      throw error;
    }
  }

  /**
   * Gerar token único para o convite
   * @returns {string} Token do convite
   */
  static generateInviteToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Buscar convite por token
   * @param {string} token - Token do convite
   * @returns {Promise<object|null>} Dados do convite ou null
   */
  static async getInviteByToken(token) {
    try {
      const q = query(
        collection(db, 'invites'),
        where('inviteToken', '==', token),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const inviteDoc = snapshot.docs[0];
      const inviteData = inviteDoc.data();

      // Verificar se o convite não expirou
      if (inviteData.expiresAt.toDate() < new Date()) {
        await updateDoc(doc(db, 'invites', inviteDoc.id), {
          status: 'expired'
        });
        return null;
      }

      return {
        id: inviteDoc.id,
        ...inviteData
      };
    } catch (error) {
      console.error('Erro ao buscar convite:', error);
      throw error;
    }
  }

  /**
   * Aceitar um convite
   * @param {string} inviteId - ID do convite
   * @param {string} userId - ID do usuário que está aceitando
   * @returns {Promise<object>} Dados da academia
   */
  static async acceptInvite(inviteId, userId) {
    try {
      // Marcar convite como aceito
      await updateDoc(doc(db, 'invites', inviteId), {
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: new Date()
      });

      // Buscar dados do convite para retornar informações da academia
      const inviteDoc = await getDoc(doc(db, 'invites', inviteId));
      const inviteData = inviteDoc.data();

      // Buscar dados da academia
      const academiaDoc = await getDoc(doc(db, 'academias', inviteData.academiaId));
      
      if (!academiaDoc.exists()) {
        throw new Error('Academia não encontrada');
      }

      return {
        academiaId: inviteData.academiaId,
        tipo: inviteData.tipo,
        academia: academiaDoc.data()
      };
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      throw error;
    }
  }

  /**
   * Listar convites de uma academia
   * @param {string} academiaId - ID da academia
   * @returns {Promise<Array>} Lista de convites
   */
  static async getAcademiaInvites(academiaId) {
    try {
      const q = query(
        collection(db, 'invites'),
        where('academiaId', '==', academiaId)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao listar convites:', error);
      throw error;
    }
  }

  /**
   * Gerar link de convite
   * @param {string} token - Token do convite
   * @returns {string} URL do convite
   */
  static generateInviteLink(token) {
    return `https://academia-app.com/invite/${token}`;
  }

  /**
   * Gerar link de associação direta (para QR Code)
   * @param {string} academiaId - ID da academia
   * @returns {string} URL de associação
   */
  static generateJoinLink(academiaId) {
    return `https://academia-app.com/join/${academiaId}`;
  }

  /**
   * Processar link de convite/associação
   * @param {string} url - URL completa
   * @returns {object} Informações extraídas do link
   */
  static parseInviteUrl(url) {
    // Link de convite: https://academia-app.com/invite/{token}
    const invitePattern = /https:\/\/academia-app\.com\/invite\/(.+)/;
    const inviteMatch = url.match(invitePattern);
    
    if (inviteMatch) {
      return {
        type: 'invite',
        token: inviteMatch[1]
      };
    }

    // Link de associação direta: https://academia-app.com/join/{academiaId}
    const joinPattern = /https:\/\/academia-app\.com\/join\/(.+)/;
    const joinMatch = url.match(joinPattern);
    
    if (joinMatch) {
      return {
        type: 'join',
        academiaId: joinMatch[1]
      };
    }

    return null;
  }

  /**
   * Enviar convite por email (simulação - integrar com serviço real)
   * @param {string} email - Email do destinatário
   * @param {string} academiaName - Nome da academia
   * @param {string} inviteLink - Link do convite
   * @param {string} inviterName - Nome de quem está convidando
   * @returns {Promise<boolean>} Sucesso do envio
   */
  static async sendInviteEmail(email, academiaName, inviteLink, inviterName, userType = 'aluno') {
    try {
      // Importar EmailService dinamicamente para evitar problemas de importação circular
      const { EmailService } = await import('./emailService');
      
      const success = await EmailService.sendInviteEmail(
        email,
        academiaName,
        inviterName,
        inviteLink,
        userType
      );
      
      if (success) {
        console.log('✅ Email de convite enviado com sucesso para:', email);
        return true;
      } else {
        console.error('❌ Falha ao enviar email de convite para:', email);
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }
}
