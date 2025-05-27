'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from 'lib/firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import Layout from './Layout/layout';              // adjust path

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => {
      if (!u) {
        // redirect to login if needed
        return setLoading(false);
      }
      setUser(u);
      setupListeners(u.uid);
    });
    return () => unsubAuth();
  }, []);

  function setupListeners(uid) {
    // helper to map docs to activity items
    const listen = (coll, q, mapper) => onSnapshot(q, snap => {
      setActivities(prev => {
        const newItems = snap.docs.map(d => mapper(d.id, d.data()));
        return [...prev.filter(a => a.source !== coll), ...newItems.map(a=>({...a, source: coll}))];
      });
    });

    // 1) tasks they created
    const qTasks = query(
      collection(db, 'tasks'),
      where('userId','==',uid),
      orderBy('createdAt','desc'),
      //limit(10)
    );
    listen('tasks', qTasks, (id,d) => ({
      id, 
      desc: `Created task “${d.title}”`, 
      ts: d.createdAt.toDate()
    }));

    // 2) employee_meetings they created
    const qEM = query(
      collection(db,'employee_meetings'),
      where('userId','==',uid),
      orderBy('createdAt','desc'),
    );
    listen('employee_meetings', qEM, (id,d) => ({
      id,
      desc: `Created meeting “${d.title}”`,
      ts: d.createdAt.toDate()
    }));

    // 3) tasks assigned to them by admin
    const qETasks = query(
      collection(db,'employee_tasks'),
      where('userId','==',uid),
      orderBy('assignedAt','desc'),
    );
    listen('employee_tasks', qETasks, (id,d) => ({
      id,
      desc: `Assigned task “${d.title}”`,
      ts: d.assignedAt.toDate()
    }));

    // 4) meetings assigned to them by admin
    const qM = query(
      collection(db,'meetings'),
      where('userId','==',uid),
      orderBy('createdAt','desc'),
    );
    listen('meetings', qM, (id,d) => ({
      id,
      desc: `Assigned meeting “${d.title}”`,
      ts: d.createdAt.toDate()
    }));

    // Once listeners are set, we can generate chart data
    setupChart(uid);

    setLoading(false);
  }

  // Completed tasks chart (last 7 days)
  function setupChart(uid) {
    const days = [...Array(7)].map((_,i) => {
      const dt = subDays(new Date(), i);
      return {
        label: format(dt, 'MMM dd'),
        start: startOfDay(dt),
        end: endOfDay(dt),
        count: 0
      };
    });

    // listen for completions in both collections
    const q1 = query(
      collection(db,'tasks'),
      where('userId','==',uid),
      where('status','==','completed')
    );
    const q2 = query(
      collection(db,'employee_tasks'),
      where('userId','==',uid),
      where('status','==','completed')
    );

    const tally = snap => {
      const docs = snap.docs.map(d => d.data().completedAt.toDate());
      days.forEach(day => {
        day.count = docs.filter(dt => dt >= day.start && dt <= day.end).length;
      });
      setChartData([...days.reverse()]); // earliest left
    };

    const unsub1 = onSnapshot(q1, tally);
    const unsub2 = onSnapshot(q2, tally);

    // no cleanup needed for this example, dashboard lives
  }

  if (loading) return (
    <Layout><p>Loading…</p></Layout>
  );

  // sort merged activities by timestamp desc
  const sorted = [...activities]
    .sort((a,b)=>b.ts - a.ts)
    .slice(0, 10);

  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <h2>Recent Activity</h2>
        <ul>
          {sorted.map(a=>(
            <li key={a.source+'-'+a.id}>
              <span style={{ fontWeight: 600 }}>{a.desc}</span>
              <br/>
              <small>{format(a.ts,'MMM dd, yyyy h:mm a')}</small>
            </li>
          ))}
        </ul>

        <h2>Completed Tasks (Last 7 Days)</h2>
        <div style={{ width:'100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Bar dataKey="count" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
