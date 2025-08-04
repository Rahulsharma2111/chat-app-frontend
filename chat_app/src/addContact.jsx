import React from 'react'
import { useState } from "react";
import "./AddContact.css";

export default function AddContact() {
    const userData = JSON.parse(localStorage.getItem('userData'));
  const [formData, setFormData] = useState({
    mobile_number: "",
    name: "",
    user_id: userData.id
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/contacts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Contact added successfully!");
        setFormData({ mobile_number: "", name: "", user_id: "" });
      } else {
        setMessage(`Failed: ${result.message || "Something went wrong"}`);
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Add New Contact</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile_number"
              placeholder="Enter mobile number"
              value={formData.mobile_number}
              onChange={handleChange}
              required
            />
          </div>

          {/* <div className="form-group">
            <label>User ID</label>
            <input
              type="number"
              name="user_id"
              placeholder="Enter user ID"
              value={formData.user_id}
              onChange={handleChange}
              required
            />
          </div> */}

          <button type="submit" className="submit-btn">Add Contact</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

