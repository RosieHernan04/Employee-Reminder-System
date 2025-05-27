import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import { getAuth, updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';
import Link from 'next/link';


export default function Settings() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    employeeNumber: '',
    role: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      // Set profile data from auth user
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        employeeNumber: '', // Default empty
        role: '' // Default empty
      });
      
      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Set additional fields if they exist
            setProfileData(prev => ({
              ...prev,
              employeeNumber: userData.employeeNumber || '',
              role: userData.role || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile information
  const updateProfileInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: profileData.displayName
      });
      
      // Update email if changed
      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }
      
      // Update additional data in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileData.displayName,
        email: profileData.email,
        employeeNumber: profileData.employeeNumber,
        role: profileData.role,
        updatedAt: new Date()
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'danger', text: `Error updating profile: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', text: 'New passwords do not match!' });
      setSaving(false);
      return;
    }
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'danger', text: `Error changing password: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        {/* Enhanced Title Styling */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-4 fw-bold text-primary mb-0">
            Settings
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Settings</li>
          </ol>
        </nav>

        {/* Alert Message */}
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage({ type: '', text: '' })}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Tabs Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-2"></i>
              Profile Information
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <i className="bi bi-key me-2"></i>
              Change Password
            </button>
          </li>
        </ul>

        {/* Content Area */}
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading settings...</p>
              </div>
            ) : (
              <>
                {/* Profile Information Form */}
                {activeTab === 'profile' && (
                  <div className="profile-settings">
                    <h4 className="mb-4">Update Profile Information</h4>
                    
                    <form onSubmit={updateProfileInfo}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control bubbly-input"
                              id="displayName"
                              name="displayName"
                              value={profileData.displayName}
                              onChange={handleProfileChange}
                              placeholder="Full Name"
                              required
                            />
                            <label htmlFor="displayName">Full Name</label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="email"
                              className="form-control bubbly-input"
                              id="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              placeholder="Email Address"
                              required
                            />
                            <label htmlFor="email">Email Address</label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control bubbly-input"
                              id="employeeNumber"
                              name="employeeNumber"
                              value={profileData.employeeNumber}
                              onChange={handleProfileChange}
                              placeholder="Employee Number"
                              required
                            />
                            <label htmlFor="employeeNumber">Employee Number</label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control bubbly-input"
                              id="role"
                              name="role"
                              value={profileData.role}
                              onChange={handleProfileChange}
                              placeholder="Role"
                              required
                            />
                            <label htmlFor="role">Role</label>
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <button 
                            type="submit" 
                            className="btn btn-primary bubbly-button"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-save me-2"></i>
                                Save Profile Changes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Change Password Form */}
                {activeTab === 'password' && (
                  <div className="password-settings">
                    <h4 className="mb-4">Change Password</h4>
                    
                    <form onSubmit={changePassword}>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <div className="form-floating mb-3">
                            <input
                              type="password"
                              className="form-control bubbly-input"
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              placeholder="Current Password"
                              required
                            />
                            <label htmlFor="currentPassword">Current Password</label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="password"
                              className="form-control bubbly-input"
                              id="newPassword"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              placeholder="New Password"
                              required
                              minLength="6"
                            />
                            <label htmlFor="newPassword">New Password</label>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="password"
                              className="form-control bubbly-input"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              placeholder="Confirm New Password"
                              required
                              minLength="6"
                            />
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <button 
                            type="submit" 
                            className="btn btn-primary bubbly-button"
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-key me-2"></i>
                                Change Password
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .title-underline {
          height: 4px;
          width: 100px;
          border-radius: 2px;
          background: linear-gradient(90deg, #ffc107, #28a745, #8b4513, #dc3545);
        }
        
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          padding: 0.75rem 1.25rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-tabs .nav-link:hover {
          color: #2c3e50;
          background-color: transparent;
          border-bottom: 2px solid #dee2e6;
        }
        
        .nav-tabs .nav-link.active {
          color: #2c3e50;
          background-color: transparent;
          border-bottom: 2px solid #0d6efd;
        }
        
        .card {
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: none;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .bubbly-input {
          border-radius: 10px;
          border: 1px solid #ced4da;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }
        
        .bubbly-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        
        .bubbly-button {
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .bubbly-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </Layout>
  );
}