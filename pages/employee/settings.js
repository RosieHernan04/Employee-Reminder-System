import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import { getAuth, updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../dataconnect/firebase';

export default function EmployeeSettings() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Employee Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    employeeId: '',
    role: '',
    userType: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch employee data on component mount
  useEffect(() => {
    if (user) {
      // Set profile data from auth user
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        employeeId: '',
        role: '',
        userType: ''
      });

      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData(prev => ({
              ...prev,
              employeeId: userData.employeeId || '',
              role: userData.role || '',
              userType: userData.userType || ''
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

      // Get the user document reference
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      // Prepare the user data
      const userData = {
        displayName: profileData.displayName,
        email: profileData.email,
        employeeId: profileData.employeeId,
        role: profileData.role,
        updatedAt: new Date()
      };

      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, userData);
      } else {
        // Create new document with additional fields
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date(),
          userId: user.uid,
          userType: 'employee' // Set default user type
        });
      }

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
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-4 fw-bold text-primary mb-0">
            Employee Settings
            <div className="title-underline bg-primary mt-2"></div>
          </h1>
        </div>

        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
            <li className="breadcrumb-item active">Settings</li>
          </ol>
        </nav>

        {message.text && (
          <div 
            className={`alert alert-${message.type} alert-dismissible fade show mb-4`} 
            role="alert"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px'
            }}
          >
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })} aria-label="Close"></button>
          </div>
        )}

        <div 
          className="card shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px'
          }}
        >
          <div 
            className="card-header"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px 20px 0 0'
            }}
          >
            <ul className="nav nav-tabs card-header-tabs border-0">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('profile')}
                  style={{
                    background: activeTab === 'profile' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '10px',
                    color: activeTab === 'profile' ? '#2d8659' : '#666'
                  }}
                >
                  <i className="bi bi-person me-2"></i>Profile Information
                </button>
              </li>
              <li className="nav-item ms-2">
                <button 
                  className={`nav-link ${activeTab === 'password' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('password')}
                  style={{
                    background: activeTab === 'password' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '10px',
                    color: activeTab === 'password' ? '#2d8659' : '#666'
                  }}
                >
                  <i className="bi bi-key me-2"></i>Change Password
                </button>
              </li>
            </ul>
          </div>
          <div className="card-body p-4">
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
                    <h4 className="mb-4 text-primary">Update Profile Information</h4>
                    <form onSubmit={updateProfileInfo}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="displayName"
                            value={profileData.displayName}
                            onChange={handleProfileChange}
                            required
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Employee ID</label>
                          <input
                            type="text"
                            className="form-control"
                            name="employeeId"
                            value={profileData.employeeId}
                            onChange={handleProfileChange}
                            required
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Role</label>
                          <input
                            type="text"
                            className="form-control"
                            name="role"
                            value={profileData.role}
                            onChange={handleProfileChange}
                            required
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                          style={{
                            background: 'linear-gradient(45deg, #2d8659, #1a5c3c)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 20px'
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Change Password Form */}
                {activeTab === 'password' && (
                  <div className="password-settings">
                    <h4 className="mb-4 text-primary">Change Password</h4>
                    <form onSubmit={changePassword}>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="password"
                              className="form-control"
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              placeholder="Current Password"
                              required
                              style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '10px',
                                color: '#333'
                              }}
                            />
                            <label htmlFor="currentPassword">Current Password</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="password"
                              className="form-control"
                              id="newPassword"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              placeholder="New Password"
                              required
                              style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '10px',
                                color: '#333'
                              }}
                            />
                            <label htmlFor="newPassword">New Password</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="password"
                              className="form-control"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              placeholder="Confirm New Password"
                              required
                              style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '10px',
                                color: '#333'
                              }}
                            />
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                          </div>
                        </div>
                        <div className="col-12">
                          <button 
                            type="submit" 
                            className="btn btn-primary px-4"
                            disabled={saving}
                            style={{
                              background: 'linear-gradient(135deg, rgba(45, 134, 89, 0.8) 0%, rgba(45, 134, 89, 0.9) 100%)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Changing Password...
                              </>
                            ) : (
                              'Change Password'
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
    </Layout>
  );
}
