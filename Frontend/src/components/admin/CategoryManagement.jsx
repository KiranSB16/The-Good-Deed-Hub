import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, fetchCategories, deleteCategory, clearAdminMessages } from '../../slices/adminSlice';

const CategoryManagement = () => {
    const dispatch = useDispatch();
    const [newCategory, setNewCategory] = useState('');
    const { categories, categoryLoading, categoryError, successMessage } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        await dispatch(createCategory(newCategory.trim()));
        if (!categoryError) {
            setNewCategory('');
            setTimeout(() => dispatch(clearAdminMessages()), 3000);
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            await dispatch(deleteCategory(categoryId));
            if (!categoryError) {
                setTimeout(() => dispatch(clearAdminMessages()), 3000);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Category Management</h2>

            {/* Status Messages */}
            {categoryError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {categoryError.message || 'An error occurred'}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {/* Add Category Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name"
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={categoryLoading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {categoryLoading ? 'Adding...' : 'Add Category'}
                    </button>
                </div>
            </form>

            {/* Categories List */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Existing Categories</h3>
                {categoryLoading && !categories.length ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                            >
                                <span className="font-medium">{category.name}</span>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    disabled={categoryLoading}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {!categoryLoading && !categories.length && (
                    <p className="text-gray-500 text-center py-4">No categories found</p>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;
