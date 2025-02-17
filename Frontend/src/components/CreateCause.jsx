import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCause } from '../features/causeSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'react-toastify';
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
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Redirect if not a fundraiser
  useEffect(() => {
    if (!user || user.role !== 'fundraiser') {
      navigate('/');
      toast.error('Only fundraisers can create causes');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const fileArray = Array.from(files);
  
    if (name === 'images') {
      if (fileArray.length + formData.images.length > 4) { 
        toast.error('Maximum 4 images allowed');
        e.target.value = '';
        return;
      }
  
      const validImages = fileArray.filter(file => {
        const isValidType = file.type.match(/^image\/(jpeg|png|jpg)$/);
        const isValidSize = file.size <= 5 * 1024 * 1024;
  
        if (!isValidType) {
          toast.error(`${file.name} is not a valid image file (JPG/PNG only)`);
        }
        if (!isValidSize) {
          toast.error(`${file.name} exceeds 5MB size limit`);
        }
  
        return isValidType && isValidSize;
      });
  
      if (validImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...validImages]  // Append new images instead of replacing
        }));
  
        // Create preview URLs for valid images
        const imageUrls = validImages.map(file => URL.createObjectURL(file));
        
        setSelectedFiles(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls] // Append new preview images
        }));
      }
    } else if (name === 'documents') {
      const file = fileArray[0];
      if (!file) return;
  
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        e.target.value = '';
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error('PDF file size should not exceed 5MB');
        e.target.value = '';
        return;
      }
  
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, file] // Append the new document
      }));
  
      setSelectedFiles(prev => ({
        ...prev,
        documents: [...prev.documents, file.name] // Append the document name
      }));
    }
  };
  

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.images.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles.images]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.goalAmount || formData.goalAmount < 1000) {
      toast.error('Goal amount must be at least ₹1000');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    if (formData.images.length === 0) {
      toast.error('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {title, description, goalAmount, category, startDate, endDate, images, documents} = formData
    console.log("inside the submit", {title})
  
    if (!title || !description || !goalAmount || !category) {
      console.log("require the ")
      alert("Please fill all required fields.");
      return;
    }
  
    const causeData = {
      title,
      description,
      goalAmount,
      category,
      startDate,
      endDate,
      images,
      documents
    };

    console.log("before dispatch")
  
   dispatch(createCause(causeData))
      .unwrap()
      .then((data) => {
        alert("Cause created successfully!");
        console.log("Success:", data);
      })
      .catch((error) => {
        alert("Error: " + error.message);
        console.error("Error creating cause:", error);
      });
  };
  
  
  

  const removeFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));

    setSelectedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));

    if (type === 'images') {
      URL.revokeObjectURL(selectedFiles.images[index]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Cause</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
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
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your cause"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Goal Amount (₹)</label>
            <Input
              type="number"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleInputChange}
              placeholder="Minimum ₹1,000"
              required
              min="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Images (Max 4)</label>

            <Input
              type="file"
              name="images"
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              disabled = {selectedFiles.images.length > 3}
              multiple
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload up to 4 images (JPEG/PNG, max 5MB each)
            </p>
            
            {/* Image previews */}
            {selectedFiles.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {selectedFiles.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile('images', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Supporting Document (Optional)</label>
            <Input
              type="file"
              name="documents"
              onChange={handleFileChange}
              accept=".pdf"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload a PDF document (max 5MB)
            </p>
            
            {/* Document list */}
            {selectedFiles.documents.length > 0 && (
              <div className="mt-4">
                {selectedFiles.documents.map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm">{name}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFile('documents', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
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