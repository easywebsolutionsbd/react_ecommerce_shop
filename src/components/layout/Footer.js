import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h2>eCommerce</h2>
            <p>
              Your one-stop shop for all your shopping needs. We provide quality products at affordable prices.
            </p>
            <div className="social-links">
              <a href="#!">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#!">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#!">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#!">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section categories">
            <h3>Categories</h3>
            <ul>
              <li>
                <Link to="/?category=electronics">Electronics</Link>
              </li>
              <li>
                <Link to="/?category=clothing">Clothing</Link>
              </li>
              <li>
                <Link to="/?category=books">Books</Link>
              </li>
              <li>
                <Link to="/?category=home">Home & Kitchen</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>Contact Us</h3>
            <p>
              <i className="fas fa-map-marker-alt"></i> 123 Main Street, City, Country
            </p>
            <p>
              <i className="fas fa-phone"></i> +1 234 567 8900
            </p>
            <p>
              <i className="fas fa-envelope"></i> info@ecommerce.com
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} eCommerce. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 