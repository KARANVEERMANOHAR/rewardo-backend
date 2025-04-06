import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const IV_LENGTH = 16;

export class Encryption {
    private static validateKey(): void {
        if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
            throw new Error('Invalid encryption key. Must be 32 characters long.');
        }
    }

    static encrypt(text: string): { encryptedData: string; iv: string } {
        this.validateKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        };
    }

    static decrypt(encrypted: { encryptedData: string; iv: string }): string {
        this.validateKey();
        const iv = Buffer.from(encrypted.iv, 'hex');
        const encryptedText = Buffer.from(encrypted.encryptedData, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

    static generateQRData(adminId: string, qrId: string, amount: number): string {
        const data = {
            adminId,
            qrId,
            amount,
            timestamp: Date.now()
        };

        const encrypted = this.encrypt(JSON.stringify(data));
        return JSON.stringify(encrypted);
    }

    static decodeQRData(encryptedData: string): {
        adminId: string;
        qrId: string;
        amount: number;
        timestamp: number;
    } {
        const parsed = JSON.parse(encryptedData);
        const decrypted = this.decrypt(parsed);
        return JSON.parse(decrypted);
    }
}