'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      toast.success('User role updated successfully');
      fetchUsers(); // Refresh users list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh users list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    filter === 'ALL' || user.role === filter
  );

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800',
    USER: 'bg-green-100 text-green-800',
    VENDOR: 'bg-blue-100 text-blue-800'
  };

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6A4E3C] mb-4 md:mb-0">User Management</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {['ALL', 'ADMIN', 'USER', 'VENDOR'].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 py-1 rounded transition duration-300 ease-in-out text-sm ${
                filter === role
                  ? 'bg-[#6A4E3C] text-white'
                  : 'bg-[#F0F2F4] text-[#4E3B2D]'
              } hover:bg-[#D9DADA]`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No users found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-3">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#6A4E3C] flex items-center justify-center text-white">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{user.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}
                >
                  {user.role}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className="text-sm text-[#6A4E3C] hover:underline"
                >
                  View Details
                </button>
                <div className="flex space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    {Object.keys(roleColors).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}