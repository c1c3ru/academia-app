import nodemailer from 'nodemailer';

// Email service configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

class NodeMailerService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter(EMAIL_CONFIG);
      
      // Verify connection configuration
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      // In development, create a test account
      if (process.env.NODE_ENV === 'development') {
        await this.createTestAccount();
      }
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('📧 Test email account created:', testAccount.user);
    } catch (error) {
      console.error('❌ Failed to create test account:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `"Academia App" <${EMAIL_CONFIG.auth.user}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      
      // For test accounts, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  // Password recovery email
  async sendPasswordRecoveryEmail(email, resetLink, userName = '') {
    const subject = 'Recuperação de Senha - Academia App';
    
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
                border-bottom: 2px solid #f0f0f0;
                padding-bottom: 24px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2196F3;
                margin-bottom: 8px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }
            .warning {
                background-color: #FFF3E0;
                border: 1px solid #FFB74D;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
                color: #E65100;
            }
            .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e0e0e0;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🥋 Academia App</div>
                <div>Sistema de Gestão de Academias</div>
            </div>
            
            <h2>🔐 Recuperação de Senha</h2>
            
            <p>Olá${userName ? ` ${userName}` : ''},</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no Academia App.</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">
                    Redefinir Senha
                </a>
            </div>
            
            <div class="warning">
                ⏰ <strong>Importante:</strong> Este link expira em 1 hora por motivos de segurança.
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 4px;">
                ${resetLink}
            </p>
            
            <p><strong>Se você não solicitou esta recuperação de senha, ignore este email.</strong> Sua senha permanecerá inalterada.</p>
            
            <div class="footer">
                <p>Academia App - Sistema de Gestão de Academias</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Academy invitation email
  async sendAcademyInviteEmail(email, academyName, inviterName, inviteLink, userType = 'aluno') {
    const userTypeText = {
      'aluno': 'aluno',
      'instrutor': 'instrutor',
      'admin': 'administrador'
    };

    const subject = `Convite para ${academyName} - ${userTypeText[userType]}`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite - ${academyName}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
                border-bottom: 2px solid #f0f0f0;
                padding-bottom: 24px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2196F3;
                margin-bottom: 8px;
            }
            .user-type {
                background-color: #E3F2FD;
                color: #1976D2;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: 500;
                display: inline-block;
                margin: 8px 0;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }
            .expiration {
                background-color: #FFF3E0;
                border: 1px solid #FFB74D;
                border-radius: 8px;
                padding: 12px;
                margin: 16px 0;
                color: #E65100;
                text-align: center;
                font-weight: 500;
            }
            .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e0e0e0;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🥋 Academia App</div>
                <div>Sistema de Gestão de Academias</div>
            </div>
            
            <h2>🎉 Você foi convidado!</h2>
            
            <p>Olá!</p>
            
            <p><strong>${inviterName}</strong> convidou você para se juntar à academia <strong style="color: #2196F3;">${academyName}</strong> como <span class="user-type">${userTypeText[userType]}</span>.</p>
            
            <p>Com o Academia App você poderá:</p>
            <ul>
                <li>🗓️ Acompanhar horários de treinos e aulas</li>
                <li>💪 Registrar sua evolução física</li>
                <li>💳 Gerenciar pagamentos e mensalidades</li>
                <li>🏆 Acompanhar graduações e conquistas</li>
                <li>📱 Receber notificações importantes</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="${inviteLink}" class="button">
                    ✨ Aceitar Convite
                </a>
            </div>
            
            <div class="expiration">
                ⏰ Este convite expira em 7 dias
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 4px;">
                ${inviteLink}
            </p>
            
            <div class="footer">
                <p>Academia App - Sistema de Gestão de Academias</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
                <p>Se você não esperava este convite, pode ignorar este email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Welcome email after joining academy
  async sendWelcomeEmail(email, userName, academyName, userType = 'aluno') {
    const userTypeText = {
      'aluno': 'aluno',
      'instrutor': 'instrutor',
      'admin': 'administrador'
    };

    const subject = `🎉 Bem-vindo(a) à ${academyName}!`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo - ${academyName}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
                border-bottom: 2px solid #f0f0f0;
                padding-bottom: 24px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 8px;
            }
            .steps {
                background-color: #E8F5E8;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e0e0e0;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🥋 Academia App</div>
                <div>Sistema de Gestão de Academias</div>
            </div>
            
            <h2>🎉 Bem-vindo(a) à ${academyName}!</h2>
            
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Parabéns! Você agora faz parte da <strong>${academyName}</strong> como <strong>${userTypeText[userType]}</strong>.</p>
            
            <div class="steps">
                <h3>📋 Próximos passos:</h3>
                <ul>
                    <li>✅ Complete seu perfil com informações pessoais</li>
                    <li>📋 Faça sua primeira avaliação física</li>
                    <li>🗓️ Consulte os horários das aulas</li>
                    <li>💪 Comece seus treinos!</li>
                </ul>
            </div>
            
            <p>Estamos animados para ter você conosco!</p>
            <p><strong>Equipe ${academyName}</strong></p>
            
            <div class="footer">
                <p>Academia App - Sistema de Gestão de Academias</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Class reminder notification
  async sendClassReminderEmail(email, userName, className, classTime, reminderMinutes = 30) {
    const subject = `🔔 Lembrete: Aula de ${className} em ${reminderMinutes} minutos`;
    
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lembrete de Aula</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .reminder {
                background-color: #E3F2FD;
                border-left: 4px solid #2196F3;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .time {
                font-size: 24px;
                font-weight: bold;
                color: #2196F3;
                text-align: center;
                margin: 16px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🔔 Lembrete de Aula</h2>
            
            <p>Olá <strong>${userName}</strong>,</p>
            
            <div class="reminder">
                <p><strong>Sua aula está começando em breve!</strong></p>
                <p><strong>Aula:</strong> ${className}</p>
                <div class="time">${classTime}</div>
                <p><strong>Em:</strong> ${reminderMinutes} minutos</p>
            </div>
            
            <p>Não se esqueça de trazer:</p>
            <ul>
                <li>🥋 Uniforme/Kimono</li>
                <li>💧 Garrafa de água</li>
                <li>🧴 Toalha</li>
            </ul>
            
            <p>Nos vemos na academia!</p>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail(email, subject, html);
  }
}

// Export singleton instance
export const emailService = new NodeMailerService();
export default emailService;
