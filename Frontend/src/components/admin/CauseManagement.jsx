import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
  fetchPendingCauses,
  approveCause,
  rejectCause,
  setSelectedCause,
  clearSelectedCause
} from '../../slices/causeSlice';
import { useNavigate } from 'react-router-dom';

export default function CauseManagement() {
  const dispatch = useDispatch();
  const { causes = [], loading, selectedCause, error } = useSelector((state) => state.causes);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('CauseManagement - Component mounted, fetching pending causes...');
    const fetchData = async () => {
      try {
        console.log('CauseManagement - Dispatching fetchPendingCauses...');
        const result = await dispatch(fetchPendingCauses()).unwrap();
        console.log('CauseManagement - Pending causes fetched successfully:', {
          count: result?.length || 0,
          causes: result
        });
      } catch (error) {
        console.error('CauseManagement - Error fetching pending causes:', {
          error,
          message: error?.message,
          response: error?.response?.data
        });
      }
    };
    fetchData();
  }, [dispatch]);

  // Debug logging for causes state
  useEffect(() => {
    console.log('CauseManagement - Causes state updated:', {
      total: causes.length,
      statuses: causes.map(c => c.status),
      ids: causes.map(c => c._id),
      causes: causes
    });
  }, [causes]);

  const handleApproveCause = async (causeId) => {
    try {
      console.log('CauseManagement - Approving cause:', causeId);
      await dispatch(approveCause(causeId)).unwrap();
      console.log('CauseManagement - Cause approved successfully');
      dispatch(fetchPendingCauses()); // Refresh the list after approval
    } catch (error) {
      console.error('CauseManagement - Error approving cause:', {
        causeId,
        error,
        message: error?.message,
        response: error?.response?.data
      });
    }
  };

  const handleRejectCause = async (causeId) => {
    try {
      if (!rejectionReason) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      console.log('CauseManagement - Rejecting cause:', {
        causeId,
        reason: rejectionReason
      });
      await dispatch(rejectCause({ causeId, rejectionMessage: rejectionReason })).unwrap();
      console.log('CauseManagement - Cause rejected successfully');
      setRejectionReason('');
      dispatch(clearSelectedCause());
      dispatch(fetchPendingCauses()); // Refresh the list after rejection
    } catch (error) {
      console.error('CauseManagement - Error rejecting cause:', {
        causeId,
        error,
        message: error?.message,
        response: error?.response?.data
      });
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleDocumentClick = (documentUrl) => {
    window.open(documentUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => dispatch(fetchPendingCauses())}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            Pending Causes Review ({causes.length})
          </h1>

          <div className="space-y-6">
            {causes.length > 0 ? (
              causes.map((cause) => (
                <div
                  key={cause._id}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{cause.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {cause.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {cause.status}
                    </span>
                  </div>

                  {/* Images */}
                  {cause.images && cause.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {cause.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Cause image ${index + 1}`}
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => handleImageClick(image)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Documents */}
                  {cause.documents && cause.documents.length > 0 && (
                    <div className="flex gap-4">
                      {cause.documents.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          View Document {index + 1}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-4">
                    {selectedCause === cause._id ? (
                      <div className="w-full space-y-4">
                        <Textarea
                          placeholder="Enter reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-end gap-4">
                          <Button
                            onClick={() => dispatch(clearSelectedCause())}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleRejectCause(cause._id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleApproveCause(cause._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => dispatch(setSelectedCause(cause._id))}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No pending causes to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Image Preview</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl font-medium"
              >
                ×
              </button>
            </div>
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 