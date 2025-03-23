import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2, Phone, Mail, Calendar, Target } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

const FundraiserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [stats, setStats] = useState({
    totalCauses: 0,
    totalRaised: 0,
    approvedCauses: 0,
    pendingCauses: 0
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profile?.mobileNumber) {
      // Ensure mobile number is stored as string
      setFormData(prev => ({
        ...prev,
        mobileNumber: profile.mobileNumber.toString()
      }));
    }
  }, [profile]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Fetch profile data
      const profileResponse = await axios.get('/fundraisers/profile')
        .catch(error => {
          // If profile doesn't exist (404), return null but don't throw an error
          if (error.response?.status === 404) {
            return { data: null };
          }
          throw error; // Re-throw other errors
        });
      
      console.log('Profile response:', profileResponse.data);
      
      if (profileResponse.data) {
        setProfile(profileResponse.data);
        setFormData({
          mobileNumber: profileResponse.data.mobileNumber || '',
          profileImage: null
        });
        setPreviewImage(profileResponse.data.profileImage?.[0]);
      } else {
        // Handle case where profile doesn't exist yet
        setProfile(null);
        setFormData({
          mobileNumber: '',
          profileImage: null
        });
        setPreviewImage(null);
      }
      
      // Only fetch causes if we have a profile
      if (profileResponse.data) {
        try {
          // Fetch fundraiser's causes and stats
          const causesResponse = await axios.get('/fundraisers/causes');
          console.log('Causes response:', causesResponse.data);
          
          // Set statistics from the backend
          setStats(causesResponse.data.stats);
        } catch (causesError) {
          console.error('Error fetching causes:', causesError);
          // Don't show toast for this error, just log it
        }
      }
      
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        user: user,
        config: error.config
      });
      
      toast.error('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and limit to 10 digits
    if (name === 'mobileNumber') {
      // Remove any non-numeric characters and limit to 10 digits
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
      console.log('Sanitized mobile number:', sanitizedValue);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mobile number
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      
      const endpoint = '/fundraisers/profile';
      const method = profile ? 'put' : 'post';
      
      // Always use FormData for consistency
      const formDataToSend = new FormData();
      formDataToSend.append('mobileNumber', formData.mobileNumber.toString().trim());
      
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      // Log the actual form data entries
      console.log('Form data entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const response = await axios[method](endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Server response:', response.data);

      setProfile(response.data.fundraiser);
      setIsEditing(false);
      toast.success(response.data.message);
      
      // Refresh the profile data after update
      fetchProfileData();
    } catch (error) {
      console.error('Submit error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        validationErrors: error.response?.data?.errors,
        requestData: {
          mobileNumber: formData.mobileNumber,
          hasProfileImage: !!formData.profileImage,
          profileImageName: formData.profileImage?.name
        }
      });

      // Display validation errors if present
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map(err => err.msg)
          .join('. ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || 'Error saving profile');
      }
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Fundraiser Profile</h2>
            {profile && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
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
                    {user?.name?.charAt(0)?.toUpperCase() || 'F'}
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

          {(isEditing || !profile) ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={user?.name || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <Input
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="mb-1"
                  type="tel"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500">Enter a 10-digit mobile number without spaces or special characters</p>
              </div>

              <div className="flex justify-end gap-4">
                {profile && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      if (profile?.mobileNumber) {
                        setFormData(prev => ({
                          ...prev,
                          mobileNumber: profile.mobileNumber.toString()
                        }));
                      }
                      setPreviewImage(profile.profileImage?.[0]);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {profile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-6 flex-wrap">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </h3>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </h3>
                  <p>{profile?.mobileNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined
                  </h3>
                  <p>{new Date(profile?.createdAt || user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Stats Card */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Fundraising Stats</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center mb-1">
                <Target className="h-4 w-4 mr-2" />
                Total Causes
              </h3>
              <p className="text-2xl font-semibold">{stats.totalCauses || 0}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Approved Causes</h3>
              <p className="text-2xl font-semibold">{stats.approvedCauses || 0}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Approval</h3>
              <p className="text-2xl font-semibold">{stats.pendingCauses || 0}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount Raised</h3>
              <p className="text-2xl font-semibold text-green-600">₹{(stats.totalRaised || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FundraiserProfile; 