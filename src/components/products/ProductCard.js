import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, addToWishlist, addToCompareList, getProduct } from '../../utils/api';
import './ProductCard.css';

const ProductCard = ({ product, user, showAlert }) => {
  const navigate = useNavigate();
  const handleAddToCart = async () => {
    try {
      if (!user) {
        showAlert('Please login to add items to cart', 'danger');
        navigate('/login');
        window.scrollTo(0, 0);
        return;
      }

      await addToCart(product._id, 1);
      showAlert(`${product.name} added to cart`, 'success');
      navigate('/cart');
      window.scrollTo(0, 0);
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      if (!user) {
        showAlert('Please login to add items to wishlist', 'danger');
        navigate('/login');
        window.scrollTo(0, 0);
        return;
      }

      await addToWishlist(product._id);
      showAlert(`${product.name} added to wishlist`, 'success');
      navigate('/wishlist');
      window.scrollTo(0, 0);
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  const handleAddToCompare = async () => {
    try {
      if (!user) {
        showAlert('Please login to add items to compare list', 'danger');
        navigate('/login');
        window.scrollTo(0, 0);
        return;
      }

      await addToCompareList(product._id);
      showAlert(`${product.name} added to compare list`, 'success');
      navigate('/compare');
      window.scrollTo(0, 0);
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imageUrl} alt={product.name} />
        <div className="product-actions">
          <button onClick={handleAddToWishlist} title="Add to Wishlist">
            <i className="fas fa-heart"></i>
          </button>
          <button onClick={handleAddToCompare} title="Add to Compare">
            <i className="fas fa-exchange-alt"></i>
          </button>
          <button onClick={handleAddToCart} title="Add to Cart">
            <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <i
              key={i}
              className={`fas fa-star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
            ></i>
          ))}
          <span>({product.numReviews})</span>
        </div>
        <div className="product-buttons">
          <button className="btn btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <Link to={`/product/${product._id}`} className="btn btn-secondary" >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 