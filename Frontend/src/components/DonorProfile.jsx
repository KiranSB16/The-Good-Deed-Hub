import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2, Edit2, Save } from 'lucide-react';
import { updateDonorProfile } from '@/slices/donorSlice';

const DonorProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { profile, loading } = useSelector((state) => state.donor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.userId?.name || '',
        email: profile.userId?.email || '',
        mobileNumber: profile.mobileNumber || ''
      });
      setPreviewImage(profile.profileImage?.[0]);
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateDonorProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  if (loading && !profile) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile</h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-32 w-32">
            {previewImage ? (
              <AvatarImage src={previewImage} alt="Profile" />
            ) : (
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </AvatarFallback>
            )}
          </Avatar>
          {(isEditing || !profile) && (
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <Input
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Your mobile number"
            />
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <p className="text-lg">{profile?.userId?.name || user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <p className="text-lg">{profile?.userId?.email || user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <p className="text-lg">{profile?.mobileNumber || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Total Donations</label>
            <p className="text-lg">₹{profile?.totalDonations || 0}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DonorProfile;
