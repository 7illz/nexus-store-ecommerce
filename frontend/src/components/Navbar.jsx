import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 1. Added LogOut to your lucide-react imports
import { ShoppingCart, Search, User, Package, MapPin, LogOut } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

export default function Navbar() {
  // 2. Pulled in logout from Context
  const { cartCount, user, searchQuery, setSearchQuery, logout } = useContext(StoreContext);
  const navigate = useNavigate();

  // 3. Created the logout handler
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link to="/" className="flex items-center cursor-pointer">
            <Package className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold tracking-tight">NexusStore</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            
            <Link to="/contact" className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition cursor-pointer" title="Find Our Store">
              <MapPin className="h-6 w-6" />
              <span className="hidden sm:block text-sm font-medium">Store</span>
            </Link>

            {/* Conditional routing for User/Login/Logout */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition cursor-pointer">
                  <User className="h-6 w-6" />
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </Link>
                
                {/* NEW: Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:block text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition cursor-pointer">
                Log In
              </Link>
            )}
            
            {user?.role === 'owner' && (
              <Link to="/admin" className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Admin
              </Link>
            )}

            <Link to="/cart" className="relative text-gray-500 hover:text-indigo-600 transition">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}