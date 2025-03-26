import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder, processBkashPayment } from '../utils/api';
import './Checkout.css';

const Checkout = ({ user, showAlert }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  // Form states
  const [formData, setFormData] = useState({
    // Shipping info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    
    // Payment info (for credit card)
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    
    // Order notes
    orderNotes: '',
    bkashNumber: ''
  });

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        navigate('/login');
        window.scrollTo(0, 0);
        return;
      }

      try {
        setLoading(true);
        const data = await getCart();
        
        if (!data.items || data.items.length === 0) {
          showAlert('Your cart is empty', 'danger');
          navigate('/cart');
          window.scrollTo(0, 0);
          return;
        }
        
        setCartItems(data.items || []);
        setLoading(false);
      } catch (error) {
        showAlert(error.message || 'Failed to fetch cart', 'danger');
        setLoading(false);
        navigate('/cart');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateShippingInfo = () => {
    const { firstName, lastName, email, phone, address, city, state, zipCode, country } = formData;
    
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode || !country) {
      showAlert('Please fill in all required fields', 'danger');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return false;
    }
    
    return true;
  };

  const validatePaymentInfo = () => {
    if (paymentMethod === 'credit_card') {
      const { cardName, cardNumber, cardExpiry, cardCvv } = formData;
      
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        showAlert('Please fill in all payment fields', 'danger');
        return false;
      }
      
      // Basic card number validation (16 digits)
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        showAlert('Card number should be 16 digits', 'danger');
        return false;
      }
      
      // Basic expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(cardExpiry)) {
        showAlert('Expiry date should be in MM/YY format', 'danger');
        return false;
      }
      
      // Basic CVV validation (3 or 4 digits)
      if (!/^[0-9]{3,4}$/.test(cardCvv)) {
        showAlert('CVV should be 3 or 4 digits', 'danger');
        return false;
      }
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShippingInfo()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && validatePaymentInfo()) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // Validate bKash number if bKash is selected as payment method
      if (paymentMethod === 'bkash') {
        if (!formData.bkashNumber || formData.bkashNumber.length !== 11) {
          showAlert('Please enter a valid bKash number (11 digits)', 'danger');
          setLoading(false);
          return;
        }
      }
      
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod,
        orderNotes: formData.orderNotes,
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax,
        shipping,
        total
      };
      
      const response = await createOrder(orderData);
      
      // If bKash payment method is selected, process the payment
      if (paymentMethod === 'bkash') {
        try {
          showAlert('Processing bKash payment...', 'info');
          
          // Process bKash payment
          const paymentResult = await processBkashPayment(
            formData.bkashNumber,
            total,
            response.data._id
          );
          
          if (paymentResult.success) {
            showAlert('bKash payment successful! Transaction ID: ' + paymentResult.transactionId, 'success');
          } else {
            showAlert('bKash payment failed. Please try again.', 'danger');
            setLoading(false);
            return;
          }
        } catch (error) {
          showAlert(error.message || 'bKash payment failed', 'danger');
          setLoading(false);
          return;
        }
      }
      
      setLoading(false);
      showAlert('Order placed successfully!', 'success');
      
      // Navigate to order confirmation page
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (error) {
      setLoading(false);
      showAlert(error.message || 'Failed to place order', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Processing your request...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-steps">
        <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-title">Shipping</div>
        </div>
        <div className="step-connector"></div>
        <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-title">Payment</div>
        </div>
        <div className="step-connector"></div>
        <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-title">Review</div>
        </div>
      </div>
      
      <div className="checkout-content">
        <div className="checkout-main">
          {step === 1 && (
            <div className="checkout-shipping">
              <h2>Shipping Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State/Province *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">Zip/Postal Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Brazil">Brazil</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="orderNotes">Order Notes (Optional)</label>
                <textarea
                  id="orderNotes"
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="Notes about your order, e.g. special notes for delivery"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="checkout-payment">
              <h2>Payment Method</h2>
              
              <div className="payment-methods">
                <div className="payment-method">
                  <input
                    type="radio"
                    id="credit_card"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                  />
                  <label htmlFor="credit_card">
                    <i className="far fa-credit-card"></i> Credit Card
                  </label>
                </div>
                
                <div className="payment-method">
                  <input
                    type="radio"
                    id="bkash"
                    name="paymentMethod"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                  />
                  <label htmlFor="bkash">
                    <i className="fas fa-mobile-alt"></i> bKash
                  </label>
                </div>
                
                <div className="payment-method">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                  />
                  <label htmlFor="paypal">
                    <i className="fab fa-paypal"></i> PayPal
                  </label>
                </div>
                
                <div className="payment-method">
                  <input
                    type="radio"
                    id="cash_on_delivery"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                  />
                  <label htmlFor="cash_on_delivery">
                    <i className="fas fa-money-bill-wave"></i> Cash on Delivery
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'credit_card' && (
                <div className="credit-card-form">
                  <div className="form-group">
                    <label htmlFor="cardName">Name on Card *</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cardExpiry">Expiry Date *</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardCvv">CVV *</label>
                      <input
                        type="text"
                        id="cardCvv"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'bkash' && (
                <div className="bkash-form">
                  <div className="bkash-info">
                    <div className="bkash-logo">
                      <i className="fas fa-mobile-alt"></i>
                      <span>bKash</span>
                    </div>
                    <p>Enter your bKash account number below. You will receive a payment confirmation message on your phone.</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bkashNumber">bKash Number *</label>
                    <input
                      type="tel"
                      id="bkashNumber"
                      name="bkashNumber"
                      value={formData.bkashNumber || ''}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      maxLength="11"
                      required
                    />
                  </div>
                  
                  <div className="bkash-instructions">
                    <h4>How to pay with bKash:</h4>
                    <ol>
                      <li>Enter your bKash account number above</li>
                      <li>Proceed with your order</li>
                      <li>After submitting, you'll receive a payment request on your bKash app</li>
                      <li>Confirm the payment in your bKash app using your PIN</li>
                      <li>Your order will be processed once payment is confirmed</li>
                    </ol>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'paypal' && (
                <div className="paypal-info">
                  <p>You will be redirected to PayPal to complete your purchase securely.</p>
                </div>
              )}
              
              {paymentMethod === 'cash_on_delivery' && (
                <div className="cod-info">
                  <p>Pay with cash upon delivery. Please have the exact amount ready for our delivery person.</p>
                </div>
              )}
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={handlePrevStep}
                >
                  Back to Shipping
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNextStep}
                >
                  Review Order
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="checkout-review">
              <h2>Review Your Order</h2>
              
              <div className="review-section">
                <h3>Shipping Information</h3>
                <div className="review-info">
                  <p>
                    <strong>Name:</strong> {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}, {formData.country}
                  </p>
                  {formData.orderNotes && (
                    <p>
                      <strong>Order Notes:</strong> {formData.orderNotes}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="review-section">
                <h3>Payment Method</h3>
                <div className="review-info">
                  {paymentMethod === 'credit_card' && (
                    <p>
                      <i className="far fa-credit-card"></i> Credit Card ending in {formData.cardNumber.slice(-4)}
                    </p>
                  )}
                  {paymentMethod === 'bkash' && (
                    <p>
                      <i className="fas fa-mobile-alt"></i> bKash
                    </p>
                  )}
                  {paymentMethod === 'paypal' && (
                    <p>
                      <i className="fab fa-paypal"></i> PayPal
                    </p>
                  )}
                  {paymentMethod === 'cash_on_delivery' && (
                    <p>
                      <i className="fas fa-money-bill-wave"></i> Cash on Delivery
                    </p>
                  )}
                </div>
              </div>
              
              <div className="review-section">
                <h3>Order Items</h3>
                <div className="review-items">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="review-item">
                      <div className="review-item-image">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                        />
                      </div>
                      <div className="review-item-details">
                        <h4>{item.product.name}</h4>
                        <div className="review-item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="review-item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={handlePrevStep}
                >
                  Back to Payment
                </button>
                <button
                  type="button"
                  className="btn-place-order"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="checkout-summary">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.product._id} className="summary-item">
                <div className="summary-item-name">
                  <span className="item-quantity">{item.quantity} ×</span> {item.product.name}
                </div>
                <div className="summary-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
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
            
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 