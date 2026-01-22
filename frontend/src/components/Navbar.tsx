import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Navbar = () => {
    const cartTotal = useSelector((state: RootState) => state.cart.total);
    const cartItems = useSelector((state: RootState) => state.cart.items.length);

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            PayTR DemoStore
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Products</Link>
                        <Link to="/cart" className="relative group">
                            <span className="flex items-center gap-1 text-gray-700 font-medium group-hover:text-blue-600 transition">
                                <span>Cart</span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                    {cartItems}
                                </span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
