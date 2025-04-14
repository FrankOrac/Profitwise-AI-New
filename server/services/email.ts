
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

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

  async sendTradeAlert(user: any, trade: any) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/trade-alert/html.ejs'),
      { trade }
    );

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Trade Alert',
      html: template
    });
  }

  async sendPortfolioUpdate(user: any, portfolio: any) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/portfolio-update/html.ejs'),
      { portfolio }
    );

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Portfolio Update',
      html: template
    });
  }
}
