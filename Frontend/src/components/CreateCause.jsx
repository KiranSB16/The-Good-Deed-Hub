import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCause } from '../slices/causeSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import * as Yup from 'yup';

const CreateCause = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
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

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must not exceed 100 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(20, 'Description must be at least 20 characters')
      .required('Description is required'),
    goalAmount: Yup.number()
      .positive('Goal amount must be greater than 0')
      .required('Goal amount is required'),
    category: Yup.string()
      .required('Category is required'),
    startDate: Yup.date()
      .min(new Date(), 'Start date cannot be in the past')
      .required('Start date is required'),
    endDate: Yup.date()
      .min(Yup.ref('startDate'), 'End date must be after the start date')
      .required('End date is required'),
    images: Yup.array()
      .of(
        Yup.mixed()
          .test('fileSize', 'File size is too large', (value) => {
            if (!value) return true;
            return value.size <= 5 * 1024 * 1024; // 5MB
          })
          .test('fileType', 'Unsupported file type', (value) => {
            if (!value) return true;
            return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
          })
      )
      .max(4, 'Maximum 4 images allowed'),
    documents: Yup.array()
      .of(
        Yup.mixed()
          .test('fileSize', 'File size is too large', (value) => {
            if (!value) return true;
            return value.size <= 5 * 1024 * 1024; // 5MB
          })
          .test('fileType', 'Unsupported file type', (value) => {
            if (!value) return true;
            return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(value.type);
          })
      )
      .max(1, 'Maximum 1 document allowed')
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
    const errors = [];
    
    // Validate each file
    files.forEach(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Check file type
      if (type === 'images') {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
          errors.push(`${file.name} is not a valid image file. Only JPEG and PNG are allowed.`);
          return;
        }
      } else if (type === 'documents') {
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
          errors.push(`${file.name} is not a valid document file. Only PDF and Word documents are allowed.`);
          return;
        }
      }

      // Check maximum number of files
      if (type === 'images' && selectedFiles.images.length + files.length > 4) {
        errors.push('Maximum 4 images allowed.');
        return;
      }
      if (type === 'documents' && selectedFiles.documents.length + files.length > 1) {
        errors.push('Maximum 1 document allowed.');
        return;
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    
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
    setFormErrors({});
    
    try {
      setLoading(true);
      
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });
      
      // Create FormData for file upload
      const form = new FormData();
      
      // Append text fields
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('goalAmount', formData.goalAmount);
      form.append('category', formData.category);
      
      // Only append dates if they are provided
      if (formData.startDate) {
        form.append('startDate', formData.startDate);
      }
      if (formData.endDate) {
        form.append('endDate', formData.endDate);
      }
      
      // Append files
      formData.images.forEach(file => {
        form.append('images', file);
      });
      
      formData.documents.forEach(file => {
        form.append('documents', file);
      });
      
      // Create cause
      const result = await dispatch(createCause(form)).unwrap();
      
      // Clear form and navigate on success
      setFormData({
        title: '',
        description: '',
        goalAmount: '',
        category: '',
        startDate: '',
        endDate: '',
        images: [],
        documents: []
      });
      setSelectedFiles({
        images: [],
        documents: []
      });
      
      navigate('/donor/dashboard');
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Handle Yup validation errors
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFormErrors(errors);
        toast.error('Please fix the form errors');
      } else {
        // Handle other errors
        console.error('Error creating cause:', error);
        toast.error(error.message || 'Failed to create cause');
      }
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
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block mb-2">Title</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter cause title"
              className={formErrors.title ? 'border-red-500' : ''}
              required={false}
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your cause"
              className={formErrors.description ? 'border-red-500' : ''}
              required={false}
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
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
              className={formErrors.goalAmount ? 'border-red-500' : ''}
              required={false}
            />
            {formErrors.goalAmount && (
              <p className="text-red-500 text-sm mt-1">{formErrors.goalAmount}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${formErrors.category ? 'border-red-500' : ''}`}
              required={false}
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
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
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
              className={formErrors.startDate ? 'border-red-500' : ''}
              required={false}
            />
            {formErrors.startDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">End Date</label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className={formErrors.endDate ? 'border-red-500' : ''}
              required={false}
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">Images (Max 4, JPEG/PNG only)</label>
            <Input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={(e) => handleFileChange(e, 'images')}
              className="mb-2"
            />
            <p className="text-sm text-gray-500 mb-2">
              Maximum file size: 5MB. Supported formats: JPEG, PNG
            </p>
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
            {formErrors.images && (
              <p className="text-red-500 text-sm mt-1">{formErrors.images}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">Documents (Max 1, PDF/Word only)</label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'documents')}
              className="mb-2"
            />
            <p className="text-sm text-gray-500 mb-2">
              Maximum file size: 5MB. Supported formats: PDF, Word documents
            </p>
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
            {formErrors.documents && (
              <p className="text-red-500 text-sm mt-1">{formErrors.documents}</p>
            )}
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