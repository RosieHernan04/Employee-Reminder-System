import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../../../components/Layout/layout';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../../dataconnect/firebase';

export default function DeleteAdminTask() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const taskDoc = await getDoc(doc(db, 'admin_tasks', id));
      if (taskDoc.exists()) {
        setTask({
          id: taskDoc.id,
          ...taskDoc.data()
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task:', error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'admin_tasks', id));
      alert('Task deleted successfully!');
      router.push('/admin/tasks/admin/edit-delete');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
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

  if (!task) {
    return (
      <Layout>
        <div className="container py-4">
          <div className="alert alert-danger">Task not found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0">Delete Admin Task</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/admin/dashboard">Dashboard</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/admin/tasks/admin/edit-delete">Manage Admin Tasks</a>
                </li>
                <li className="breadcrumb-item active">Delete Task</li>
              </ol>
            </nav>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="text-center mb-4">
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
              <h2 className="mt-3">Delete Confirmation</h2>
              <p className="text-muted">Are you sure you want to delete this task?</p>
            </div>

            <div className="card bg-light mb-4">
              <div className="card-body">
                <h5 className="card-title">{task.title}</h5>
                <p className="card-text">{task.description}</p>
                <div className="d-flex justify-content-between text-muted">
                  <span>
                    <i className="bi bi-clock me-2"></i>
                    {task.deadline ? new Date(task.deadline.toDate()).toLocaleString() : 'No deadline'}
                  </span>
                  <span>
                    <i className="bi bi-flag me-2"></i>
                    Priority: {task.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="alert alert-warning">
              <i className="bi bi-exclamation-circle me-2"></i>
              This action cannot be undone. The task will be permanently deleted.
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 