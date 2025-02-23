import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveCause, rejectCause, clearAdminMessages } from '../../slices/adminSlice';
import { fetchCauses } from '../../slices/causeSlice';

const CauseApprovalCard = ({ cause }) => {
    const dispatch = useDispatch();
    const [rejectionMessage, setRejectionMessage] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const { loading, error, successMessage } = useSelector((state) => state.admin);

    const handleApprove = async () => {
        await dispatch(approveCause(cause._id));
        if (!error) {
            dispatch(fetchCauses());
            setTimeout(() => dispatch(clearAdminMessages()), 3000);
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        if (!rejectionMessage.trim()) return;

        await dispatch(rejectCause({ causeId: cause._id, rejectionMessage }));
        if (!error) {
            setShowRejectionForm(false);
            setRejectionMessage('');
            dispatch(fetchCauses());
            setTimeout(() => dispatch(clearAdminMessages()), 3000);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            {/* Status Messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error.message || 'An error occurred'}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {/* Cause Details */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{cause.title}</h3>
                <p className="text-gray-600 mb-2">{cause.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Target Amount</p>
                        <p className="font-semibold">₹{cause.targetAmount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fundraiser</p>
                        <p className="font-semibold">{cause.fundraiserId?.name}</p>
                    </div>
                </div>
            </div>

            {/* Images Preview */}
            {cause.images && cause.images.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Supporting Images</p>
                    <div className="flex gap-2 overflow-x-auto">
                        {cause.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Support ${index + 1}`}
                                className="w-24 h-24 object-cover rounded"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Documents List */}
            {cause.documents && cause.documents.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Supporting Documents</p>
                    <div className="space-y-2">
                        {cause.documents.map((doc, index) => (
                            <a
                                key={index}
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 block"
                            >
                                Document {index + 1}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Approve'}
                </button>
                <button
                    onClick={() => setShowRejectionForm(true)}
                    disabled={loading}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                    Reject
                </button>
            </div>

            {/* Rejection Form */}
            {showRejectionForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Reject Cause</h3>
                        <form onSubmit={handleReject}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Rejection Message
                                </label>
                                <textarea
                                    value={rejectionMessage}
                                    onChange={(e) => setRejectionMessage(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectionForm(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CauseApprovalCard;
