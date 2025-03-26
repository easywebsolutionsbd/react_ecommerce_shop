import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCompareList, removeFromCompareList, addToCart } from '../utils/api';
import './Compare.css';

const Compare = ({ user, showAlert }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompareList = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const data = await getCompareList();
        setCompareItems(data.data);
      } catch (error) {
        console.error('Error fetching compare list:', error);
        showAlert('Failed to load compare list', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchCompareList();
  }, [user, navigate]);

  const handleRemoveFromCompare = async (productId) => {
    try {
      await removeFromCompareList(productId);
      setCompareItems(compareItems.filter(item => item._id !== productId));
      showAlert('Product removed from compare list', 'success');
    } catch (error) {
      console.error('Error removing from compare list:', error);
      showAlert('Failed to remove product from compare list', 'danger');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      showAlert('Product added to cart', 'success');
      navigate('/cart');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showAlert('Failed to add product to cart', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="compare-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="compare-container">
      <h1>Compare Products</h1>

      {compareItems.length === 0 ? (
        <div className="empty-compare">
          <i className="fas fa-exchange-alt"></i>
          <p>Your compare list is empty</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Product</th>
                {compareItems.map(item => (
                  <th key={item._id}>
                    <div className="compare-product-header">
                      <img src={item.imageUrl} alt={item.name} />
                      <h3>
                        <Link to={`/product/${item._id}`}>{item.name}</Link>
                      </h3>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveFromCompare(item._id)}
                        title="Remove from compare"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price</td>
                {compareItems.map(item => (
                  <td key={item._id} className="compare-price">
                    ${item.price.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Category</td>
                {compareItems.map(item => (
                  <td key={item._id}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Rating</td>
                {compareItems.map(item => (
                  <td key={item._id}>
                    <div className="compare-rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.floor(item.rating) ? 'filled' : ''}`}
                        ></i>
                      ))}
                      <span>({item.numReviews})</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Availability</td>
                {compareItems.map(item => (
                  <td key={item._id}>
                    {item.inStock ? (
                      <span className="in-stock">In Stock</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Description</td>
                {compareItems.map(item => (
                  <td key={item._id} className="compare-description">
                    {item.description}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Action</td>
                {compareItems.map(item => (
                  <td key={item._id}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(item._id)}
                      disabled={!item.inStock}
                    >
                      <i className="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare; 