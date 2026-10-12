import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-logo">DS</span>
        <span>DevShelf</span>
      </Link>

      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/snippets">Snippets</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <span className="nav-user">
              {user?.userName || user?.username || user?.email || 'Developer'}
            </span>
            <button className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <Link to="/register" className="nav-register">Get started</Link>
          </>
        )}
      </nav>
    </header>
  );
}
