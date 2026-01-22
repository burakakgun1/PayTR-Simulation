import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import axios from 'axios';
import { setPaymentToken } from '../store/paymentSlice';
import { clearCart } from '../store/cartSlice';

const Checkout = () => {
    const navigate = useNavigate();
    const { items, total } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();

    // User Form State
    const [formData, setFormData] = useState({
        name: 'Test User',
        email: 'test@example.com',
        address: 'Test Address Istanbul',
    });

    const [iframeToken, setIframeToken] = useState<string | null>(null);
    const [merchantOid, setMerchantOid] = useState<string | null>(null);
    const [showIframe, setShowIframe] = useState(false);

    const handleStartPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // REAL PAYTR: Basket items must match [name, priceKurus, quantity]
            const user_basket = items.map(item => [
                item.name,
                // Convert price to kuruş (cents) for PayTR
                Math.round(item.price * 100),
                item.quantity,
                item.id // Pass ID for stock validation
            ]);

            const response = await axios.post('http://localhost:5000/api/payment/create', {
                user_basket,
                total_amount: Math.round(total * 100), // Convert total to kuruş
                user_email: formData.email,
                user_name: formData.name,
                user_address: formData.address
            });

            if (response.data.status === 'success') {
                const { token, merchant_oid } = response.data;
                dispatch(setPaymentToken({ token, merchant_oid })); // Still dispatch to store if needed elsewhere
                setIframeToken(token);
                setMerchantOid(merchant_oid);
                setShowIframe(true);

                // Polling logic: PayTR does NOT return result here.
                // We must check our backend until callback arrives.
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await axios.get(`http://localhost:5000/api/payment/order/${merchant_oid}`);
                        const { status_code } = statusRes.data;

                        if (status_code === 'PAID') {
                            console.log('Payment Successful! Clearing cart...');
                            clearInterval(pollInterval);
                            dispatch(clearCart()); // Clear state and localStorage
                            navigate('/payment-result/success');
                        } else if (status_code === 'FAILED') {
                            clearInterval(pollInterval);
                            navigate('/payment-result/failed');
                        }
                    } catch (err) {
                        console.error('Polling error', err);
                        // Optionally, handle specific polling errors or stop polling after a few errors
                    }
                }, 2000); // Poll every 2 seconds

                // Cleanup poll after timeout (e.g., 2 mins)
                setTimeout(() => {
                    clearInterval(pollInterval);
                    // Optionally, redirect to a timeout/pending page if no status received
                    // console.log('Polling timed out.');
                }, 120000); // 2 minutes
            } else {
                alert('Payment Init Failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            alert(error.response?.data?.message || 'Payment Initialization Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Secure Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Billing Form */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-6 text-gray-800">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                            <h3 className="text-xl font-bold">Billing Details</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none min-h-[100px]"
                                    placeholder="Your full address..."
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {!iframeToken && (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div>
                                <p className="text-blue-900 font-medium">Ready to pay?</p>
                                <p className="text-blue-700 text-sm">You'll be redirected to PayTR secure gateway.</p>
                            </div>
                            <button
                                onClick={handleStartPayment}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                            >
                                Pay {total.toFixed(2)} TL
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Order Summary & Iframe */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-6">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                                    <span className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} TL</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} TL</span>
                        </div>
                    </div>

                    {showIframe && iframeToken && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ring-4 ring-blue-50">
                            <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Secure Payment
                                </span>
                                <span className="opacity-75">PayTR Mock</span>
                            </div>
                            <div className="bg-white h-[600px] relative">
                                {merchantOid ? (
                                    <iframe
                                        src={`/mock-paytr-gateway?token=${iframeToken}&oid=${merchantOid}&amount=${Math.round(total * 100)}`}
                                        className="w-full h-[600px] border-none"
                                        title="PayTR Payment Gateway"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
