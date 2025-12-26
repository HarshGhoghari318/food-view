import React from 'react';
import { Link } from 'react-router-dom';
import '../../style/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card auth-card--choice">
        <header className="choice-header">
          <h1 className="auth-title">Register</h1>
          <p className="auth-subtitle">
            Choose the type of account you want to create
          </p>
        </header>

        <div className="choice-grid">
          <Link to="/user/register" className="choice-box">
            <h3>Normal User</h3>
            <p>Order food, manage profile, track orders</p>
          </Link>

          <Link to="/food-partner/register" className="choice-box secondary">
            <h3>Food Partner</h3>
            <p>List items, manage orders, grow your business</p>
          </Link>
        </div>

        <div className="auth-alt-action">
          Already have an account? <Link to="/user/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
