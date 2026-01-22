import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PayTRMock = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const oidFromUrl = searchParams.get('oid');
    const amountStr = searchParams.get('amount') || '0';
    const amount = parseInt(amountStr);

    const [step, setStep] = useState<'card_entry' | '3d_secure'>('card_entry');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 16);
        // Format as 0000 0000 0000 0000
        const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
            val = val.substring(0, 2) + '/' + val.substring(2);
        }
        setExpiry(val);
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 3);
        setCvv(val);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Lütfen 16 haneli kart numaranızı giriniz.');
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            alert('Lütfen geçerli bir son kullanma tarihi giriniz (AA/YY).');
            return;
        }
        if (cvv.length !== 3) {
            alert('Lütfen 3 haneli CVV kodunu giriniz.');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('3d_secure');
        }, 1500);
    };

    const handle3DConfirm = async () => {
        setIsLoading(true);
        try {
            // Call Mock Bank Process
            const response = await axios.post('http://localhost:5000/api/mock-paytr/process', {
                merchant_oid: oidFromUrl,
                total_amount: amount, // Use the dynamic amount from URL (Kuruş)
                success: true
            });

            if (response.data.redirect) {
                // Break out of iframe and redirect parent
                window.top!.location.href = response.data.redirect;
            }
        } catch (error) {
            console.error(error);
            alert('Bank Processing Failed');
            setIsLoading(false);
        }
    };

    if (!token) return (
        <div className="flex items-center justify-center h-full bg-gray-50 text-red-600 font-medium">
            Invalid Payment Token
        </div>
    );

    return (
        <div className="bg-gray-50 h-full flex flex-col pt-8 px-4 font-sans text-gray-800">
            {/* Payment Container */}
            <div className="bg-white max-w-sm mx-auto w-full p-6 rounded-xl shadow-sm border border-gray-200">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="text-xl font-bold italic text-blue-900 tracking-tighter">PayTR</div>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">TEST MODE</span>
                    </div>
                </div>

                {step === 'card_entry' ? (
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3 mb-4">
                            <div className="bg-white p-1 rounded border border-blue-100">
                                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            </div>
                            <div className="text-xs text-blue-800">
                                <p className="font-bold">Total Amount</p>
                                <p>{(amount / 100).toFixed(2)} TL</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 pl-1">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    className="w-full pl-10 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-sm"
                                    placeholder="0000 0000 0000 0000"
                                    required
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 pl-1">Expiry Date</label>
                                <input
                                    type="text"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-center font-mono text-sm"
                                    placeholder="MM / YY"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 pl-1">CVV / CVC</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cvv}
                                        onChange={handleCvvChange}
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-center font-mono text-sm"
                                        placeholder="123"
                                        maxLength={3}
                                        required
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition shadow-sm mt-2 flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </>
                            ) : 'Pay Securely'}
                        </button>

                        <div className="text-center mt-4 border-t pt-4">
                            <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition">
                                <div className="font-bold text-xs border border-gray-300 px-1 rounded italic text-blue-800">Visa</div>
                                <div className="font-bold text-xs border border-gray-300 px-1 rounded italic text-red-600">Mastercard</div>
                                <div className="font-bold text-xs border border-gray-300 px-1 rounded italic text-blue-500">Amex</div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800">3D Secure Verification</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                An SMS code was sent to <span className="font-mono bg-gray-100 px-1 rounded">+90 **** ** 99</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                className="w-3/4 mx-auto block border-b-2 border-blue-500 p-2 text-center text-2xl tracking-[0.5em] font-bold outline-none focus:border-blue-700 bg-transparent text-gray-800"
                                value="592183"
                                readOnly
                            />
                            <p className="text-xs text-blue-600 cursor-pointer hover:underline">Resend Code (59s)</p>
                        </div>

                        <button
                            onClick={handle3DConfirm}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition shadow-lg shadow-blue-200"
                        >
                            {isLoading ? 'Verifying...' : 'Confirm Payment'}
                        </button>
                    </div>
                )}
            </div>

            <div className="text-center mt-auto pb-4">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Generic Secure SSL/TLS Connection
                </p>
            </div>
        </div>
    );
};

export default PayTRMock;
