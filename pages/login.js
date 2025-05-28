import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db, messaging } from "../lib/firebase.ts";
import { signInWithEmailAndPassword, browserLocalPersistence, setPersistence } from "firebase/auth";
import { useRouter } from "next/router";
import { useUser } from "../dataconnect/context/UserContext";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import Image from 'next/image';


export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Set persistence when component mounts
    if (auth) {
      setPersistence(auth, browserLocalPersistence)
        .catch((error) => {
          console.error("Error setting persistence:", error);
        });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
  
    if (!selectedRole) {
      setError("Please select a role before logging in.");
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("Attempting login with:", {
        email: formData.email,
        selectedRole: selectedRole
      });
      
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      console.log("Firebase Auth successful, fetching user role...");
      const userRole = await fetchUserRole(user.uid);
      console.log("User role from Firestore:", userRole);
      console.log("Selected role for comparison:", selectedRole);
      
      // Case-insensitive role comparison
      const normalizedUserRole = userRole?.toLowerCase() || '';
      const normalizedSelectedRole = selectedRole.toLowerCase();
      
      console.log("Normalized roles for comparison:", {
        normalizedUserRole,
        normalizedSelectedRole
      });
      
      if (normalizedUserRole !== normalizedSelectedRole) {
        console.log("Role mismatch:", {
          firestoreRole: userRole,
          selectedRole: selectedRole
        });
        setError("Invalid role for this account. Please select the correct role.");
        setLoading(false);
        return;
      }
    
      const userData = {
        name: user.displayName || formData.email.split("@")[0],
        email: user.email,
        uid: user.uid,
        role: userRole,
      };
    
      console.log("Setting user data:", userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    
      setSuccess("Login successful! Redirecting...");
      
      // --- FCM Notification Permission and Token Save ---
      if (typeof window !== "undefined" && typeof Notification !== "undefined") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          try {
            // Register your service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;

            // Get token using the registered service worker
            const token = await getToken(messaging, {
              vapidKey: "BJ_RCM70heB9TlpBrBo2ioe5N7cNGAYPVYl_Nv35QYAWLfeWqbVyYLnciOZQnxdQ5edeE6QDh-EY5wb294DKsC8",
              serviceWorkerRegistration: registration
            });

            if (token) {
              await updateDoc(doc(db, "users", user.uid), {
                fcmToken: token
              });
              console.log("✅ FCM token saved to Firestore:", token);
            } else {
              console.warn("⚠️ No token retrieved.");
            }
          } catch (error) {
            console.error("❌ Error getting FCM token or updating Firestore:", error);
          }
        }
      }
      // --- End FCM logic ---

      if (normalizedUserRole === 'admin') {
        console.log("Redirecting to admin dashboard...");
        router.push('/admin/dashboard');
      } else {
        console.log("Redirecting to employee dashboard...");
        router.push('/employee/dashboard');
      }
    } catch (err) {
      console.error("Login error details:", err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email format. Please enter a valid email address.");
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (uid) => {
    try {
      console.log("Fetching user role for UID:", uid);
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        console.log("Role found in Firestore:", role);
        return role;
      } else {
        console.log("No user document found in Firestore");
        throw new Error("User role not found in database");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      throw error;
    }
  };

  return (
    <div className="login-container">
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
          maxWidth: '420px',
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
                  border: '2px solid rgba(255, 255, 255, 0.5)'
                }}
              />
              <h2 style={{
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '10px'
              }}>Welcome Back!</h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem'
              }}>Sign in to your account</p>
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

            <div className="d-flex justify-content-center gap-3 mb-4">
              <button
                className={`role-btn ${selectedRole === "Admin" ? "active" : ""}`}
                onClick={() => setSelectedRole("Admin")}
                style={{
                  background: selectedRole === "Admin" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  padding: '10px 25px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                Admin
              </button>
              <button
                className={`role-btn ${selectedRole === "Employee" ? "active" : ""}`}
                onClick={() => setSelectedRole("Employee")}
                style={{
                  background: selectedRole === "Employee" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  padding: '10px 25px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                Employee
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
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
              <div className="mb-4" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
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
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#333",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    padding: 0
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center mt-4">
                <p style={{ 
                  color: '#fff', 
                  fontSize: '0.95rem',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
                }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" style={{ 
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.5)'
                  }}>
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #2d8659 0%, #ff8c42 50%, #8d6e63 100%);
        }
        
        input::placeholder {
          color: rgba(0, 0, 0, 0.6);
        }
        
        input:focus {
          border-color: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
        }
        
        .role-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: translateY(-1px);
        }
        
        .role-btn.active {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.8) !important;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #333;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.8) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
