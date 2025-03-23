import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { updateUser } from '@/slices/userSlice';

const DonorProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Format initial phone number to remove country code and spaces
  const formatInitialPhone = (phone) => {
    if (!phone) return '';
    // Remove all non-digits and take the last 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-10);
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: formatInitialPhone(user?.mobileNumber) || '',
    address: user?.address || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number formatting
    if (name === 'phone') {
      // Remove all non-digit characters and take only the last 10 digits
      const digits = value.replace(/\D/g, '').slice(-10);
      setFormData(prev => ({
        ...prev,
        [name]: digits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formDataObj = new FormData();
      formDataObj.append('profileImage', file);
      formDataObj.append('formData', JSON.stringify({
        name: formData.name,
        mobileNumber: formData.phone, // Already formatted as 10 digits
        address: formData.address,
        bio: formData.bio
      }));

      // Remove the leading slash from the endpoint
      const response = await axios.put('donors/profile', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update both form data and Redux store
      setFormData(prev => ({
        ...prev,
        profileImage: response.data.profileImage,
        name: response.data.name,
        phone: formatInitialPhone(response.data.mobileNumber),
        address: response.data.address,
        bio: response.data.bio
      }));

      // Update the user state in Redux
      dispatch(updateUser(response.data));

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('formData', JSON.stringify({
        name: formData.name,
        mobileNumber: formData.phone, // Already formatted as 10 digits
        address: formData.address,
        bio: formData.bio
      }));

      // Remove the leading slash from the endpoint
      const response = await axios.put('donors/profile', formDataObj);
      
      // Update both form data and Redux store
      setFormData(prev => ({
        ...prev,
        name: response.data.name,
        phone: formatInitialPhone(response.data.mobileNumber),
        address: response.data.address,
        bio: response.data.bio,
        profileImage: response.data.profileImage
      }));

      // Update the user state in Redux
      dispatch(updateUser(response.data));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.profileImage} />
                <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.name}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (10 digits)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                maxLength={10}
                placeholder="Enter 10 digit number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default DonorProfile;