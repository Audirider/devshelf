import { useEffect, useState } from 'react';
import api from '../api/client';

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState([]);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadSnippets() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/snippets');
      const data = response.data;
      setSnippets(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(
        err.response?.data?.title ||
        err.response?.data?.error ||
        'Could not load snippets.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSnippets();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.post('/snippets', { title, language, code });
      setTitle('');
      setLanguage('JavaScript');
      setCode('');
      setMessage('Snippet saved successfully.');
      await loadSnippets();
    } catch (err) {
      setError(
        err.response?.data?.title ||
        err.response?.data?.error ||
        'Could not save snippet. Check the required fields.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(current =>
        current.filter(snippet => snippet.id !== id)
      );
      setMessage('Snippet deleted successfully.');
    } catch (err) {
      setError(
        err.response?.data?.title ||
        err.response?.data?.error ||
        'Could not delete snippet.'
      );
    }
  }

  return (
    <section className="content-page">
      <p className="eyebrow">YOUR CODE LIBRARY</p>
      <h1>Code Snippets</h1>
      <p className="muted">
        Save reusable code examples and keep them organized.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <p className="success-message">{message}</p>}

      <div className="resource-layout">
        <form className="resource-form" onSubmit={handleSubmit}>
          <h2>Add a snippet</h2>

          <label htmlFor="snippetTitle">Title</label>
          <input
            id="snippetTitle"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Fetch API example"
            required
          />

          <label htmlFor="snippetLanguage">Programming language</label>
          <select
            id="snippetLanguage"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            required
          >
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C#</option>
            <option>C++</option>
            <option>HTML</option>
            <option>CSS</option>
            <option>SQL</option>
            <option>Other</option>
          </select>

          <label htmlFor="snippetCode">Code</label>
          <textarea
            id="snippetCode"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={9}
            required
          />

          <button className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save snippet'}
          </button>
        </form>

        <div className="resource-list">
          <h2>Saved snippets</h2>

          {loading ? (
            <p className="muted">Loading snippets...</p>
          ) : snippets.length === 0 ? (
            <div className="empty-state">
              <h3>No snippets yet</h3>
              <p>Add your first code snippet using the form.</p>
            </div>
          ) : (
            snippets.map(snippet => (
              <article className="resource-card" key={snippet.id}>
                <div>
                  <h3>{snippet.title}</h3>
                  <p>Language: {snippet.language}</p>
                  <pre className="snippet-code">
                    <code>{snippet.code}</code>
                  </pre>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(snippet.id)}
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
