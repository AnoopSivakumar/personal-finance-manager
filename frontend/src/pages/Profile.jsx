import React, { useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profile_picture: user?.profile_picture || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePictureUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile pictures must be smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profile_picture: reader.result }));
      setError('');
    };
    reader.onerror = () => setError('Could not read that image. Please try again.');
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        profile_picture: form.profile_picture,
      };
      if (form.password) payload.password = form.password;

      const { data } = await api.put('/users/profile', payload);
      updateUser(data);
      setMessage('Profile updated successfully.');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">My Profile</h1>

        <form onSubmit={handleSubmit} className="bg-cream p-6 rounded-xl border border-line space-y-4">
          {message && <p className="text-sm text-primary-700 bg-primary-50 px-3 py-2 rounded-md">{message}</p>}
          {error && <p className="text-sm text-terracotta bg-[#fdf0e7] px-3 py-2 rounded-md">{error}</p>}

          <div className="flex items-center gap-4">
            {form.profile_picture ? (
              <img
                src={form.profile_picture}
                alt="Profile preview"
                className="w-16 h-16 rounded-full object-cover border border-line"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 text-ink flex items-center justify-center text-xl font-bold">
                {(form.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink/70 mb-1">Upload profile picture</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePictureUpload}
                className="w-full text-sm text-ink/70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:font-medium file:text-ink hover:file:bg-primary-100"
              />
              {/* <label className="block text-xs font-medium text-ink/60 mt-3 mb-1">Or use an image URL</label> */}
              {/* <input
                type="url"
                name="profile_picture"
                value={form.profile_picture}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              /> */}
              <p className="text-xs text-ink/50 mt-1">JPEG, PNG, GIF, or WebP up to 2 MB. Leave blank to remove it.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">New Password (optional)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="w-full border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-lime hover:bg-lime-hover text-ink font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <p className="text-xs text-ink/50 mt-4">
          Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
        </p>
      </div>
    </div>
  );
}
