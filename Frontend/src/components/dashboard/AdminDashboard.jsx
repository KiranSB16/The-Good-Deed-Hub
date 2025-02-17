import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { useSelector } from 'react-redux';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [causes, setCauses] = useState([]);
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, causesResponse] = await Promise.all([
          axios.get('/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/causes', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUsers(usersResponse.data);
        setCauses(causesResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching dashboard data');
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div>Active: {causes.filter(cause => cause.status === 'active').length}</div>
            <div>Pending: {causes.filter(cause => cause.status === 'pending').length}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Donations</h2>
          <div className="text-4xl font-bold">
            ${causes.reduce((total, cause) => total + (cause.amountRaised || 0), 0).toLocaleString()}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Causes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {causes.slice(0, 6).map((cause) => (
            <Card key={cause._id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">{cause.title}</h3>
              <p className="text-gray-600 mb-4">{cause.description.substring(0, 100)}...</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Created by: {cause.createdBy?.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  cause.status === 'active' ? 'bg-green-100 text-green-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {cause.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
