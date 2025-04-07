import React, { useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase"; // Import Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "employee",
    username: "",
    password: "",
  });

  const [error, setError] = useState(""); // State for error messages
  const [success, setSuccess] = useState(""); // State for success messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        username: formData.username,
      });

      setSuccess("User registered successfully!"); // Set success message
      setFormData({
        fullName: "",
        email: "",
        role: "employee",
        username: "",
        password: "",
      });
    } catch (err) {
      setError(err.message); // Set error message
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{
          backgroundColor: "#FFEB3B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        <div className="d-flex align-items-center">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src="/487083768_557976863971305_3421396436649360911_n.jpg"
              alt="ADECMPC Logo"
              style={{ height: "50px", marginRight: "10px" }}
            />
            <span className="text-success fw-bold">ADECMPC</span>
          </a>
          <div className="ms-3">
            <Link href="/">
              <button
                className="btn"
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  marginRight: "10px",
                  fontWeight: "bold",
                  padding: "5px 15px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                }}
              >
                Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Background Section */}
      <div
        style={{
          backgroundImage: "url('/social-impact-1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Black Shadow Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        ></div>

        {/* Content */}
        <div style={{ zIndex: 2, width: "100%", maxWidth: "400px" }}>
          <h1
            style={{
              textAlign: "center",
              color: "#fff",
              marginBottom: "20px",
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.9)",
            }}
          >
            Welcome to ADECMPC
          </h1>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "10px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Sign Up</h2>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
            {success && <p style={{ color: "green" }}>{success}</p>} {/* Display success */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="fullName" style={{ display: "block", marginBottom: "5px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="role" style={{ display: "block", marginBottom: "5px" }}>
                  Position/Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="username" style={{ display: "block", marginBottom: "5px" }}>
                  Preferred Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#FF9800",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}