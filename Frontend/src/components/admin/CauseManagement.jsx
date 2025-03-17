import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
  approveCause,
  rejectCause,
  fetchCauses,
  clearSelectedCause
} from '../../slices/causeSlice';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function CauseManagement() {
  const dispatch = useDispatch();
  const { causes = [], loading, error } = useSelector((state) => state.causes);
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();

  // Function to refresh causes data
  const refreshCauses = async () => {
    try {
      await dispatch(fetchCauses({ status: 'pending' })).unwrap();
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to fetch causes');
    }
  };

  // Initial load
  useEffect(() => {
    refreshCauses();
  }, []);

  const handleApprove = async (causeId) => {
    try {
      await dispatch(approveCause(causeId)).unwrap();
      toast.success('Cause approved successfully');
      refreshCauses(); // Refresh the list after approval
    } catch (error) {
      toast.error('Failed to approve cause');
    }
  };

  const handleReject = async (causeId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await dispatch(rejectCause({ causeId, reason: rejectionReason })).unwrap();
      setRejectionReason('');
      toast.success('Cause rejected successfully');
      refreshCauses(); // Refresh the list after rejection
    } catch (error) {
      toast.error('Failed to reject cause');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Filter pending causes
  const pendingCauses = Array.isArray(causes) ? causes.filter(cause => 
    cause.status === 'pending' || cause.status === 'pending approval'
  ) : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pending Causes</h1>

      {/* Causes List */}
      {pendingCauses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">No pending causes to review</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingCauses.map((cause) => (
            <div key={cause._id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{cause.title}</h2>
                  <p className="text-gray-600 mt-2">{cause.description}</p>
                  <div className="mt-4">
                    <p><strong>Goal Amount:</strong> ₹{cause.goalAmount?.toLocaleString()}</p>
                    <p><strong>Category:</strong> {cause.category?.name}</p>
                    <p><strong>Fundraiser:</strong> {cause.fundraiserId?.name}</p>
                    <p><strong>Status:</strong> <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">{cause.status}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(cause._id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(cause._id)}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/causes/${cause._id}`)}
                    variant="outline"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 