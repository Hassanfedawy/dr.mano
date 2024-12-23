'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileContent() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
  });

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        image: data.image || '',
      });
    } catch (error) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'wjlbtoqe'); // Replace with your Cloudinary upload preset

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dfnhgsxua/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.secure_url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.message);
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);

      // Update the session with new user data
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: updatedProfile.name,
          email: updatedProfile.email,
          image: updatedProfile.image,
        },
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="No Profile Found"
        description="It seems you don't have a profile yet. Please create one."
        actionLink="/profile/create"
        actionText="Create Profile"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit}>
        <div className="shadow sm:rounded-md sm:overflow-hidden">
          <div className="px-4 py-5 bg-[#F0F2F4] space-y-6 sm:p-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#4E3B2D]">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 focus:ring-[#6A4E3C] focus:border-[#6A4E3C] block w-full shadow-sm sm:text-sm border-[#D9DADA] rounded-md"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4E3B2D]">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-[#D9DADA] rounded-md"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-[#4E3B2D]">
                Profile Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="mt-1 block w-full shadow-sm sm:text-sm border-[#D9DADA] rounded-md"
              />
            </div>

            {uploading && <p>Uploading image...</p>}

            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-[#4E3B2D]">Current Image</label>
                <div className="mt-1">
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="h-32 w-32 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-3 bg-[#F0F2F4] text-right sm:px-6">
            <button
              type="submit"
              disabled={updating || uploading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#6A4E3C] hover:bg-[#6A4E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A4E3C] disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
