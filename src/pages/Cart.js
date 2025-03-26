import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../utils/api';
import './Cart.css';

const Cart = ({ user, showAlert }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        navigate('/login');
        window.scrollTo(0, 0);
        return;
      }

      try {
        window.scrollTo(0, 0);
        setLoading(true);
        const data = await getCart();
        setCartItems(data.items || []);
        setLoading(false);
      } catch (error) {
        showAlert(error.message || 'Failed to fetch cart', 'danger');
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  useEffect(() => {
    // Calculate cart totals
    const itemsSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    setSubtotal(itemsSubtotal);
    setTax(itemsSubtotal * 0.1); // 10% tax
    
    // Free shipping for orders over $100
    const shippingCost = itemsSubtotal > 100 ? 0 : 10;
    setShipping(shippingCost);
    
    setTotal(itemsSubtotal + (itemsSubtotal * 0.1) + shippingCost);
  }, [cartItems]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(productId, newQuantity);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      showAlert('Cart updated successfully', 'success');
    } catch (error) {
      showAlert(error.message || 'Failed to update cart', 'danger');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.filter(item => item.product._id !== productId)
      );
      
      showAlert('Item removed from cart', 'success');
    } catch (error) {
      showAlert(error.message || 'Failed to remove item from cart', 'danger');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        setCartItems([]);
        showAlert('Cart cleared successfully', 'success');
      } catch (error) {
        showAlert(error.message || 'Failed to clear cart', 'danger');
      }
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showAlert('Your cart is empty', 'danger');
      return;
    }
    
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <i className="fas fa-shopping-cart empty-cart-icon"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="btn-continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
              <div className="cart-header-product">Product</div>
              <div className="cart-header-price">Price</div>
              <div className="cart-header-quantity">Quantity</div>
              <div className="cart-header-subtotal">Subtotal</div>
              <div className="cart-header-actions"></div>
            </div>
            
            {cartItems.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="cart-item-product">
                  <div className="cart-item-image">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                    />
                  </div>
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">
                      <Link to={`/product/${item.product._id}`}>
                        {item.product.name}
                      </Link>
                    </h3>
                    {item.product.attributes && Object.entries(item.product.attributes).map(([key, value]) => (
                      <div key={key} className="cart-item-attribute">
                        <span>{key}: </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="cart-item-price">
                  ${item.price.toFixed(2)}
                </div>
                
                <div className="cart-item-quantity">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value))} 
                      readOnly
                    />
                    <button 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="cart-item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div className="cart-item-actions">
                  <button 
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="btn-remove-item"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="cart-actions">
              <div className="cart-coupon">
                <input 
                  type="text" 
                  placeholder="Coupon code" 
                  className="coupon-input"
                />
                <button className="btn-apply-coupon">
                  Apply Coupon
                </button>
              </div>
              
              <button 
                onClick={handleClearCart}
                className="btn-clear-cart"
              >
                Clear Cart
              </button>
            </div>
          </div>
          
          <div className="cart-summary">
            <h2 className="summary-title">Cart Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {shipping === 0 
                  ? 'Free' 
                  : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            
            {shipping > 0 && (
              <div className="free-shipping-message">
                Add ${(100 - subtotal).toFixed(2)} more to get FREE shipping!
              </div>
            )}
            
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="btn-checkout"
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
            
            <div className="continue-shopping">
              <Link to="/" className="btn-continue">
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 