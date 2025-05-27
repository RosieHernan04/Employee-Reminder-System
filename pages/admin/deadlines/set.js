import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/MainLayout/Layout';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../dataconnect/firebase';

export default function SetDeadlines() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadline] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'general',
    assignedTo: 'all',
    notifications: {
      email: true,
      push: true,
      reminderDays: 3
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'deadlines'), {
        ...deadline,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending'
      });

      alert('Deadline set successfully!');
      router.push('/admin/meetingmanagement');
    } catch (error) {
      console.error('Error setting deadline:', error);
      alert('Error setting deadline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationField = name.split('.')[1];
      setDeadline(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setDeadline(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Set Deadlines</h1>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card floating-card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Deadline Details</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={deadline.title}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="title">Deadline Title</label>
                  </div>

                  <div className="form-floating mb-3">
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={deadline.description}
                      onChange={handleChange}
                      placeholder=" "
                      rows="3"
                      required
                    ></textarea>
                    <label htmlFor="description">Description</label>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="dueDate"
                          name="dueDate"
                          value={deadline.dueDate}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="dueDate">Due Date & Time</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <select
                          className="form-select"
                          id="priority"
                          name="priority"
                          value={deadline.priority}
                          onChange={handleChange}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <label htmlFor="priority">Priority Level</label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={deadline.category}
                          onChange={handleChange}
                        >
                          <option value="general">General</option>
                          <option value="project">Project</option>
                          <option value="report">Report</option>
                          <option value="meeting">Meeting</option>
                        </select>
                        <label htmlFor="category">Category</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <select
                          className="form-select"
                          id="assignedTo"
                          name="assignedTo"
                          value={deadline.assignedTo}
                          onChange={handleChange}
                        >
                          <option value="all">All Employees</option>
                          <option value="department">Department</option>
                          <option value="team">Team</option>
                          <option value="individual">Individual</option>
                        </select>
                        <label htmlFor="assignedTo">Assign To</label>
                      </div>
                    </div>
                  </div>

                  <div className="card notification-card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Notification Settings</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-check mb-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="emailNotif"
                              name="notifications.email"
                              checked={deadline.notifications.email}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="emailNotif">
                              Email Notifications
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="pushNotif"
                              name="notifications.push"
                              checked={deadline.notifications.push}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="pushNotif">
                              Push Notifications
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="number"
                              className="form-control"
                              name="notifications.reminderDays"
                              value={deadline.notifications.reminderDays}
                              onChange={handleChange}
                              min="1"
                              max="30"
                              placeholder=" "
                            />
                            <label>Remind before deadline (days)</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Setting...
                        </>
                      ) : (
                        'Set Deadline'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-card {
          border-radius: 15px;
          border: none;
          transform: translateY(0);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .floating-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .card-header {
          border-radius: 15px 15px 0 0;
          padding: 1.25rem;
        }
        
        .form-control, .form-select {
          border-radius: 8px;
          border: 1px solid #ced4da;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        
        .notification-card {
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }
        
        .notification-card .card-header {
          border-radius: 10px 10px 0 0;
          background: #f8f9fa;
        }
        
        .btn {
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border: none;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #0a58ca 0%, #084298 100%);
          transform: translateY(-1px);
        }
        
        .btn-light {
          background: #f8f9fa;
          border: 1px solid #ced4da;
        }
        
        .btn-light:hover {
          background: #e9ecef;
        }
        
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
      `}</style>
    </Layout>
  );
} 