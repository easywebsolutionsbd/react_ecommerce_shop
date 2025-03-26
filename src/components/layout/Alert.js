import React from 'react';
import './Alert.css';

const Alert = ({ alert }) => {
  return (
    <div className={`alert alert-${alert.type}`}>
      <i className={`fas ${alert.type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i> {alert.msg}
    </div>
  );
};

export default Alert; 