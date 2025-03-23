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
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const navigate = useNavigate();

  // Function to refresh causes data
  const refreshCauses = async () => {
    try {
      // Fetch only pending causes
      const result = await dispatch(fetchCauses({ status: 'pending' })).unwrap();
      console.log('Fetched pending causes:', result);
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
      setIsApproving(true);
      await dispatch(approveCause(causeId)).unwrap();
      toast.success('Cause approved successfully');
      refreshCauses(); // Refresh the list after approval
    } catch (error) {
      toast.error('Failed to approve cause');
      console.error('Approval error:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (causeId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsRejecting(true);
      await dispatch(rejectCause({ causeId, reason: rejectionReason })).unwrap();
      setRejectionReason('');
      toast.success('Cause rejected successfully');
      refreshCauses(); // Refresh the list after rejection
    } catch (error) {
      toast.error('Failed to reject cause');
      console.error('Rejection error:', error);
    } finally {
      setIsRejecting(false);
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

  // Filter causes by status - only pending causes
  const pendingCauses = causes && causes.causes 
    ? causes.causes.filter(cause => cause.status === 'pending' || cause.status === 'pending approval')
    : Array.isArray(causes) 
      ? causes.filter(cause => cause.status === 'pending' || cause.status === 'pending approval')
      : [];
      
  console.log('Causes state:', causes);
  console.log('Pending causes:', pendingCauses);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cause Management</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Pending Causes ({pendingCauses.length})
          </h2>
          <Button 
            onClick={refreshCauses} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            Refresh
          </Button>
        </div>

        {pendingCauses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No pending causes to review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingCauses.map((cause) => (
              <div key={cause._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{cause.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      By: {cause.fundraiserId?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Category: {cause.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Goal: ₹{cause.goalAmount?.toLocaleString() || '0'}
                    </p>
                    <p className="mt-2 line-clamp-2">{cause.description}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                    <Button 
                      onClick={() => navigate(`/causes/${cause._id}`)}
                      variant="outline"
                      className="w-full md:w-auto"
                    >
                      View Details
                    </Button>
                    <Button 
                      onClick={() => handleApprove(cause._id)}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    <Button 
                      onClick={() => document.getElementById(`reject-modal-${cause._id}`).showModal()}
                      variant="destructive"
                      className="w-full md:w-auto"
                    >
                      Reject
                    </Button>
                    
                    {/* Rejection Modal */}
                    <dialog id={`reject-modal-${cause._id}`} className="modal">
                      <div className="modal-box bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                        <h3 className="font-bold text-lg mb-4">Reject Cause</h3>
                        <p className="mb-4">Please provide a reason for rejection:</p>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="mb-4"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRejectionReason('');
                              document.getElementById(`reject-modal-${cause._id}`).close();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleReject(cause._id);
                              document.getElementById(`reject-modal-${cause._id}`).close();
                            }}
                            disabled={isRejecting}
                          >
                            {isRejecting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              'Reject'
                            )}
                          </Button>
                        </div>
                      </div>
                    </dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}