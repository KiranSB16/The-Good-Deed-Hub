import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCauses } from '../../slices/causeSlice';
import CauseApprovalList from './CauseApprovalList';
import CategoryManagement from './CategoryManagement';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { causes, loading } = useSelector((state) => state.causes);
    const [activeTab, setActiveTab] = useState('causes'); // 'causes' or 'categories'

    useEffect(() => {
        // Redirect if not admin
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        dispatch(fetchCauses());
    }, [dispatch, user, navigate]);

    if (loading && !causes.length) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const pendingCauses = causes.filter(cause => cause.status === 'pending');
    const approvedCauses = causes.filter(cause => cause.status === 'approved');
    const rejectedCauses = causes.filter(cause => cause.status === 'rejected');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Pending Causes</h3>
                    <p className="text-2xl font-bold">{pendingCauses.length}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Approved Causes</h3>
                    <p className="text-2xl font-bold">{approvedCauses.length}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Rejected Causes</h3>
                    <p className="text-2xl font-bold">{rejectedCauses.length}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'causes'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('causes')}
                >
                    Manage Causes
                </button>
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'categories'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('categories')}
                >
                    Manage Categories
                </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'causes' ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Pending Causes for Approval</h2>
                    <CauseApprovalList causes={pendingCauses} />
                </div>
            ) : (
                <CategoryManagement />
            )}
        </div>
    );
};

export default AdminDashboard;
