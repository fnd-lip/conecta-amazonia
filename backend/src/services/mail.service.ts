import nodemailer, { Transporter } from 'nodemailer';

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Conecta Amazônia" <${process.env.MAIL_FROM || 'no-reply@teste.com'}>`,
      to,
      subject: 'Confirme seu cadastro',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Bem-vindo!</h2>
          <p>Clique no botão abaixo para ativar sua conta:</p>
          <a href="${link}" style="padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px;">
            Confirmar E-mail
          </a>
        </div>
      `,
    });
  }
}
