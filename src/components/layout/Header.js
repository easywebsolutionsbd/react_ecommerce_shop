import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, searchProducts } from '../../utils/api';
import './Header.css';

const Header = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const results = await searchProducts(searchTerm);
        setSearchResults(results.data);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  const handleProductClick = (id) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/product/${id}`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>eCommerce</h1>
            </Link>
          </div>

          <div className="search-container">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              <button type="submit">
                <i className="fas fa-search"></i>
              </button>
            </form>

            {showResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="search-result-item"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <img src={product.imageUrl} alt={product.name} />
                    <div className="search-result-info">
                      <h4>{product.name}</h4>
                      <p>${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </div>

          <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <ul>
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-heart"></i> Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link to="/compare" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-exchange-alt"></i> Compare
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-shopping-cart"></i> Cart
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-box"></i> My Orders
                    </Link>
                  </li>
                  <li>
                    <button className="btn-logout" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-sign-in-alt"></i> Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-user-plus"></i> Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 