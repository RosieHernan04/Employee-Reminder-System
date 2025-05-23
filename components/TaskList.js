const TaskList = ({ tasks, loading, error, onStatusChange }) => {
  if (loading) {
    return <div className="text-center p-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-center p-4">No tasks found.</div>;
  }

  const getAssignedEmployeeName = (task) => {
    if (!task.assignedTo) return 'Unassigned';
    return task.assignedTo.name || task.assignedTo.fullName || task.assignedTo.email || 'Unknown';
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-600 mt-1">{task.description}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-sm ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Assigned to:</p>
              <p className="font-medium">{getAssignedEmployeeName(task)}</p>
            </div>
            <div>
              <p className="text-gray-500">Deadline:</p>
              <p className="font-medium">
                {task.deadline ? new Date(task.deadline.seconds * 1000).toLocaleDateString() : 'No deadline'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status:</p>
              <p className="font-medium capitalize">{task.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Created:</p>
              <p className="font-medium">
                {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          {onStatusChange && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onStatusChange(task.id, task.status)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList; 