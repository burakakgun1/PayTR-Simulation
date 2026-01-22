import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PayTRMock from './pages/PayTRMock';
import PaymentResult from './pages/PaymentResult';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* This is the simulated PayTR Gateway Page - typically loaded in an iframe */}
            <Route path="/mock-paytr-gateway" element={<PayTRMock />} />

            <Route path="/payment-result/:status" element={<PaymentResult />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
