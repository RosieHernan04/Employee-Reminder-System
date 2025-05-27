'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function CompletedTaskChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      // Set up real-time listeners for both collections
      const employeeTasksQuery = query(
        collection(db, 'employee_tasks'),
        where('completedAt', '>=', Timestamp.fromDate(last30Days))
      );

      const adminTasksQuery = query(
        collection(db, 'admin_tasks'),
        where('completedAt', '>=', Timestamp.fromDate(last30Days))
      );

      const unsubscribers = [];

      // Listen for employee tasks
      const unsubscribeEmployee = onSnapshot(employeeTasksQuery, (snapshot) => {
        updateChartData(snapshot, 'employee_tasks');
      });
      unsubscribers.push(unsubscribeEmployee);

      // Listen for admin tasks
      const unsubscribeAdmin = onSnapshot(adminTasksQuery, (snapshot) => {
        updateChartData(snapshot, 'admin_tasks');
      });
      unsubscribers.push(unsubscribeAdmin);

      return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe());
      };
    };

    const updateChartData = (snapshot, collectionType) => {
      const completedTasksByDate = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.completedAt) {
          const completedDate = data.completedAt instanceof Timestamp 
            ? data.completedAt.toDate() 
            : new Date(data.completedAt);
          const date = completedDate.toLocaleDateString();
          completedTasksByDate[date] = (completedTasksByDate[date] || 0) + 1;
        }
      });

      const data = Object.entries(completedTasksByDate).map(([date, count]) => ({
        date,
        completed: count
      }));

      setChartData(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    fetchCompletedTasks();
  }, []);

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title mb-0">Task Completion Over Time</h5>
      </div>
      <div className="card-body">
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="completed" 
                name="Tasks Completed" 
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 