
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to: string, template: string, data: any) {
    const templatePath = path.join(__dirname, '../emails', template);
    
    const [htmlTemplate, subjectTemplate] = await Promise.all([
      fs.readFile(path.join(templatePath, 'html.ejs'), 'utf-8'),
      fs.readFile(path.join(templatePath, 'subject.ejs'), 'utf-8')
    ]);

    const html = ejs.render(htmlTemplate, data);
    const subject = ejs.render(subjectTemplate, data);

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
  }

  async sendTradeAlert(userId: number, alert: any) {
    const user = await storage.getUser(userId);
    await this.sendEmail(user.email, 'trade-alert', {
      user,
      alert
    });
  }

  async sendPortfolioUpdate(userId: number, update: any) {
    const user = await storage.getUser(userId);
    await this.sendEmail(user.email, 'portfolio-update', {
      user,
      update
    });
  }
}

export const emailService = new EmailService();
