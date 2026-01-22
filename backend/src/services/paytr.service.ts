import crypto from 'crypto';
import { PAYTR_MOCK_CONFIG } from '../config/paytr.mock';

export class PayTRService {
    /**
     * Generates the PayTR token required for the iframe initialization.
     * Logic mimics the official PayTR documentation.
     */
    static generateToken(
        user_ip: string,
        merchant_oid: string,
        email: string,
        payment_amount: number, // Must be integer (Kuruş)
        user_basket: string
    ): { token: string } {
        const { merchant_id, merchant_key, merchant_salt, no_installment, max_installment, test_mode } = PAYTR_MOCK_CONFIG;
        const currency = 'TL';

        // REAL PAYTR: In token generation, PayTR expects amount as number*100 (integer)
        // REAL PAYTR'YE GEÇERKEN BURASI DEĞİŞECEK: 
        // Hash concatenation usually follows a strict order defined by PayTR
        const concat = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;

        const token = crypto
            .createHmac('sha256', merchant_key)
            .update(concat + merchant_salt)
            .digest('base64');

        return { token };
    }

    /**
     * Validates the hash received in the callback.
     * Logic: base64(hmac_sha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
     */
    static validateCallback(
        hash: string,
        merchant_oid: string,
        status: string,
        total_amount: number | string // Kuruş integer
    ): boolean {
        const { merchant_key, merchant_salt } = PAYTR_MOCK_CONFIG;

        // REAL PAYTR: Callback hash is calculated by concatenating specific fields + salt
        // REAL PAYTR'YE GEÇERKEN BURASI DEĞİŞECEK: PayTR provides the algorithm in their docs
        const params = `${merchant_oid}${merchant_salt}${status}${total_amount}`;

        const calculatedHash = crypto
            .createHmac('sha256', merchant_key)
            .update(params)
            .digest('base64');

        return calculatedHash === hash;
    }
}
