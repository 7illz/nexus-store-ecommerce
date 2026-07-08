// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AdminDashboard() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard Home', path: '/admin' },
    { name: 'Manage Products', path: '/admin/products' },
    { name: 'Manage Orders', path: '/admin/orders' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-indigo-600 tracking-tight">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {navLinks.map((link) => {
            // Check if the current URL matches the link path exactly
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer of Sidebar */}
        <div className="p-6 border-t border-gray-100">
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium">
            <span className="mr-2">&larr;</span> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area (This is where DashboardHome, AdminProducts, etc. render) */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}