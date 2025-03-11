import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import * as Yup from 'yup';

const EditCause = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
      .required('End date is required')
  });

  useEffect(() => {
    const fetchCause = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/causes/${id}`);
        const cause = response.data;
        
        setFormData({
          title: cause.title,
          description: cause.description,
          goalAmount: cause.goalAmount,
          category: cause.category?._id || cause.category,
          startDate: cause.startDate?.split('T')[0] || '',
          endDate: cause.endDate?.split('T')[0] || '',
          images: cause.images || [],
          documents: cause.documents || []
        });
      } catch (error) {
        console.error('Error fetching cause:', error);
        toast.error('Failed to load cause details');
        navigate('/fundraiser/causes');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCause();
    fetchCategories();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      setLoading(true);
      
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });
      
      await axios.put(`/causes/${id}`, formData);
      toast.success('Cause updated successfully');
      navigate('/fundraiser/causes');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setFormErrors(validationErrors);
      } else if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg;
        });
        setFormErrors(serverErrors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update cause');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Cause</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={formErrors.title ? 'border-red-500' : ''}
              required
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
              className={formErrors.description ? 'border-red-500' : ''}
              required
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>
          <div>
            <label className="block mb-2">Goal Amount</label>
            <Input
              type="number"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleInputChange}
              className={formErrors.goalAmount ? 'border-red-500' : ''}
              required
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
              className={`w-full rounded-md border ${formErrors.category ? 'border-red-500' : 'border-input'} px-3 py-2`}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
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
              required
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
              required
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Cause'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/fundraiser/causes')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditCause; 