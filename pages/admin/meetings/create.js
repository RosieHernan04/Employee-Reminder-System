'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/Layout';
import { db } from '../../../dataconnect/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function CreateMeeting() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meeting, setMeeting] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Virtual',
    location: '',
    duration: '1 hour',
    reminderTime: '09:00'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeeting(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const datetime = new Date(meeting.date + 'T' + meeting.time);
      
      await addDoc(collection(db, 'meetings'), {
        ...meeting,
        datetime,
        reminderTime: meeting.reminderTime,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      alert('Meeting scheduled successfully!');
      router.push('/admin/meetingmanagement');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Error scheduling meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Schedule New Meeting</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/admin/meetingmanagement">Meeting Management</Link>
                </li>
                <li className="breadcrumb-item active">Schedule Meeting</li>
              </ol>
            </nav>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>

        <div className="card">
          <div className="card-body p-0">
            <div className="row g-0">
              <div className="col-lg-4 bg-primary bg-gradient p-4 text-white d-flex flex-column">
                <div className="city-illustration mb-4">
                  {/* City illustration SVG */}
                  <svg viewBox="0 0 400 200" className="w-100">
                    <path d="M50,150 L100,150 L100,100 L150,100 L150,150 L200,150 L200,50 L250,50 L250,150 L300,150 L300,100 L350,100 L350,150" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"/>
                    <circle cx="180" cy="30" r="10" fill="currentColor" opacity="0.5"/>
                  </svg>
                </div>
                <h4 className="mb-3">Schedule New Meeting</h4>
                <p className="text-white-50">Fill in the meeting details to schedule a new meeting for your team.</p>
              </div>
              <div className="col-lg-8 p-4">
                <form onSubmit={handleSubmit} className="meeting-form">
                  <div className="form-group mb-4">
                    <label className="form-label">MEETING TITLE</label>
                    <input
                      type="text"
                      className="form-control border-0 border-bottom rounded-0"
                      name="title"
                      value={meeting.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">DESCRIPTION</label>
                    <textarea
                      className="form-control border-0 border-bottom rounded-0"
                      name="description"
                      value={meeting.description}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">DATE</label>
                        <input
                          type="date"
                          className="form-control border-0 border-bottom rounded-0"
                          name="date"
                          value={meeting.date}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">TIME</label>
                        <input
                          type="time"
                          className="form-control border-0 border-bottom rounded-0"
                          name="time"
                          value={meeting.time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">MEETING TYPE</label>
                        <select
                          className="form-control border-0 border-bottom rounded-0"
                          name="type"
                          value={meeting.type}
                          onChange={handleChange}
                          required
                        >
                          <option value="Virtual">Virtual</option>
                          <option value="In-Person">In-Person</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">DURATION</label>
                        <select
                          className="form-control border-0 border-bottom rounded-0"
                          name="duration"
                          value={meeting.duration}
                          onChange={handleChange}
                          required
                        >
                          <option value="30 minutes">30 minutes</option>
                          <option value="1 hour">1 hour</option>
                          <option value="1.5 hours">1.5 hours</option>
                          <option value="2 hours">2 hours</option>
                          <option value="2.5 hours">2.5 hours</option>
                          <option value="3 hours">3 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">TIME</label>
                        <input
                          type="time"
                          className="form-control border-0 border-bottom rounded-0"
                          name="time"
                          value={meeting.time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">REMINDER TIME</label>
                        <input
                          type="time"
                          className="form-control border-0 border-bottom rounded-0"
                          name="reminderTime"
                          value={meeting.reminderTime}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">LOCATION / MEETING LINK</label>
                    <input
                      type="text"
                      className="form-control border-0 border-bottom rounded-0"
                      name="location"
                      value={meeting.location}
                      onChange={handleChange}
                      placeholder={meeting.type === 'Virtual' ? 'Meeting link or platform' : 'Physical location'}
                      required
                    />
                  </div>

                  <div className="text-center mt-5">
                    <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Scheduling...
                        </>
                      ) : (
                        'SUBMIT'
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
        .card {
          border-radius: 15px;
          overflow: hidden;
          border: none;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .form-control {
          padding: 0.75rem 0;
          font-size: 1rem;
          background-color: transparent;
          transition: all 0.3s;
        }

        .form-control:focus {
          box-shadow: none;
          border-color: #0d6efd;
          background-color: transparent;
        }

        .btn-primary {
          border-radius: 25px;
          padding: 0.75rem 2.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 1px;
          background: #0d6efd;
          border: none;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
        }

        .city-illustration {
          opacity: 0.8;
        }

        .input-group .form-control:first-child {
          border-right: none;
        }

        .input-group .form-control:last-child {
          border-left: none;
        }

        select.form-control {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0 center;
          background-size: 1em;
        }
      `}</style>
    </Layout>
  );
}