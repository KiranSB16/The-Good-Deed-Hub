import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import axios from '../../config/axios';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/admin/categories', { name: newCategory });
      setNewCategory('');
      setCategories(prev => [...prev, response.data.category]);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`/admin/categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Category Management</h1>
      </div>

      {/* Create Category Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Category</h2>
        <form onSubmit={handleCreateCategory} className="flex gap-4">
          <Input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !newCategory.trim()}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-gray-900 dark:text-white">{category.name}</span>
              <Button
                onClick={() => handleDeleteCategory(category._id)}
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center">No categories found</p>
          )}
        </div>
      </div>
    </div>
  );
} 