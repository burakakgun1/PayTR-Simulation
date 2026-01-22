import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { PAYTR_MOCK_CONFIG } from '../config/paytr.mock';

export class MockBankController {
    /**
     * SIMULATED BANK PROCESS
     * This endpoint is what the PayTR Iframe eventually triggers.
     */
    static async processTransaction(req: Request, res: Response) {
        try {
            const { merchant_oid, total_amount, success } = req.body;
            const { merchant_key, merchant_salt } = PAYTR_MOCK_CONFIG;
            const status = success ? 'success' : 'failed';

            console.log(`--- [MOCK BANK] Processing OID: ${merchant_oid} | Status: ${status} ---`);

            // Simulate 3D Secure Verification delay (Realistic)
            setTimeout(async () => {
                try {
                    // REAL PAYTR: The PayTR server sends a POST to your callback URL
                    // We must generate a valid hash so the merchant can trust this callback
                    const hashStr = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
                    const callbackHash = crypto
                        .createHmac('sha256', merchant_key)
                        .update(hashStr)
                        .digest('base64');

                    const callbackPayload = {
                        merchant_oid,
                        status,
                        total_amount, // int kuruş
                        hash: callbackHash
                    };

                    const merchantCallbackUrl = 'http://localhost:5000/api/payment/callback';
                    console.log(`--- [MOCK BANK] Sending Callback to ${merchantCallbackUrl} ---`);

                    const response = await axios.post(merchantCallbackUrl, callbackPayload);
                    console.log(`--- [MOCK BANK] Callback Response from Merchant: ${response.data} ---`);

                } catch (error: any) {
                    console.error('--- [MOCK BANK] Callback Delivery Error:', error.message);
                }
            }, 200);

            // Immediate result for the frontend Iframe UI
            res.status(200).json({
                status: 'success',
                message: '3D Secure process initiated.',
                redirect: `/payment-result/${success ? 'success' : 'failed'}`
            });
        } catch (error: any) {
            console.error('--- [MOCK BANK] Transaction Error:', error.message);
            res.status(500).json({ status: 'error', message: 'Bank system error' });
        }
    }
}
