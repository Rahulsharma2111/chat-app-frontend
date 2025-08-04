import React from 'react';
import './RegisterItself.css';

function RegisterItself() {
  return (
    <div className="register-card">
      <div className="card-header">
        <h1>Create Your Account</h1>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            name="name" 
            id="name"
            placeholder="John Doe" 
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile_number">Mobile Number</label>
          <input 
            type="text" 
            name="mobile_number" 
            id="mobile_number"
            placeholder="9876543210" 
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="text" 
            name="email" 
            id="email"
            placeholder="your@email.com" 
          />
        </div>

        <button type="submit" className="submit-btn">
          Register Now
        </button>
      </div>
    </div>
  );
}

export default RegisterItself;