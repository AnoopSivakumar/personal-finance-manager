import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      location.pathname === path
        ? 'bg-primary-500 text-white'
        : 'text-ink/70 hover:bg-primary-50 hover:text-ink'
    }`;

  return (
    <nav className="bg-cream border-b border-line sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to={user ? '/dashboard' : '/'} className="font-bold text-lg text-ink">₹ Finance Manager</Link>
          {user && (
            <div className="hidden sm:flex gap-2">
              <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
              <Link to="/transactions" className={linkClass('/transactions')}>Transactions</Link>
              <Link to="/events" className={linkClass('/events')}>Events</Link>
              <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
            </div>
          )}
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-line" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 text-ink flex items-center justify-center text-sm font-bold">
                {(user.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:inline text-sm text-ink/60">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-terracotta hover:bg-[#fdf0e7] rounded-md transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-3 py-2 text-sm font-medium text-terracotta hover:bg-[#fdf0e7] rounded-md transition">
            Sign In
          </Link>
        )}
      </div>
      {user && (
        <div className="flex sm:hidden justify-around border-t border-line py-1">
          <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link to="/transactions" className={linkClass('/transactions')}>Transactions</Link>
          <Link to="/events" className={linkClass('/events')}>Events</Link>
          <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
        </div>
      )}
    </nav>
  );
}
