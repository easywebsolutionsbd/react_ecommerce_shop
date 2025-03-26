import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getProducts } from '../utils/api';
import './Home.css';

const Home = ({ user, showAlert }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Get category from URL if present
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
        
        // Build query string
        let queryString = `?page=${currentPage}&limit=8`;
        
        if (selectedCategory) {
          queryString += `&category=${selectedCategory}`;
        }
        
        if (sortBy) {
          queryString += `&sort=${sortBy}`;
        }
        
        const response = await getProducts(queryString);
        
        // Check if response is valid and contains products
        if (Array.isArray(response.products)) {
          setProducts(response.products);
          setTotalPages(Math.ceil(response.total / 8)); // Set total pages based on total products
        } else {
          showAlert('Failed to load products', 'danger');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Failed to load products', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search, currentPage, selectedCategory, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return; // Prevent changing to invalid pages
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'books', name: 'Books' },
    { id: 'home', name: 'Home & Kitchen' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'sports', name: 'Sports' },
    { id: 'other', name: 'Other' },
  ];

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our eCommerce Store</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <button className="btn btn-primary">Shop Now</button>
        </div>
      </div>

      <div className="product-section">
        <div className="product-filters">
          <div className="category-filter">
            <h3>Categories</h3>
            <ul>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={selectedCategory === category.id ? 'active' : ''}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="product-content">
          <div className="product-header">
            <h2>{selectedCategory ? categories.find(c => c.id === selectedCategory).name : 'All Products'}</h2>
            <div className="sort-filter">
              <label htmlFor="sort">Sort By:</label>
              <select id="sort" value={sortBy} onChange={handleSortChange}>
                <option value="">Default</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Rating</option>
                <option value="-createdAt">Newest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </div>
          ) : ( products.length === 0 ? (
            <div className="no-products">
              <p>No products found.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    user={user}
                    showAlert={showAlert}
                  />
                ))}
              </div>

              <div className="pagination">
                <button
                  className="btn-page"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn-page ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  className="btn-page"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 