'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout/layout';
import { Switch, Card, Form, Button, TimePicker, Select, message } from 'antd';
import { BellOutlined, ClockCircleOutlined, SettingOutlined, MailOutlined, PushpinOutlined } from '@ant-design/icons';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    // General Settings
    defaultChannel: 'both',
    persistentNotifications: false,
    autoDisableCompleted: true,
    
    // Meeting Reminders
    meetingReminders: {
      enabled: true,
      timing: [
        { value: '1 day', enabled: true },
        { value: '1 hour', enabled: true },
        { value: '15 minutes', enabled: true }
      ]
    },
    
    // Deadline Reminders
    deadlineReminders: {
      enabled: true,
      timing: [
        { value: '1 week', enabled: true },
        { value: '3 days', enabled: true },
        { value: '1 day', enabled: true }
      ]
    },
    
    // Task Reminders
    taskReminders: {
      enabled: true,
      timing: [
        { value: '2 days', enabled: true },
        { value: '1 day', enabled: true },
        { value: '4 hours', enabled: true }
      ]
    },
    
    // Notification Channels
    channels: {
      email: {
        enabled: true,
        frequency: 'immediate',
        dailyDigest: false,
        weeklyReport: false
      },
      push: {
        enabled: true,
        sound: true,
        vibration: true,
        priority: 'normal'
      }
    },
    
    // Do Not Disturb
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '06:00'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'notificationSettings', 'admin'),
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading settings:', error);
        message.error('Failed to load notification settings');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'notificationSettings', 'admin'), settings);
      message.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReminderToggle = (category, index) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        timing: prev[category].timing.map((item, i) => 
          i === index ? { ...item, enabled: !item.enabled } : item
        )
      }
    }));
  };

  const handleCategoryToggle = (category) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !prev[category].enabled
      }
    }));
  };

  const handleChannelToggle = (channel, setting) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          [setting]: !prev.channels[channel][setting]
        }
      }
    }));
  };

  const handleTimeChange = (time, type) => {
    setSettings(prev => ({
      ...prev,
      doNotDisturb: {
        ...prev.doNotDisturb,
        [type]: time
      }
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="mb-4">
              <Button type="default" onClick={() => router.push('/admin/meetingmanagement')}>
                Back to Meeting Management
              </Button>
            </div>
            <h1 className="mb-4 text-primary">
              <SettingOutlined className="me-2" />
              Notification Settings
            </h1>

            <div className="row g-4">
              {/* General Settings */}
              <div className="col-md-6">
                <Card 
                  title={
                    <>
                      <SettingOutlined className="me-2" />
                      General Settings
                    </>
                  } 
                  bordered={false} 
                  className="shadow-sm"
                >
                  <div className="mb-3">
                    <label className="form-label">Default Notification Channel</label>
                    <select
                      className="form-select"
                      value={settings.defaultChannel}
                      onChange={(e) => setSettings({...settings, defaultChannel: e.target.value})}
                    >
                      <option value="email">Email Only</option>
                      <option value="push">Push Only</option>
                      <option value="both">Both Email and Push</option>
                    </select>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={settings.persistentNotifications}
                      onChange={(e) => setSettings({...settings, persistentNotifications: e.target.checked})}
                    />
                    <label className="form-check-label">Enable Persistent Notifications</label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={settings.autoDisableCompleted}
                      onChange={(e) => setSettings({...settings, autoDisableCompleted: e.target.checked})}
                    />
                    <label className="form-check-label">Auto-disable Reminders for Completed Items</label>
                  </div>
                </Card>
              </div>

              {/* Meeting Reminders */}
              <div className="col-md-6">
                <Card 
                  title={
                    <>
                      <BellOutlined className="me-2" />
                      Meeting Reminders
                    </>
                  } 
                  bordered={false} 
                  className="shadow-sm"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Enable Meeting Reminders</h6>
                    <Switch
                      checked={settings.meetingReminders.enabled}
                      onChange={() => handleCategoryToggle('meetingReminders')}
                    />
                  </div>
                  {settings.meetingReminders.enabled && (
                    <div className="ms-4">
                      {settings.meetingReminders.timing.map((timing, index) => (
                        <div key={index} className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={timing.enabled}
                            onChange={() => handleReminderToggle('meetingReminders', index)}
                          />
                          <label className="form-check-label">
                            {timing.value} before meeting
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Deadline Reminders */}
              <div className="col-md-6">
                <Card 
                  title={
                    <>
                      <ClockCircleOutlined className="me-2" />
                      Deadline Reminders
                    </>
                  } 
                  bordered={false} 
                  className="shadow-sm"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Enable Deadline Reminders</h6>
                    <Switch
                      checked={settings.deadlineReminders.enabled}
                      onChange={() => handleCategoryToggle('deadlineReminders')}
                    />
                  </div>
                  {settings.deadlineReminders.enabled && (
                    <div className="ms-4">
                      {settings.deadlineReminders.timing.map((timing, index) => (
                        <div key={index} className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={timing.enabled}
                            onChange={() => handleReminderToggle('deadlineReminders', index)}
                          />
                          <label className="form-check-label">
                            {timing.value} before deadline
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Task Reminders */}
              <div className="col-md-6">
                <Card 
                  title={
                    <>
                      <PushpinOutlined className="me-2" />
                      Task Reminders
                    </>
                  } 
                  bordered={false} 
                  className="shadow-sm"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Enable Task Reminders</h6>
                    <Switch
                      checked={settings.taskReminders.enabled}
                      onChange={() => handleCategoryToggle('taskReminders')}
                    />
                  </div>
                  {settings.taskReminders.enabled && (
                    <div className="ms-4">
                      {settings.taskReminders.timing.map((timing, index) => (
                        <div key={index} className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={timing.enabled}
                            onChange={() => handleReminderToggle('taskReminders', index)}
                          />
                          <label className="form-check-label">
                            {timing.value} before task
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Notification Channels */}
              <div className="col-md-6">
                <Card 
                  title={
                    <>
                      <MailOutlined className="me-2" />
                      Notification Channels
                    </>
                  } 
                  bordered={false} 
                  className="shadow-sm"
                >
                  <div className="mb-4">
                    <h6>Email Notifications</h6>
                    <div className="ms-4">
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={settings.channels.email.enabled}
                          onChange={() => handleChannelToggle('email', 'enabled')}
                        />
                        <label className="form-check-label">Enable Email Notifications</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={settings.channels.email.dailyDigest}
                          onChange={() => handleChannelToggle('email', 'dailyDigest')}
                        />
                        <label className="form-check-label">Daily Digest</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={settings.channels.email.weeklyReport}
                          onChange={() => handleChannelToggle('email', 'weeklyReport')}
                        />
                        <label className="form-check-label">Weekly Report</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h6>Push Notifications</h6>
                    <div className="ms-4">
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={settings.channels.push.enabled}
                          onChange={() => handleChannelToggle('push', 'enabled')}
                        />
                        <label className="form-check-label">Enable Push Notifications</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={settings.channels.push.sound}
                          onChange={() => handleChannelToggle('push', 'sound')}
                        />
                        <label className="form-check-label">Enable Sound</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={settings.channels.push.vibration}
                          onChange={() => handleChannelToggle('push', 'vibration')}
                        />
                        <label className="form-check-label">Enable Vibration</label>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Do Not Disturb */}
              <div className="col-md-6">
                <Card 
                  title={
                    <>
                      <ClockCircleOutlined className="me-2" />
                      Do Not Disturb
                    </>
                  } 
                  bordered={false} 
                  className="shadow-sm"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Enable Do Not Disturb</h6>
                    <Switch
                      checked={settings.doNotDisturb.enabled}
                      onChange={(checked) => setSettings({
                        ...settings,
                        doNotDisturb: {
                          ...settings.doNotDisturb,
                          enabled: checked
                        }
                      })}
                    />
                  </div>
                  {settings.doNotDisturb.enabled && (
                    <div className="ms-4">
                      <div className="mb-3">
                        <label className="form-label">Start Time</label>
                        <TimePicker
                          format="HH:mm"
                          value={settings.doNotDisturb.startTime}
                          onChange={(time) => handleTimeChange(time, 'startTime')}
                          className="w-100"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">End Time</label>
                        <TimePicker
                          format="HH:mm"
                          value={settings.doNotDisturb.endTime}
                          onChange={(time) => handleTimeChange(time, 'endTime')}
                          className="w-100"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            <div className="mt-4 text-end">
              <Button
                type="primary"
                onClick={saveSettings}
                loading={saving}
                disabled={loading}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 15px;
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .form-check-input:checked {
          background-color: #2d8659;
          border-color: #2d8659;
        }
        .form-select:focus, .form-control:focus {
          border-color: #2d8659;
          box-shadow: 0 0 0 0.25rem rgba(45, 134, 89, 0.25);
        }
        .ant-switch-checked {
          background-color: #2d8659 !important;
        }
        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          padding: 1rem;
        }
        .card-title {
          margin-bottom: 0;
          color: #2d8659;
        }
      `}</style>
    </Layout>
  );
} 