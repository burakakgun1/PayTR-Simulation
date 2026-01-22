import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PayTRService } from '../services/paytr.service';
import { db, Order, OrderItem } from '../models/db';
import { PAYTR_MOCK_CONFIG } from '../config/paytr.mock';
import { toKurus } from '../utils/currency';

export class PaymentController {

    /**
     * Retrieve all products with current stock levels.
     */
    static async getProducts(req: Request, res: Response) {
        try {
            console.log('[API] Fetching products list...');
            const products = Array.from(db.products.values());
            console.log(`[API] Returning ${products.length} products.`);
            res.json({ status: 'success', data: products });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to fetch products' });
        }
    }

    /**
     * Merchant initialization. This mimics the internal order creation 
     * and PayTR token request.
     */
    static async createPayment(req: Request, res: Response) {
        try {
            const {
                user_basket, // Array of [name, priceTL, qty, id?]
                total_amount: total_tl,
                user_email,
                user_name,
                user_address
            } = req.body;

            const user_ip = req.ip || '127.0.0.1';
            const merchant_oid = uuidv4();
            const total_kurus = toKurus(total_tl);

            // 1. BASKET INTEGRITY & STOCK CHECK (New: Stock Check)
            let calculated_total = 0;
            const items: OrderItem[] = [];

            for (const item of user_basket) {
                const [name, priceTl, qty, id] = item;

                // STOCK VALIDATION
                if (id) {
                    const product = db.products.get(id);
                    if (!product || product.stock < qty) {
                        return res.status(400).json({
                            status: 'error',
                            message: `Insufficient stock for ${name}. Available: ${product?.stock || 0}`
                        });
                    }
                }

                const priceKurus = toKurus(priceTl);
                calculated_total += priceKurus * qty;
                items.push({ name, price: priceKurus, quantity: qty });
            }

            if (calculated_total !== total_kurus) {
                return res.status(400).json({
                    status: 'error',
                    message: `Total amount mismatch! Expected ${total_kurus}, got ${calculated_total}.`
                });
            }

            // 2. Create Order in CREATED state
            const newOrder: Order = {
                id: merchant_oid,
                user_email,
                total_amount: total_kurus,
                status: 'CREATED',
                items: items,
                createdAt: new Date()
            };

            db.orders.set(merchant_oid, newOrder);

            // 3. Generate REALISTIC PayTR format sepet
            const formattedBasket = items.map(i => [i.name, i.price, i.quantity]);
            const basketStr = JSON.stringify(formattedBasket);

            const { token } = PayTRService.generateToken(
                user_ip,
                merchant_oid,
                user_email,
                total_kurus,
                basketStr
            );

            newOrder.status = 'PAYMENT_PENDING';
            db.orders.set(merchant_oid, newOrder);

            res.status(200).json({
                status: 'success',
                token,
                merchant_oid,
                merchant_id: PAYTR_MOCK_CONFIG.merchant_id
            });
        } catch (error) {
            console.error('Create Payment Error:', error);
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
    }

    /**
     * MOCK CALLBACK: Handles payment result and STOCK DEDUCTION.
     */
    static async handleCallback(req: Request, res: Response) {
        try {
            console.log('--- CALLBACK RECEIVED ---');
            const { merchant_oid, status, total_amount, hash } = req.body;

            const isValid = PayTRService.validateCallback(hash, merchant_oid, status, total_amount);

            if (!isValid) {
                console.warn('SECURITY ALERT: Invalid callback hash!');
                return res.send('PAYTR_INVALID_HASH');
            }

            const order = db.orders.get(merchant_oid as string);
            if (!order) return res.send('OK');

            if (status === 'success' && order.status !== 'PAID') {
                order.status = 'PAID';

                // STOCK DEDUCTION LOGIC
                // In a real DB this would be a transaction
                order.items.forEach(orderItem => {
                    // Find product by name in this simple mockup
                    const productEntry = Array.from(db.products.entries()).find(([_, p]) => p.name === orderItem.name);
                    if (productEntry) {
                        const [id, product] = productEntry;
                        product.stock = Math.max(0, product.stock - orderItem.quantity);
                        db.products.set(id, product);
                        console.log(`[STOCK] ${product.name} updated to ${product.stock}`);
                    }
                });
            } else if (status !== 'success') {
                order.status = 'FAILED';
            }

            db.orders.set(merchant_oid as string, order);
            res.send('OK');
        } catch (error) {
            console.error('Callback Error:', error);
            res.send('FAIL');
        }
    }

    /**
     * Polling endpoint for frontend
     */
    static async getOrderStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = db.orders.get(id as string);

            if (!order) {
                return res.status(404).json({ status: 'error', message: 'Order not found' });
            }

            res.json({ status: 'success', status_code: order.status, data: order });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'System Error' });
        }
    }
}
