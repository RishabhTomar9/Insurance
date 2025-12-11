import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const activeLinkClass = "text-white bg-gray-900";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 items-center">
              <NavLink to="/" className="text-white text-lg font-bold">InsuranceSys</NavLink>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <NavLink to="/vehicles" className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} rounded-md px-3 py-2 text-sm font-medium`}>Vehicles</NavLink>
                <NavLink to="/owners" className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} rounded-md px-3 py-2 text-sm font-medium`}>Owners</NavLink>
                <NavLink to="/policies" className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} rounded-md px-3 py-2 text-sm font-medium`}>Policies</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
