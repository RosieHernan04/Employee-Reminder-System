import React, { useState } from "react";
import Link from "next/link";
import { auth, db } from 'lib/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Image from 'next/image';



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
    <div className="signup-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light" style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
      }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <Image
              src="/487083768_557976863971305_3421396436649360911_n.jpg"
              alt="ADECMPC Logo"
              width={45}
              height={45}
              style={{ 
                marginRight: "10px",
                borderRadius: "50%",
                background: "transparent"
              }}
            />
            <span style={{ 
              background: 'linear-gradient(45deg, #2d8659, #1a472a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: "bold",
              fontSize: '1.5rem'
            }}>ADECMPC</span>
          </a>
          <div className="ms-3">
            <Link href="/">
              <button className="btn btn-primary" style={{
                background: 'linear-gradient(45deg, #2d8659, #1a472a)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d8659 0%, #ff8c42 50%, #8d6e63 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          padding: '20px'
        }}>
          {/* Glass Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '40px 30px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div className="text-center mb-4">
            <Image
              src="/487083768_557976863971305_3421396436649360911_n.jpg"
              alt="ADECMPC Logo"
              width={80}
              height={80}
              style={{
                marginBottom: '20px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            />
              <h2 style={{
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '10px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
              }}>Create Account</h2>
              <p style={{
                color: '#fff',
                fontSize: '0.95rem',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
              }}>Join ADECMPC today</p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 82, 82, 0.1)',
                color: '#ff5252',
                padding: '10px 15px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: 'rgba(76, 175, 80, 0.1)',
                color: '#4caf50',
                padding: '10px 15px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#333',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backdropFilter: 'blur(5px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#333',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backdropFilter: 'blur(5px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  required
                />
              </div>
              <div className="mb-3">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#333',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backdropFilter: 'blur(5px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                    appearance: 'none'
                  }}
                  required
                >
                  <option value="employee" style={{ color: '#333', background: '#fff' }}>Employee</option>
                  <option value="admin" style={{ color: '#333', background: '#fff' }}>Admin</option>
                </select>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  name="username"
                  placeholder="Preferred Username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#333',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backdropFilter: 'blur(5px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#333',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backdropFilter: 'blur(5px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(45deg, #2d8659, #1a472a)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
              >
                Sign Up
              </button>
              
              <div className="text-center mt-4">
                <p style={{ 
                  color: '#fff', 
                  fontSize: '0.95rem',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
                }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ 
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.5)'
                  }}>
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .signup-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #2d8659 0%, #ff8c42 50%, #8d6e63 100%);
        }
        
        input::placeholder,
        select::placeholder {
          color: rgba(0, 0, 0, 0.6);
        }
        
        input:focus,
        select:focus {
          border-color: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
        }
        
        select option {
          background-color: #fff;
          color: #333;
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
          -webkit-text-fill-color: #333;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.8) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}