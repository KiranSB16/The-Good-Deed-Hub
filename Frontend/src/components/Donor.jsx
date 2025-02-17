import React from 'react';

function Donor() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Donor Dashboard</h1>
      <div className="grid gap-6">
        {/* Add your donor-specific content here */}
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Welcome, Donor!</h2>
          <p className="text-muted-foreground">
            This is your donor dashboard where you can view and manage your donations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Donor;
