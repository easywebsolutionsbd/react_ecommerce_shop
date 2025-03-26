import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Alert from './components/layout/Alert';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AllOrders from './pages/AllOrders';
import NotFound from './pages/NotFound';
import { getUser } from './utils/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();

        setUser(userData.data.success);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // For backward compatibility
  const showAlert = (msg, type, timeout = 3000) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), timeout);
  };

  return (
    <div className="app">
      <Header user={user} />
      <div className="container">
        {alert && <Alert alert={alert} />}
        <Routes>
          <Route path="/" element={<Home user={user} showAlert={showAlert} />} />
          <Route path="/login" element={<Login setUser={setUser} showAlert={showAlert} />} />
          <Route path="/register" element={<Register setUser={setUser} showAlert={showAlert} />} />
          <Route path="/wishlist" element={<Wishlist user={user} showAlert={showAlert} />} />
          <Route path="/compare" element={<Compare user={user} showAlert={showAlert} />} />
          <Route path="/product/:id" element={<ProductDetails user={user} showAlert={showAlert} />} />
          <Route path="/cart" element={<Cart user={user} showAlert={showAlert} />} />
          <Route path="/checkout" element={<Checkout user={user} showAlert={showAlert} />} />
          <Route path="/orders" element={<AllOrders user={user} showAlert={showAlert} />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation user={user} showAlert={showAlert} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App; 