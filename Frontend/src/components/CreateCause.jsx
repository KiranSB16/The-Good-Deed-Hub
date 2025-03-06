import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCause, uploadFiles } from '../slices/causeSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'react-hot-toast';
import axios from '../config/axios';

const CreateCause = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    startDate: '',
    endDate: '',
    images: [],
    documents: []
  });

  // Selected files preview state
  const [selectedFiles, setSelectedFiles] = useState({
    images: [],
    documents: []
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/categories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Categories API Response:', response.data); // Debug log
        
        // Handle different response structures
        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data)) {
            setCategories(response.data);
          } else if (Array.isArray(response.data.categories)) {
            setCategories(response.data.categories);
          } else if (Array.isArray(response.data.data)) {
            setCategories(response.data.data);
          } else {
            console.error('Unexpected categories data structure:', response.data);
            toast.error('Invalid data format received from server');
            setCategories([]);
          }
        } else {
          console.error('Invalid response data:', response.data);
          toast.error('Invalid response from server');
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(error.response?.data?.message || 'Failed to load categories');
        setCategories([]); // Ensure categories is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Redirect if not a fundraiser
  useEffect(() => {
    if (user && user.role !== 'fundraiser') {
      toast.error('Only fundraisers can create causes');
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e, type) => {
    const files = Array.from(e.target.files);
    
    // Preview files
    const previews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    setSelectedFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...previews]
    }));
    
    // Store files for upload
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }));
  };

  const removeFile = (type, index) => {
    // Revoke object URL to prevent memory leaks
    if (selectedFiles[type][index]?.url) {
      URL.revokeObjectURL(selectedFiles[type][index].url);
    }

    setSelectedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
    
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.title || !formData.description || !formData.goalAmount || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create FormData for file upload
      const form = new FormData();
      
      // Append text fields
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('goalAmount', formData.goalAmount);
      form.append('category', formData.category);
      form.append('startDate', formData.startDate);
      form.append('endDate', formData.endDate);
      
      // Append files
      formData.images.forEach(file => {
        form.append('images', file);
      });
      
      formData.documents.forEach(file => {
        form.append('documents', file);
      });
      
      // Create cause
      const result = await dispatch(createCause(form)).unwrap();
      
      toast.success('Cause created successfully!');
      navigate('/fundraiser/causes');
    } catch (error) {
      console.error('Error creating cause:', error);
      toast.error(error.message || 'Failed to create cause');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create a New Cause</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Title</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter cause title"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your cause"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Goal Amount (₹)</label>
            <Input
              type="number"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleInputChange}
              placeholder="Enter target amount"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              disabled={loading || !categories.length}
            >
              <option value="">
                {loading ? 'Loading categories...' : categories.length === 0 ? 'No categories available' : 'Select a category'}
              </option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {!loading && categories.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Failed to load categories. Please try again later.</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">Start Date</label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">End Date</label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Images</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'images')}
              className="mb-2"
            />
            <div className="grid grid-cols-4 gap-2">
              {selectedFiles.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('images', index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block mb-2">Documents</label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileChange(e, 'documents')}
              className="mb-2"
            />
            <div className="space-y-2">
              {selectedFiles.documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('documents', index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Cause'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateCause;