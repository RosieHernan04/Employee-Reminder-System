import { db } from '../../../dataconnect/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { assignedTo } = req.query;

    if (!assignedTo) {
      return res.status(400).json({ message: 'Missing assignedTo parameter' });
    }

    // Query tasks directly from the `employee_tasks` collection
    const tasksRef = collection(db, 'employee_tasks');
    const tasksQuery = query(tasksRef, where('assignedTo.uid', '==', assignedTo));
    const querySnapshot = await getDocs(tasksQuery);

    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched tasks from API:", tasks); // Debugging log
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
}
