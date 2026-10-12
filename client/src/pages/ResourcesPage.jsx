import { useEffect, useState } from 'react';
import api from '../api/client';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadResources() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/resources');
      const data = response.data;
      setResources(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(
        err.response?.data?.title ||
        err.response?.data?.error ||
        'Could not load resources. Please check your backend.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.post('/resources', {
        title,
        url,
        description,
      });

      setTitle('');
      setUrl('');
      setDescription('');
      setMessage('Resource saved successfully.');
      await loadResources();
    } catch (err) {
      setError(
        err.response?.data?.title ||
        err.response?.data?.error ||
        'Could not save resource. Check the required fields.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.delete(`/resources/${id}`);
      setResources((current) =>
        current.filter((resource) => resource.id !== id)
      );
      setMessage('Resource deleted successfully.');
    } catch (err) {
      setError(
        err.response?.data?.title ||
        err.response?.data?.error ||
        'Could not delete resource.'
      );
    }
  }

  return (
    <section className="content-page">
      <p className="eyebrow">YOUR KNOWLEDGE BASE</p>
      <h1>Resources</h1>
      <p className="muted">
        Keep useful websites, documentation, and developer tools in one place.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <p className="success-message">{message}</p>}

      <div className="resource-layout">
        <form className="resource-form" onSubmit={handleSubmit}>
          <h2>Add a resource</h2>

          <label htmlFor="resourceTitle">Title</label>
          <input
            id="resourceTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React documentation"
            required
          />

          <label htmlFor="resourceUrl">Website URL</label>
          <input
            id="resourceUrl"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />

          <label htmlFor="resourceDescription">Description</label>
          <textarea
            id="resourceDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this resource useful for?"
            rows={3}
          />

          <button className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save resource'}
          </button>
        </form>

        <div className="resource-list">
          <h2>Saved resources</h2>

          {loading ? (
            <p className="muted">Loading resources...</p>
          ) : resources.length === 0 ? (
            <div className="empty-state">
              <h3>No resources yet</h3>
              <p>Add your first developer resource using the form.</p>
            </div>
          ) : (
            resources.map((resource) => (
              <article className="resource-card" key={resource.id}>
                <div>
                  <h3>{resource.title}</h3>
                  {resource.description && <p>{resource.description}</p>}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit resource ↗
                  </a>
                </div>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(resource.id)}
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
