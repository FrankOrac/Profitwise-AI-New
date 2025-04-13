import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendTradeAlert(userEmail: string, alert: any) {
    const template = await this.loadTemplate('trade-alert');
    const html = ejs.render(template, { alert });

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: 'Trade Alert',
      html
    });
  }

  async sendPortfolioUpdate(userEmail: string, portfolio: any) {
    const template = await this.loadTemplate('portfolio-update');
    const html = ejs.render(template, { portfolio });

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: 'Portfolio Update',
      html
    });
  }

  private async loadTemplate(name: string): Promise<string> {
    const templatePath = path.join(__dirname, '../emails', name, 'html.ejs');
    return fs.promises.readFile(templatePath, 'utf8');
  }
}

export const emailService = new EmailService();