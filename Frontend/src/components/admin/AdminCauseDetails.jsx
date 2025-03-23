import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { Loader2 } from 'lucide-react';

export default function AdminCauseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [showDonations, setShowDonations] = useState(false);

  useEffect(() => {
    fetchCauseDetails();
  }, [id]);

  const fetchCauseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/causes/${id}`);
      setCause(response.data);
    } catch (error) {
      console.error('Error fetching cause details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch cause details';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    if (!showDonations) {
      setShowDonations(true);
      try {
        setLoadingDonations(true);
        const response = await axios.get(`/donations/by-cause/${id}`);
        setDonations(response.data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
        toast.error('Failed to load donations');
      } finally {
        setLoadingDonations(false);
      }
    } else {
      setShowDonations(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !cause) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500 dark:text-red-400">{error || 'Cause not found'}</p>
        <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700 text-white">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            variant="ghost"
          >
            ← Back
          </Button>
          <div className="flex gap-2">
            {cause.documents?.length > 0 && (
              <Button
                onClick={() => window.open(cause.documents[0], '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                View Documents
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Cause Header */}
          <div className="relative h-64 md:h-96">
            <img
              src={cause.images?.[0] || '/placeholder-cause.jpg'}
              alt={cause.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{cause.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {cause.category?.name || 'General'}
                </span>
                <span className={`backdrop-blur-sm px-3 py-1 rounded-full ${
                  cause.status === 'approved' ? 'bg-green-500/20' : 
                  cause.status === 'completed' ? 'bg-blue-500/20' : 
                  cause.status === 'rejected' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                }`}>
                  {cause.status}
                </span>
              </div>
            </div>
          </div>

          {/* Cause Details */}
          <div className="p-6 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{cause.description}</p>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fundraiser Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Created By</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{cause.fundraiserId?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Contact</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{cause.fundraiserId?.email}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campaign Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Goal Amount</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">₹{cause.goalAmount?.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Raised Amount</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">₹{cause.currentAmount?.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Duration</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {new Date(cause.startDate).toLocaleDateString()} - {new Date(cause.endDate).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Donations Section */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Donations</h3>
                <Button 
                  variant="outline"
                  onClick={fetchDonations}
                  className="text-sm"
                >
                  {showDonations ? 'Hide Donations' : 'View Donations'}
                </Button>
              </div>

              {showDonations && (
                <div className="space-y-4 mt-2">
                  {loadingDonations ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : donations.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-2">No donations yet</p>
                  ) : (
                    <div className="space-y-3">
                      {donations.map((donation, index) => (
                        <div key={donation._id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {donation.isAnonymous ? 'Anonymous Donor' : donation.donorId?.name || 'Donor'}
                              </span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(donation.createdAt).toLocaleDateString()} • 
                                {new Date(donation.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 font-semibold">
                              ₹{donation.amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                          {donation.message && (
                            <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-300">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Supporting Images */}
            {cause.images && cause.images.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Supporting Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cause.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Support ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supporting Documents */}
            {cause.documents && cause.documents.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Supporting Documents</h3>
                <div className="space-y-2">
                  {cause.documents.map((doc, index) => (
                    <Button
                      key={index}
                      onClick={() => window.open(doc, '_blank')}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Download Document {index + 1}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
} 