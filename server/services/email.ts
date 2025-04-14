
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { TradeAlert, PortfolioUpdate } from '@shared/schema';

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

  async sendWelcomeEmail(user: any) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/welcome/html.ejs'),
      { user }
    );

    await this.transporter.sendMail({
      to: user.email,
      subject: 'Welcome to ProfitWise AI',
      html: template
    });
  }

  async sendTradeAlert(user: any, alert: TradeAlert) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/trade-alert/html.ejs'),
      { alert }
    );

    await this.transporter.sendMail({
      to: user.email,
      subject: `Trade Alert: ${alert.action.toUpperCase()} ${alert.symbol}`,
      html: template
    });
  }

  async sendPortfolioUpdate(userId: number, update: PortfolioUpdate) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/portfolio-update/html.ejs'),
      { update }
    );

    const user = await storage.getUser(userId);
    await this.transporter.sendMail({
      to: user.email,
      subject: `Portfolio Update: ${update.type}`,
      html: template
    });
  }

  async sendMarketAlert(user: any, alert: any) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/market-alert/html.ejs'),
      { alert }
    );

    await this.transporter.sendMail({
      to: user.email,
      subject: `Market Alert: ${alert.symbol} ${alert.type}`,
      html: template
    });
  }

  async sendPriceAlert(user: any, alert: any) {
    const template = await ejs.renderFile(
      path.join(__dirname, '../emails/price-alert/html.ejs'),
      { alert }
    );

    await this.transporter.sendMail({
      to: user.email,
      subject: `Price Alert: ${alert.symbol} ${alert.condition}`,
      html: template
    });
  }
}

export const emailService = new EmailService();
