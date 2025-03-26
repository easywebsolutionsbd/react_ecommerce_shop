import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, getRegisterPageStatus } from '../utils/api';
import './Auth.css';

const Register = ({ setUser, showAlert }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const checkUser = async () => {
      const response = await getRegisterPageStatus();

      if(!response.data.success){
        navigate('/');
      }
    };
    checkUser();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'danger');
      return;
    }

    try {
      // setLoading(true);
      
      // Remove confirmPassword before sending to API
      const userData = {
        name,
        email,
        password,
      };
      
      const response = await registerUser(userData);

      const result = await response.json();

      if(result.errors){
        const errors = result.errors.map(error => ` ${error}. `);
        showAlert(errors, 'danger');
        return;
      }

      localStorage.setItem('token', result.token);
      // Set user in parent component
      setUser(localStorage.getItem('token'));
      
      // Show success message
      showAlert('Registration successful', 'success');
      
      // Redirect to home page
      // navigate('/');
      location.replace('/');
    } catch (error) {
      showAlert(error.message || 'Registration failed', 'danger');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Register'}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 