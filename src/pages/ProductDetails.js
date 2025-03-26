import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, addToCart, addToWishlist, addToCompareList } from '../utils/api';
import './ProductDetails.css';

const ProductDetails = ({ user, showAlert }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        console.log('product : data :', data)
        setProduct(data);
        window.scrollTo(0, 0);
        setLoading(false);
      } catch (error) {
        showAlert(error.message || 'Failed to fetch product details', 'danger');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    const maxStock = product?.stock || 10;
    if (quantity < maxStock) {
      setQuantity(prevQuantity => Math.min(prevQuantity + 1, maxStock));
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showAlert('Please login to add items to cart', 'danger');
      navigate('/login');
      window.scrollTo(0, 0);
      return;
    }

    try {
      await addToCart(product._id, quantity);
      showAlert('Product added to cart successfully', 'success');
      navigate('/cart');
      window.scrollTo(0, 0);
    } catch (error) {
      showAlert(error.message || 'Failed to add product to cart', 'danger');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      showAlert('Please login to add items to wishlist', 'danger');
      navigate('/login');
      window.scrollTo(0, 0);
      return;
    }

    try {
      await addToWishlist(product._id);
      showAlert('Product added to wishlist successfully', 'success');
      navigate('/wishlist');
      window.scrollTo(0, 0);
    } catch (error) {
      showAlert(error.message || 'Failed to add product to wishlist', 'danger');
    }
  };

  const handleAddToCompare = async () => {
    if (!user) {
      showAlert('Please login to add items to compare list', 'danger');
      navigate('/login');
      window.scrollTo(0, 0);
      return;
    }

    try {
      await addToCompareList(product._id);
      showAlert('Product added to compare list successfully', 'success');
      navigate('/compare');
      window.scrollTo(0, 0);
    } catch (error) {
      showAlert(error.message || 'Failed to add product to compare list', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <div className="product-details-grid">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={product.images && product.images.length > 0 
                ? product.images[selectedImage] 
                : product.imageUrl} 
              alt={product.name} 
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} - ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <div className="product-rating">
              <span className="stars">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                  ></i>
                ))}
              </span>
              <span className="rating-count">({product.numReviews} reviews)</span>
            </div>
            <div className="product-sku">
              SKU: <span>{product.sku || 'N/A'}</span>
            </div>
          </div>

          <div className="product-price">
            ${product.price.toFixed(2)}
            {product.oldPrice && (
              <span className="old-price">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="product-availability">
            Availability: 
            <span className={product.inStock  ? 'in-stock' : 'out-of-stock'}>
              {product.inStock  ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="product-short-description">
            <p>{product.shortDescription || product.description.substring(0, 150) + '...'}</p>
          </div>

          <div className="product-primary-actions">
            <div className="quantity-selector">
              <button 
                type="button" 
                onClick={decrementQuantity} 
                className="quantity-btn"
                disabled={quantity <= 1}
              >
                −
              </button>
              <input 
                type="number" 
                min="1" 
                max={product.stock || 10} 
                value={quantity} 
                onChange={handleQuantityChange}
                aria-label="Product quantity" 
              />
              <button 
                type="button" 
                onClick={incrementQuantity} 
                className="quantity-btn"
                disabled={quantity >= (product.stock || 10)}
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart} 
              className="btn-add-to-cart"
              disabled={!product.inStock}
            >
              <i className="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
          
          

          <div className="product-secondary-actions">
            <button onClick={handleAddToWishlist} className="btn-wishlist">
              <i className="far fa-heart"></i> Add to Wishlist
            </button>
            <button onClick={handleAddToCompare} className="btn-compare">
              <i className="fas fa-exchange-alt"></i> Add to Compare
            </button>
          </div>

          <div className="product-categories">
            <span>Category: </span>
            <span className="category-name">{product.category}</span>
          </div>

          <div className="product-tags">
            <span>Tags: </span>
            {product.tags && product.tags.map((tag, index) => (
              <span key={index} className="tag-name">
                {tag}{index < product.tags.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          <div className="product-share">
            <span>Share: </span>
            <div className="social-icons">
              <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-pinterest"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.numReviews})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-pane">
              <div className="product-specifications">
                <table>
                  <tbody>
                    {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
                      <tr key={index}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                    {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                      <tr>
                        <td colSpan="2">No specifications available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-pane">
              <div className="product-reviews">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="reviews-list">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <h4>{review.name}</h4>
                            <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i} 
                                className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {product.relatedProducts.map((relatedProduct, index) => (
              <div key={index} className="related-product-card">
                <div className="related-product-image">
                  <img 
                    src={relatedProduct.imageUrl} 
                    alt={relatedProduct.name} 
                  />
                </div>
                <div className="related-product-info">
                  <h3>{relatedProduct.name}</h3>
                  <div className="related-product-price">${relatedProduct.price.toFixed(2)}</div>
                  <button 
                    onClick={() => navigate(`/product/${relatedProduct._id}`)}
                    className="btn-view-product"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails; 