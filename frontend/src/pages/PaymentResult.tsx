import { useParams, Link } from 'react-router-dom';

const PaymentResult = () => {
    const { status } = useParams();
    const isSuccess = status === 'success';


    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                {isSuccess ? (
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                )}

                <h1 className={`text-3xl font-bold mb-3 ${isSuccess ? 'text-gray-800' : 'text-red-600'}`}>
                    {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                </h1>

                <p className="text-gray-500 mb-8 text-lg">
                    {isSuccess
                        ? 'Your transaction has been completed successfully. A confirmation email has been sent.'
                        : 'We could not process your payment. Please check your card details or try again.'}
                </p>

                <div className="flex flex-col gap-3">
                    {isSuccess && (
                        <Link to="/" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                            Continue Shopping
                        </Link>
                    )}

                    {!isSuccess && (
                        <Link to="/checkout" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                            Try Again
                        </Link>
                    )}

                    <Link to="/" className="text-gray-500 font-medium hover:text-gray-700 py-2">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
