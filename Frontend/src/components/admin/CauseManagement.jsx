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
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/lib/axios';

export default function CauseManagement() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { causes = [], loading, selectedCause, error } = useSelector((state) => state.causes);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPendingCauses = async () => {
      try {
        await dispatch(fetchCauses()).unwrap();
      } catch (error) {
        toast.error('Failed to fetch pending causes');
      }
    };

    loadPendingCauses();
  }, [dispatch]);

  const handleApprove = async (causeId) => {
    try {
      await dispatch(approveCause(causeId)).unwrap();
      toast.success('Cause approved successfully');
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
    } catch (error) {
      toast.error('Failed to reject cause');
    }
  };

  const pendingCauses = causes.filter(cause => cause.status === 'pending');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cause Management</h1>

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
                    <p><strong>Goal Amount:</strong> ${cause.goalAmount?.toLocaleString()}</p>
                    <p><strong>Category:</strong> {cause.category?.name}</p>
                    <p><strong>Fundraiser:</strong> {cause.fundraiserId?.name}</p>
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
                </div>
              </div>
              
              {cause.images?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Images</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {cause.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Cause image ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {cause.documents?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <div className="space-y-2">
                    {cause.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline block"
                      >
                        View Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Textarea
                  placeholder="Reason for rejection (required for rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 