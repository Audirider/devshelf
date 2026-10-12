
import { useEffect, useState } from 'react';
import api from '../api/client';

const initialForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Medium',
  project: '',
  status: 'todo',
};

function getErrorMessage(err, fallback) {
  const data = err.response?.data;

  if (typeof data === 'string') return data;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ');
  }

  return data?.title || data?.message || data?.error || fallback;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadTasks() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/Tasks');
      const data = response.data;

      setTasks(
        Array.isArray(data)
          ? data
          : data.items ?? data.tasks ?? []
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load tasks.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm(current => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      dueDate: form.dueDate
        ? new Date(form.dueDate).toISOString()
        : null,
      priority: form.priority,
      project: form.project.trim() || null,
      status: form.status,
    };

    try {
      await api.post('/Tasks', payload);

      setForm({ ...initialForm });
      setMessage('Task created successfully.');
      await loadTasks();
    } catch (err) {
      setError(
        getErrorMessage(err, 'Could not create task.')
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task, newStatus) {
    setError('');
    setMessage('');

    try {
      await api.patch(
        `/Tasks/${task.id}/status`,
        { status: newStatus }
      );

      setMessage('Task status updated.');
      await loadTasks();
    } catch (err) {
      setError(
        getErrorMessage(err, 'Could not update task status.')
      );
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.delete(`/Tasks/${id}`);

      setTasks(current =>
        current.filter(task => task.id !== id)
      );

      setMessage('Task deleted successfully.');
    } catch (err) {
      setError(
        getErrorMessage(err, 'Could not delete task.')
      );
    }
  }

  function displayStatus(status) {
    const statuses = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      done: 'Completed',
    };

    return statuses[status] || status || 'To Do';
  }

  return (
    <section className="content-page">
      <p className="eyebrow">PLAN YOUR WORK</p>
      <h1>Tasks</h1>
      <p className="muted">
        Organize your development work and track your progress.
      </p>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {message && (
        <p className="success-message">{message}</p>
      )}

      <div className="resource-layout">
        <form className="resource-form" onSubmit={handleSubmit}>
          <h2>Create a task</h2>

          <label htmlFor="taskTitle">Title</label>
          <input
            id="taskTitle"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Build login page"
            required
          />

          <label htmlFor="taskDescription">Description</label>
          <textarea
            id="taskDescription"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what needs to be done"
            rows={3}
          />

          <label htmlFor="taskDueDate">Due date</label>
          <input
            id="taskDueDate"
            name="dueDate"
            type="datetime-local"
            value={form.dueDate}
            onChange={handleChange}
          />

          <label htmlFor="taskPriority">Priority</label>
          <select
            id="taskPriority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label htmlFor="taskProject">Project</label>
          <input
            id="taskProject"
            name="project"
            value={form.project}
            onChange={handleChange}
            placeholder="e.g. DevShelf"
          />

          <label htmlFor="taskStatus">Status</label>
          <select
            id="taskStatus"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Completed</option>
          </select>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create task'}
          </button>
        </form>

        <div className="resource-list">
          <h2>Your tasks ({tasks.length})</h2>

          {loading ? (
            <p className="muted">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Create your first task using the form.</p>
            </div>
          ) : (
            tasks.map(task => (
              <article
                className="resource-card"
                key={task.id}
              >
                <div className="task-details">
                  <h3>{task.title}</h3>

                  {task.description && (
                    <p>{task.description}</p>
                  )}

                  <p>
                    Priority: {task.priority || 'Not specified'}
                  </p>

                  {task.project && (
                    <p>Project: {task.project}</p>
                  )}

                  {task.dueDate && (
                    <p>
                      Due:{' '}
                      {new Date(task.dueDate).toLocaleString()}
                    </p>
                  )}

                  <p>
                    Current status: {displayStatus(task.status)}
                  </p>

                  <label htmlFor={`status-${task.id}`}>
                    Change status
                  </label>

                  <select
                    id={`status-${task.id}`}
                    value={task.status || 'todo'}
                    onChange={e =>
                      handleStatusChange(task, e.target.value)
                    }
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
