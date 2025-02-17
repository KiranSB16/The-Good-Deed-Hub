import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useSelector } from 'react-redux';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [recommendedCauses, setRecommendedCauses] = useState([]);
  const { token, user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsResponse, causesResponse] = await Promise.all([
          axios.get('/api/donations/my-donations', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/causes/recommended', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDonations(donationsResponse.data);
        setRecommendedCauses(causesResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching dashboard data');
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Donor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {user?.name}</p>
            <p><span className="font-semibold">Email:</span> {user?.email}</p>
            <p><span className="font-semibold">Total Donations:</span> {donations.length}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Amount Donated</h2>
          <div className="text-4xl font-bold">
            ${donations.reduce((total, donation) => total + (donation.amount || 0), 0).toLocaleString()}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Causes Supported</h2>
          <div className="text-4xl font-bold">
            {new Set(donations.map(donation => donation.causeId)).size}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Recent Donations</h2>
          <div className="space-y-4">
            {donations.slice(0, 5).map((donation) => (
              <Card key={donation._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{donation.cause?.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${donation.amount.toLocaleString()}</div>
                    <Button 
                      variant="ghost" 
                      className="text-sm"
                      onClick={() => navigate(`/cause/${donation.causeId}`)}
                    >
                      View Cause
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Recommended Causes</h2>
          <div className="space-y-4">
            {recommendedCauses.slice(0, 5).map((cause) => (
              <Card key={cause._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{cause.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {cause.description.substring(0, 100)}...
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min((cause.amountRaised / cause.goalAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm mt-1">
                      ${cause.amountRaised?.toLocaleString()} raised of ${cause.goalAmount?.toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/cause/${cause._id}`)}
                    className="ml-4"
                  >
                    Donate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;