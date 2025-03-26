import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist, addToCart } from '../utils/api';
import './Wishlist.css';

const Wishlist = ({ user, showAlert }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const data = await getWishlist();

        setWishlistItems(data.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        showAlert('Failed to load wishlist', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
      showAlert('Product removed from wishlist', 'success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showAlert('Failed to remove product from wishlist', 'danger');
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
      <div className="wishlist-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h1>My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <i className="fas fa-heart-broken"></i>
          <p>Your wishlist is empty</p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlistItems.map((item) => (
            <div key={item._id} className="wishlist-item">
              <div className="wishlist-item-image">
                <img src={item.imageUrl} alt={item.name} />
              </div>
              <div className="wishlist-item-details">
                <h3>
                  <Link to={`/product/${item._id}`}>{item.name}</Link>
                </h3>
                <p className="wishlist-item-price">${item.price.toFixed(2)}</p>
                <p className="wishlist-item-status">
                  {item.inStock ? (
                    <span className="in-stock">In Stock</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </p>
              </div>
              <div className="wishlist-item-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(item._id)}
                  disabled={!item.inStock}
                >
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemoveFromWishlist(item._id)}
                >
                  <i className="fas fa-trash"></i> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 