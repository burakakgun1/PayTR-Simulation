import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addItem } from '../store/cartSlice';
import type { RootState } from '../store';

const Home = () => {
    const dispatch = useDispatch();
    const { items: cartItems } = useSelector((state: RootState) => state.cart);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    useEffect(() => {
        console.log('[Home] Mounting and fetching fresh products/stock...');
        const fetchProducts = async () => {
            try {
                // Add timestamp to prevent caching
                const res = await axios.get(`http://localhost:5000/api/payment/products?t=${Date.now()}`);
                console.log('Fetched products:', res.data);
                setProducts(res.data.data);
            } catch (err: any) {
                console.error('Failed to fetch products:', err.message);
                if (err.response) console.error('Response data:', err.response.data);
            } finally {
                setIsLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product: any) => {
        // Check how many are already in the cart
        const existingItem = cartItems.find(item => item.id === product.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;

        if (currentQtyInCart + 1 > product.stock) {
            alert(`Üzgünüz, bu üründen elimizde sadece ${product.stock} adet var. Sepetinizde zaten ${currentQtyInCart} adet bulunuyor.`);
            return;
        }
        dispatch(addItem({ ...product, quantity: 1 }));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-12 text-white shadow-xl">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
                        Experience the Future of Payments
                    </h1>
                    <p className="text-blue-100 text-lg mb-6">
                        A fully simulated e-commerce environment to test PayTR 3D Secure integration flows with **Real Stock Management**.
                    </p>
                    <button className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 cursor-pointer transition shadow-lg">
                        Shop Now
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-600 pl-4">
                Featured Products
            </h2>

            {isLoadingProducts ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-500 italic">
                            No products found in the store.
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col">
                                <div className="h-48 bg-gray-100 relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={`w-full h-full object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                                    />
                                    {product.stock <= 0 ? (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sold Out</span>
                                        </div>
                                    ) : (
                                        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                                            IN STOCK: {product.stock}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-xl font-bold text-blue-600">
                                            {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-sm">TL</span>
                                        </span>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock <= 0}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95 ${product.stock <= 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                                                }`}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
