import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../utils/api';
import './OrderConfirmation.css';

const OrderConfirmation = ({ user, showAlert }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        navigate('/login');
        window.scrollTo(0, 0);
        return;
      }

      try {
        window.scrollTo(0, 0);
        setLoading(true);
        const order = await getOrder(orderId);

        setOrder(order.data);
        setLoading(false);
      } catch (error) {
        showAlert(error.message || 'Failed to fetch order details', 'danger');
        setLoading(false);
        navigate('/');
        window.scrollTo(0, 0);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="order-confirmation-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Order Not Found</h2>
        <p>The order you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-header">
        <div className="confirmation-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1>Thank You for Your Order!</h1>
        <p>Your order has been placed successfully and is being processed.</p>
      </div>

      <div className="order-confirmation-details">
        <div className="order-info-card">
          <h2>Order Information</h2>
          <div className="order-info-content">
            <div className="order-info-row">
              <span>Order Number:</span>
              <span className="order-number">{order._id}</span>
            </div>
            <div className="order-info-row">
              <span>Order Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="order-info-row">
              <span>Payment Method:</span>
              <span>{order.paymentMethod === 'credit_card' ? 'Credit Card' : 
                    order.paymentMethod === 'paypal' ? 'PayPal' :  order.paymentMethod === 'bkash' ? 'Bkash' : 
                    'Cash on Delivery'}</span>
            </div>
            <div className="order-info-row">
              <span>Order Status:</span>
              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="shipping-info-card">
          <h2>Shipping Information</h2>
          <div className="shipping-info-content">
            <p className="shipping-name">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="shipping-address">
              {order.shippingAddress.address}
            </p>
            <p className="shipping-city-state">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="shipping-country">
              {order.shippingAddress.country}
            </p>
            <p className="shipping-contact">
              <strong>Email:</strong> {order.shippingAddress.email}
            </p>
            <p className="shipping-contact">
              <strong>Phone:</strong> {order.shippingAddress.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="order-items-card">
        <h2>Order Items</h2>
        <div className="order-items-table">
          <div className="order-items-header">
            <div className="item-col">Product</div>
            <div className="price-col">Price</div>
            <div className="quantity-col">Quantity</div>
            <div className="total-col">Total</div>
          </div>
          
          {order.items.map((item) => {
            return (
              <div key={item._id} className="order_item_row">
                <div className="item_col">
                  <div className="item_image">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{item.product.name}</h3>
                    {item.product.attributes && Object.entries(item.product.attributes).map(([key, value]) => (
                      <div key={key} className="item-attribute">
                        <span>{key}: </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="price-col">${item.price.toFixed(2)}</div>
                <div className="quantity-col">{item.quantity}</div>
                <div className="total-col">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            )
          }
          )}
        </div>
      </div>

      <div className="order-summary-card">
        <h2>Order Summary</h2>
        <div className="order-summary-content">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>
              {order.shipping === 0 
                ? 'Free' 
                : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {order.orderNotes && (
        <div className="order-notes-card">
          <h2>Order Notes</h2>
          <div className="order-notes-content">
            <p>{order.orderNotes}</p>
          </div>
        </div>
      )}

      <div className="order-confirmation-actions">
        <Link to="/" className="btn-continue-shopping">
          Continue Shopping
        </Link>
        <Link to="/orders" className="btn-view-orders">
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;

 