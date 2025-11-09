import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Lock, Unlock, Loader2, Search, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../../services/api';

export default function LoginManagementTab() {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedLogin, setSelectedLogin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  });

  useEffect(() => {
    fetchLogins();
  }, []);

  const fetchLogins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogins();
      setLogins(response.logins || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch logins');
      console.error('Error fetching logins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ username: '', password: '', role: 'student' });
    setShowModal(true);
  };

  const handleOpenEditModal = (login) => {
    setModalMode('edit');
    setSelectedLogin(login);
    setFormData({ username: login.username, password: '', role: login.role });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLogin(null);
    setFormData({ username: '', password: '', role: 'student' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        if (!formData.username || !formData.password) {
          alert('Username and password are required');
          return;
        }
        await adminAPI.createLogin(formData);
        alert('Login created successfully');
      } else {
        const updateData = { role: formData.role };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminAPI.updateLogin(selectedLogin.id, updateData);
        alert('Login updated successfully');
      }
      handleCloseModal();
      await fetchLogins();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
      console.error('Error:', err);
    }
  };

  const handleToggleStatus = async (login) => {
    try {
      await adminAPI.toggleLoginStatus(login.id);
      await fetchLogins();
    } catch (err) {
      alert('Failed to toggle status');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (login) => {
    if (window.confirm(`Are you sure you want to delete login for ${login.username}?`)) {
      try {
        await adminAPI.deleteLogin(login.id);
        alert('Login deleted successfully');
        await fetchLogins();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete login');
        console.error('Error:', err);
      }
    }
  };

  const filteredLogins = logins.filter(login =>
    login.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Lock className="h-7 w-7 mr-3" />
            Login Management
          </h2>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Login
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none flex-1"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchLogins}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogins.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No logins found
                    </td>
                  </tr>
                ) : (
                  filteredLogins.map(login => (
                    <tr key={login.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{login.username}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {login.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          login.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {login.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(login)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(login)}
                            className={`p-2 rounded-lg transition-colors ${
                              login.isActive
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={login.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {login.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(login)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {modalMode === 'create' ? 'Add New Login' : 'Edit Login'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={modalMode === 'edit'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={modalMode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

