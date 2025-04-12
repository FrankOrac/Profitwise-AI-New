
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';

class EmailService {
  private transporter: nodemailer.Transporter;
  private emailClient: Email;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.emailClient = new Email({
      message: {
        from: process.env.EMAIL_FROM || 'noreply@profitwise.ai'
      },
      transport: this.transporter,
      views: {
        root: path.join(__dirname, 'emails'),
        options: {
          extension: 'ejs'
        }
      }
    });
  }

  async sendWelcomeEmail(user: { email: string; firstName: string }) {
    try {
      await this.emailClient.send({
        template: 'welcome',
        message: {
          to: user.email
        },
        locals: {
          name: user.firstName,
          dashboardUrl: `${process.env.APP_URL || 'http://localhost:5000'}/dashboard`
        }
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(user: { email: string }, resetToken: string) {
    try {
      await this.emailClient.send({
        template: 'password-reset',
        message: {
          to: user.email
        },
        locals: {
          resetUrl: `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`
        }
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
