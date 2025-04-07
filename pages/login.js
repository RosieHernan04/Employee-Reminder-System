import React, { useState } from "react";
import Link from "next/link";
import { auth } from "../lib/firebase"; // Import Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { useUser } from "../dataconnect/context/UserContext"; // Use UserContext
import { getDoc, doc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../lib/firebase"; // Import Firestore database instance

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState(null); // State for selected role
  const [error, setError] = useState(""); // State for error messages
  const [success, setSuccess] = useState(""); // State for success messages
  const router = useRouter(); // For navigation after successful login
  const { setUser } = useUser(); // Access setUser from UserContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); // Start loading state
  
    if (!selectedRole) {
      setError("Please select a role before logging in.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("Logging in user:", formData.email);
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
    
      const userRole = await fetchUserRole(user.uid);
      console.log("Fetched role from Firestore:", userRole);
      console.log("Selected role:", selectedRole.toLowerCase());
    
      if (userRole.toLowerCase() !== selectedRole.toLowerCase()) {
        setError("Invalid role. Please contact support.");
        return;
      }
    
      const userData = {
        name: user.displayName || formData.email.split("@")[0],
        email: user.email,
        uid: user.uid,
        role: userRole,
      };
    
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    
      setSuccess("Login successful! Redirecting...");
      
      // Role-based redirection after successful login
      if (selectedRole === "Admin") {
        router.push('/admin/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        console.log("Role retrieved from Firestore:", role);
        return role;
      } else {
        throw new Error("User role not found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      throw error;
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
        <div style={{ zIndex: 2, width: "100%", maxWidth: "500px" }}>
          <h1
            style={{
              textAlign: "center",
              color: "#FFD700",
              marginBottom: "20px",
              textShadow: "3px 3px 8px rgba(0, 0, 0, 0.9)",
              fontSize: "2.5rem",
              fontWeight: "bold",
            }}
          >
            Welcome to ADECMPC
          </h1>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "40px",
              borderRadius: "15px",
              boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Log In</h2>
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
            {success && <p style={{ color: "green" }}>{success}</p>} {/* Display success */}
            <div className="d-flex justify-content-center mb-4">
              <button
                className={`btn ${selectedRole === "Admin" ? "btn-primary" : "btn-outline-primary"} mx-3`}
                style={{
                  fontSize: "1.2rem",
                  padding: "15px 30px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                }}
                onClick={() => setSelectedRole("Admin")}
              >
                Admin
              </button>
              <button
                className={`btn ${selectedRole === "Employee" ? "btn-primary" : "btn-outline-primary"} mx-3`}
                style={{
                  fontSize: "1.2rem",
                  padding: "15px 30px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                }}
                onClick={() => setSelectedRole("Employee")}
              >
                Employee
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
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
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
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
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
