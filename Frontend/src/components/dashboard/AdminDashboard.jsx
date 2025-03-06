import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminStats, fetchCategories } from '../../slices/adminSlice';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [causes, setCauses] = useState([]);
  const [pendingCauses, setPendingCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { categories, stats } = useSelector((state) => state.admin);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin stats and categories using Redux actions
        await Promise.all([
          dispatch(fetchAdminStats()).unwrap(),
          dispatch(fetchCategories()).unwrap()
        ]);

        // Fetch users and causes
        console.log('Fetching users and causes...');
        const [usersResponse, causesResponse] = await Promise.all([
          axios.get('/admin/users'),
          axios.get('/admin/causes')
        ]);

        console.log('API Response - Users:', usersResponse.data);
        console.log('API Response - Causes:', causesResponse.data);

        if (!Array.isArray(causesResponse.data)) {
          console.error('Causes response is not an array:', causesResponse.data);
          toast.error('Invalid causes data received');
          return;
        }

        setUsers(usersResponse.data);
        setCauses(causesResponse.data);
        
        // Filter pending causes - using both possible status values
        const pending = causesResponse.data.filter(cause => {
          console.log('Cause status:', cause.status); // Log each cause's status
          return cause.status === 'pending approval' || cause.status === 'pending';
        });
        
        console.log('Filtered pending causes:', pending);
        setPendingCauses(pending);

      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(error.response?.data?.message || 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Debug render count
  useEffect(() => {
    console.log('Component rendered with:', {
      usersCount: users.length,
      causesCount: causes.length,
      pendingCount: pendingCauses.length,
      categories: categories.length
    });
  }, [users, causes, pendingCauses, categories]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Users</h2>
          <div className="text-4xl font-bold">{users.length}</div>
          <div className="mt-4">
            <div>Fundraisers: {users.filter(user => user.role === 'fundraiser').length}</div>
            <div>Donors: {users.filter(user => user.role === 'donor').length}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Causes</h2>
          <div className="text-4xl font-bold">{causes.length}</div>
          <div className="mt-4">
            <div>Active: {causes.filter(cause => cause.status === 'approved').length}</div>
            <div>Pending: {pendingCauses.length}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Categories</h2>
          <div className="text-4xl font-bold">{categories.length}</div>
          <div className="mt-4">
            <div>Active Categories</div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Donations</h2>
          <div className="text-4xl font-bold">
            ${causes.reduce((total, cause) => total + (cause.amountRaised || 0), 0).toLocaleString()}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pending Causes ({pendingCauses.length})</h2>
          <div className="space-y-4">
            {pendingCauses.map((cause) => (
              <Card key={cause._id} className="p-6">
                <h3 className="text-lg font-semibold mb-2">{cause.title}</h3>
                <p className="text-gray-600 mb-4">{cause.description?.substring(0, 100)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Created by: {cause.fundraiserId?.name || 'Unknown'}
                  </span>
                  <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                    {cause.status}
                  </span>
                </div>
              </Card>
            ))}
            {pendingCauses.length === 0 && (
              <p className="text-gray-500">No pending causes</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category._id} className="p-6">
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Causes: {causes.filter(cause => cause.category === category._id).length}
                </div>
              </Card>
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500">No categories found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
