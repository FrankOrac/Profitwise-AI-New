
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class TwoFactorService {
  static async generateSecret(userId: number) {
    const secret = speakeasy.generateSecret({
      name: 'ProfitWise'
    });

    await db.update(users)
      .set({ twoFactorSecret: secret.base32 })
      .where(eq(users.id, userId));

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    return { secret: secret.base32, qrCode };
  }

  static async verifyToken(userId: number, token: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user?.twoFactorSecret) return false;

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
  }
}
