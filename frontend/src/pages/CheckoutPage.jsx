import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, user, showToast, setCart } = useContext(StoreContext);

  // If the user isn't logged in, send them to the login page
  useEffect(() => {
    if (!user) {
      navigate('/login');
      if (showToast) showToast('Please log in to checkout');
    }
  }, [user, navigate, showToast]);

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Get the token we saved during login
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found, please log in again.');

      // Format cart items to match the Mongoose OrderModel exactly
      const formattedOrderItems = cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id || item.id // Backend expects 'product' to be the ID
      }));

      // 2. Prepare the order data matching our backend Model
      const orderData = {
        orderItems: formattedOrderItems,
        shippingAddress,
        paymentMethod,
        taxPrice: Number((0.08 * cartTotal).toFixed(2)),
        shippingPrice: 10.00,
        totalPrice: cartTotal + 10.00 + (cartTotal * 0.08)
      };

      // 3. Send the POST request to the Express backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // The Auth Middleware checks this!
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      if (showToast) showToast('Order placed successfully! 🎉');
      
      // 4. Empty the cart and redirect to home
      setCart([]);
      navigate('/');
    } catch (error) {
      console.error('Checkout Error:', error);
      if (showToast) showToast(`Error: ${error.message}`);
    }
  };

  // Prevent crashing if the cart is empty or undefined
  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  // Calculate final totals
  const shippingPrice = 10.00;
  const taxPrice = Number((0.08 * cartTotal).toFixed(2));
  const finalTotal = cartTotal + shippingPrice + taxPrice;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="lg:flex lg:space-x-8">
        {/* Left Side: Forms */}
        <div className="lg:w-2/3 space-y-8">
          
          {/* Shipping Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="mr-3 text-indigo-600" /> Shipping Address
            </h2>
            <form id="checkout-form" onSubmit={placeOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input 
                  required 
                  type="text" 
                  name="address" 
                  value={shippingAddress.address} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="123 Main St" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    required 
                    type="text" 
                    name="city" 
                    value={shippingAddress.city} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="New York" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input 
                    required 
                    type="text" 
                    name="postalCode" 
                    value={shippingAddress.postalCode} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="10001" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input 
                  required 
                  type="text" 
                  name="country" 
                  value={shippingAddress.country} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="United States" 
                />
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="mr-3 text-indigo-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input 
                  type="radio" 
                  name="payment" 
                  value="Credit Card" 
                  checked={paymentMethod === 'Credit Card'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                />
                <span className="ml-3 font-medium text-gray-900">Credit Card / Debit Card</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input 
                  type="radio" 
                  name="payment" 
                  value="PayPal" 
                  checked={paymentMethod === 'PayPal'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                />
                <span className="ml-3 font-medium text-gray-900">PayPal</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3 mt-8 lg:mt-0">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-600">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate pr-4">{item.qty}x {item.name}</span>
                  <span className="font-medium text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mt-4 mb-8 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-indigo-600">${finalTotal.toFixed(2)}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-xl flex items-center justify-center transition shadow-lg"
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}