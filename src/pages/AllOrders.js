import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../utils/api';
import './AllOrders.css';

const AllOrders = ({ user, showAlert }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        window.scrollTo(0, 0);
        setLoading(true);
        const data = await getOrders();

        setOrders(data.data);
        setLoading(false);
      } catch (error) {
        showAlert('Failed to fetch orders', 'danger');
        setLoading(false);
      }
    };

    if (!user) {
      showAlert('Please login to view orders', 'danger');
      navigate('/login');
      window.scrollTo(0, 0);
      return;
    }

    fetchOrders();
  }, [user, navigate, showAlert]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'delivered':
        return 'status-delivered';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus);

  const handleViewOrder = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      <div className="orders-filter">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select 
          id="status-filter" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-shopping-bag"></i>
          <h2>No orders found</h2>
          {filterStatus !== 'all' ? (
            <p>You don't have any {filterStatus} orders.</p>
          ) : (
            <>
              <p>You haven't placed any orders yet.</p>
              <button 
                onClick={() => navigate('/products')} 
                className="btn-shop-now"
              >
                Shop Now
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span>Order #:</span> {order._id}
                </div>
                <div className="order-date">
                  <span>Placed on:</span> {formatDate(order.createdAt)}
                </div>
              </div>
              
              <div className="order-info">
                <div className="order-status">
                  <span>Status:</span> 
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-total">
                  <span>Total:</span> ${order.total.toFixed(2)}
                </div>
              </div>
              
              <div className="order-items-preview">
                <h3>Items ({order.items.length})</h3>
                <div className="order-items-grid">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item._id} className="order-item">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                      />
                      <div className="item-quantity">x{item.quantity}</div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="more-items">+{order.items.length - 4} more</div>
                  )}
                </div>
              </div>
              
              <div className="order-actions">
                <button 
                  onClick={() => handleViewOrder(order._id)} 
                  className="btn-view-order"
                >
                  View Order Details
                </button>
                {order.status === 'Delivered' && (
                  <button className="btn-review">
                    Write a Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders; 