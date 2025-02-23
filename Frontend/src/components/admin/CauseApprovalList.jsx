import React from 'react';
import CauseApprovalCard from './CauseApprovalCard';

const CauseApprovalList = ({ causes }) => {
    if (!causes.length) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 text-lg">No pending causes for approval</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {causes.map((cause) => (
                <CauseApprovalCard key={cause._id} cause={cause} />
            ))}
        </div>
    );
};

export default CauseApprovalList;
