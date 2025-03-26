import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLoginPageStatus, loginUser } from '../utils/api';

import './Auth.css';

const Login = ({ setUser, showAlert }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const checkUser = async () => {
      const response = await getLoginPageStatus();

      if(!response.data.success){
        navigate('/');
      }
    };
    checkUser();
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showAlert('Please fill in all fields', 'danger');
      return;
    }

    try {
      // setLoading(true);
      const result = await loginUser(formData);
      // const result = await response.json();

      if(result.error){
        showAlert(result.error, 'danger');
        return;
      }
      // Set user in parent component
      setUser(result.success);
      
      // Show success message
      showAlert('Login successful', 'success');
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      showAlert(error.message || 'Login failed', 'danger');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 