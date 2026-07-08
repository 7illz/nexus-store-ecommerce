import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { User, LogOut, Package, Loader } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(StoreContext);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. If no user, send to login
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log("Fetching orders with token:", token ? "Token exists" : "NO TOKEN FOUND");

        const response = await fetch('http://localhost:5000/api/orders/myorders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Server returned ${response.status}`);
        }

        // FIX: Ensure data is an array before setting it to prevent .map() crashes!
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]); 
        }
        
        setError(null);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  if (loading) return <div className="p-20 text-center"><Loader className="w-10 h-10 animate-spin mx-auto text-indigo-600"/></div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Show Error if backend fails */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8">
          <h3 className="font-bold">Error loading orders:</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 underline">Try again</button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      {/* Order List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        
        {/* FIX: Extra check to ensure orders is an array before checking length */}
        {!Array.isArray(orders) || orders.length === 0 ? (
          <p className="text-gray-500">No orders placed yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((order) => (
              <li key={order._id || Math.random()} className="py-4 flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">Order ID: {order._id || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 mt-1">Status: {order.status || 'Pending'}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : 'No total'}</p>
                  <p>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'No date'}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}