"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';


export default function Profile() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phoneNumber: '',
      shippingAddress: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    useEffect(() => {
      if (status === 'authenticated') {
        fetchProfile();
      }
    }, [status]);

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          shippingAddress: data.shippingAddress || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      try {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const updatedProfile = await response.json();
          setProfile(updatedProfile);
          setIsEditing(false);
          await update(); // Update NextAuth session
          toast.success('Profile updated successfully');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Error updating profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Error updating profile');
      }
    };

    if (status === 'loading' || loading) {
      return <LoadingSpinner />;
    }

    if (status === 'unauthenticated') {
      return (
        <EmptyState
          title="Please Sign In"
          description="You need to be signed in to view your profile"
          actionLink="/auth/signin"
          actionText="Sign In"
        />
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="bg-white shadow rounded-lg p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                <textarea
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {profile.image && (
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <p className="text-gray-600">{profile.phoneNumber}</p>
                  {profile.email && <p className="text-gray-600">{profile.email}</p>}
                  {profile.shippingAddress && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Shipping Address:</p>
                      <p className="text-gray-600">{profile.shippingAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>

              {profile.orders?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {profile.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Order #{order.id}</span>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-2 text-gray-600">
                          <p>Total: ${order.total}</p>
                          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }