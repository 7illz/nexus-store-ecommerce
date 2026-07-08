import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, showToast } = useContext(StoreContext);

  // Local state for the form
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STANDARD EMAIL/PASSWORD LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || (data.isAdmin ? 'owner' : 'user') 
      });

      showToast(`Successfully ${isLogin ? 'logged in' : 'registered'}!`);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the Google access token to your backend to verify and create a JWT
        const response = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Google login failed');
        }

        // Store standard JWT from YOUR backend (not Google's)
        localStorage.setItem('token', data.token);
        setUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role || (data.isAdmin ? 'owner' : 'user') 
        });

        showToast('Successfully logged in with Google!');
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    },
    onError: () => setError('Google authentication failed.'),
  });

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-gray-500 mt-2">Secure access to your NexusStore account</p>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Only for Registration) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                name="name"
                type="text" 
                required 
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              />
            </div>
          )}
          
          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              required 
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              required 
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            />
          </div>
          
          {/* Submit Button */}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-md mt-4">
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        {/* Toggle Login/Register Mode */}
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {isLogin ? 'Need an account? Register here' : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* --- GOOGLE LOGIN DIVIDER --- */}
        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* --- GOOGLE LOGIN BUTTON --- */}
        <div className="mt-6">
          <button 
            type="button"
            onClick={() => handleGoogleLogin()} 
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            {/* Google "G" Logo SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
        </div>

      </div>
    </div>
  );
}