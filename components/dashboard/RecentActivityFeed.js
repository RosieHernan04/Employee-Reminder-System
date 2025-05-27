'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';


export default function RecentActivityFeed() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const activityData = [];

      // Set up real-time listeners for each collection
      const collections = ['admin_tasks', 'employee_tasks', 'meetings'];
      const unsubscribers = [];

      for (const colName of collections) {
        const q = query(
          collection(db, colName),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              const activity = {
                id: change.doc.id,
                type: colName,
                title: data.title || data.description || 'No title',
                description: data.description || 'No description',
                createdAt: data.createdAt instanceof Timestamp 
                  ? data.createdAt.toDate() 
                  : new Date(data.createdAt),
                status: data.status || 'pending',
                action: getActionType(colName, data)
              };
              activityData.push(activity);
            }
          });

          // Sort all activities by time
          activityData.sort((a, b) => b.createdAt - a.createdAt);
          setActivities(activityData.slice(0, 10)); // Keep only the 10 most recent activities
        });

        unsubscribers.push(unsubscribe);
      }

      return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
      };
    };

    fetchActivities();
  }, []);

  const getActionType = (collection, data) => {
    switch (collection) {
      case 'admin_tasks':
        return data.status === 'completed' ? 'completed task' : 'created task';
      case 'employee_tasks':
        return data.status === 'completed' ? 'completed task' : 'assigned task';
      case 'meetings':
        return 'scheduled meeting';
      default:
        return 'performed action';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'admin_tasks':
        return 'bi-check-square';
      case 'employee_tasks':
        return 'bi-person-check';
      case 'meetings':
        return 'bi-calendar-event';
      default:
        return 'bi-activity';
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title mb-0">Recent Admin Activities</h5>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="list-group-item">
                <div className="d-flex align-items-center">
                  <i className={`bi ${getIcon(activity.type)} me-3 fs-4`}></i>
                  <div>
                    <p className="mb-1">
                      <strong>{activity.action}:</strong> {activity.title}
                    </p>
                    <small className="text-muted">
                      {activity.createdAt.toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-3">
              No recent activities
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 