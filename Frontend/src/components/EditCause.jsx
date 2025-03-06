import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'react-hot-toast';
import axios from '../config/axios';

const EditCause = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
          category: cause.category,
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

    fetchCause();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/causes/${id}`, formData);
      toast.success('Cause updated successfully');
      navigate('/fundraiser/causes');
    } catch (error) {
      console.error('Error updating cause:', error);
      toast.error(error.response?.data?.message || 'Failed to update cause');
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
              required
            />
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block mb-2">Goal Amount</label>
            <Input
              type="number"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleInputChange}
              required
            />
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