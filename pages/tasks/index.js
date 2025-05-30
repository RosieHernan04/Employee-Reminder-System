import { useEffect, useState } from 'react';
import Layout from 'components/MainLayout/Layout';

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get next status based on current
const getNextStatus = (status) => {
  const statuses = ['pending', 'in progress', 'completed'];
  const currentIndex = statuses.indexOf(status.toLowerCase());
  return statuses[currentIndex + 1] || status;
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulated data fetch
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Replace this with an actual API call
        const simulatedData = [
          {
            id: 1,
            title: 'Update website banner',
            priority: 'High',
            status: 'Pending',
            description: 'Change banner for summer promo',
            deadline: '2025-06-01',
            assignedTo: { fullName: 'Rose Ann Hernan' },
            assignedBy: { name: 'Project Manager' },
          },
          {
            id: 2,
            title: 'Fix login bug',
            priority: 'Medium',
            status: 'In Progress',
            description: 'Investigate and resolve login redirect issue',
            deadline: '2025-06-03',
            assignedTo: { fullName: 'Rose Ann Hernan' },
            assignedBy: { name: 'Team Lead' },
          },
        ];

        // Simulate delay
        setTimeout(() => {
          setTasks(simulatedData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load tasks');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
        {loading ? (
          <div className="text-center">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {task.title}
                  </h2>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{task.description}</p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="far fa-calendar mr-2"></i>
                    <span>Deadline: {formatDate(task.deadline)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="far fa-user mr-2"></i>
                    <span>Assigned to: {task.assignedTo?.fullName || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="far fa-user-circle mr-2"></i>
                    <span>Assigned by: {task.assignedBy?.name || 'Admin'}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() =>
                      handleStatusChange(task.id, getNextStatus(task.status))
                    }
                    className={`px-4 py-2 text-white rounded transition-colors ${
                      task.status.toLowerCase() === 'completed'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    disabled={task.status.toLowerCase() === 'completed'}
                  >
                    {getNextStatus(task.status)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TaskList;
