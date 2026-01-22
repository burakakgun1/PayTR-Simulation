import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { MockBankController } from '../controllers/mock-bank.controller';

const router = Router();

// Merchant API
router.post('/payment/create', PaymentController.createPayment);
router.post('/payment/callback', PaymentController.handleCallback); // Webhook
router.get('/payment/products', PaymentController.getProducts);
router.get('/payment/order/:id', PaymentController.getOrderStatus);


// Mock Bank API (Simulation)
router.post('/mock-paytr/process', MockBankController.processTransaction);

export default router;
