import { hash, compare } from 'bcrypt';
import { authenticator } from 'otplib';
import { promisify } from 'util';

export const SALT_ROUNDS = 12;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const hashPassword = async (password: string): Promise<string> => {
    return hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return compare(password, hash);
};

export const generate2FASecret = (): string => {
    return authenticator.generateSecret();
};

export const verify2FAToken = async (token: string, secret: string): Promise<boolean> => {
    return authenticator.verify({ token, secret });
};

export const generateQRCode = async (secret: string, email: string): Promise<string> => {
    const otpauth = authenticator.keyuri(email, 'YourApp', secret);
    // You'll need to implement QR code generation here
    // Consider using qrcode npm package
    return otpauth;
};

// API Key management
export const generateApiKey = async (): Promise<string> => {
    const buffer = await promisify(crypto.randomBytes)(32);
    return buffer.toString('hex');
};

export const hashApiKey = async (apiKey: string): Promise<string> => {
    return hash(apiKey, SALT_ROUNDS);
};

export const compareApiKeys = async (apiKey: string, hash: string): Promise<boolean> => {
    return compare(apiKey, hash);
};
