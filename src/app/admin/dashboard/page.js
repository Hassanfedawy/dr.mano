'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [Users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ]);

      const [statsData, usersData] = await Promise.all([
        statsRes.json(),
        usersRes.json()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (!stats) return <div className="text-center text-gray-500">Error loading dashboard</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-neutral text-sm">Total Revenue</h3>
          <p className="text-2xl font-semibold text-secondary">${stats.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-neutral text-sm">Total Orders</h3>
          <p className="text-2xl font-semibold text-secondary">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-neutral text-sm">Total Products</h3>
          <p className="text-2xl font-semibold text-secondary">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-neutral text-sm">Total Users</h3>
          <p className="text-2xl font-semibold text-secondary">{stats.totalUsers}</p>
        </div>
      </div>

      {/* Users */}
      <div>
        <h1 className="text-2xl font-bold mb-4 text-primary">User Management</h1>
        <table className="min-w-full bg-white border border-neutral rounded-lg shadow-lg">
          <thead>
            <tr className="bg-secondary text-white">
              <th className="py-3 px-6 border-b">ID</th>
              <th className="py-3 px-6 border-b">Name</th>
              <th className="py-3 px-6 border-b">Email</th>
              <th className="py-3 px-6 border-b">Role</th>
              <th className="py-3 px-6 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {Users.map(user => (
              <tr key={user.id} className="hover:bg-neutral-100">
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button
          onClick={() => router.push('/admin/products')}
          className="p-6 bg-primary  text-primary rounded-lg shadow-lg hover:bg-secondary transition-colors duration-300"
        >
          <h3 className="font-semibold">Manage Products</h3>
          <p className="text-sm">Add, edit, or remove products</p>
        </button>
        <button
          onClick={() => router.push('/admin/orders')}
          className="p-6 bg-primary  text-primary rounded-lg shadow-lg hover:bg-secondary transition-colors duration-300"
        >
          <h3 className="font-semibold">Manage Orders</h3>
          <p className="text-sm">View and update order status</p>
        </button>
        <button
          onClick={() => router.push('/admin/users')}
          className="p-6 bg-primary  text-primary rounded-lg shadow-lg hover:bg-secondary transition-colors duration-300"
        >
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm">View and manage user accounts</p>
        </button>
      </div>
    </div>
  );
}
