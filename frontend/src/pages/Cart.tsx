import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store';
import { clearCart } from '../store/cartSlice';

const Cart = () => {
    const { items, total } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();

    if (items.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl mb-4">Your cart is empty</h2>
                <Link to="/" className="text-blue-600 hover:underline">Go Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Shopping Cart</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                <p className="text-gray-500 text-sm">
                                    {item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL x {item.quantity}
                                </p>
                            </div>
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                            {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </div>
                    </div>
                ))}

                <div className="p-6 bg-gray-50 flex justify-end items-center gap-4">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-2xl font-bold text-gray-900">
                        {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={() => dispatch(clearCart())}
                    className="text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition"
                >
                    Clear Cart
                </button>
                <Link
                    to="/checkout"
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5"
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
};

export default Cart;
