import React from 'react';

const HomePage = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Insurance Management System</h1>
      <p className="text-gray-600">
        Use the navigation bar to manage vehicles, owners, policies, and other data.
      </p>
      <p className="text-gray-600 mt-2">
        This frontend is built with Vite, React, and Tailwind CSS.
      </p>
    </div>
  );
};

export default HomePage;
