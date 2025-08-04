import React, { useState } from 'react';
import './RegisterItself.css';

function RegisterItself() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    mobile_number: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Store response data in localStorage
      localStorage.setItem('userData', JSON.stringify(result.data));
      
      // Optional: You can redirect or show success message here
      console.log('Registration successful, data saved to localStorage');
      
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
     <div className="register-card">
      <div className="card-header">
        <h1>Create Your Account</h1>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              name="name" 
              id="name"
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              name="username" 
              id="username"
              placeholder="johndoe123" 
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number</label>
            <input 
              type="text" 
              name="mobile_number" 
              id="mobile_number"
              placeholder="9876543210" 
              value={formData.mobile_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="text" 
              name="email" 
              id="email"
              placeholder="your@email.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterItself;