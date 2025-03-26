import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="home-link">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
