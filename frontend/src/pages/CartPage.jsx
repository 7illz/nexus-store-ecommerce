import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  // Assuming your StoreContext provides these. Adjust names if yours are slightly different!
  const { cartItems = [], removeFromCart, addToCart } = useContext(StoreContext);

  // --- COUPON STATE ---
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0); // Percentage off (e.g., 20)
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // --- MATH & TOTALS ---
  // 1. Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
  
  // 2. Calculate discount amount in dollars
  const discountAmount = (subtotal * discount) / 100;
  
  // 3. Final total
  const finalTotal = subtotal - discountAmount;

  // --- COUPON HANDLER ---
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });

      const data = await response.json();

      if (response.ok) {
        setDiscount(data.discountPercentage);
        setCouponSuccess(`Success! ${data.discountPercentage}% discount applied.`);
      } else {
        setDiscount(0);
        setCouponError(data.message || 'Invalid coupon');
      }
    } catch (error) {
      setCouponError('Error applying coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const checkoutHandler = () => {
    // You can pass the discount or final total to your checkout page via state or context if needed!
    navigate('/login?redirect=checkout');
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-center border border-gray-100">
          <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any tech gear to your cart yet.</p>
          <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Side: Cart Items */}
        <div className="lg:w-2/3 space-y-6">
          {cartItems.map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-6">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-gray-50" />
              
              <div className="flex-1 text-center sm:text-left">
                <Link to={`/product/${item._id}`} className="text-lg font-bold text-gray-900 hover:text-indigo-600 line-clamp-1">
                  {item.name}
                </Link>
                <div className="text-indigo-600 font-bold mt-1">${item.price.toFixed(2)}</div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                <select
                  value={item.qty || 1}
                  onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                  className="bg-transparent font-medium text-gray-700 outline-none p-2 cursor-pointer"
                >
                  {[...Array(item.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove Button */}
              <button 
                onClick={() => removeFromCart(item._id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((acc, item) => acc + (item.qty || 1), 0)} items)</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Discount Row (Only shows if coupon applied) */}
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({discount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <hr className="border-gray-200 mb-6" />
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-3xl font-extrabold text-indigo-600">${finalTotal.toFixed(2)}</span>
            </div>

            {/* --- COUPON UI BLOCK --- */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
              <div className="flex items-center text-sm font-bold text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                Have a Promo Code?
              </div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isApplying || !couponCode}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                  {isApplying ? '...' : 'Apply'}
                </button>
              </form>
              
              {couponError && <p className="text-red-600 text-sm mt-2 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-green-600 text-sm mt-2 font-medium">{couponSuccess}</p>}
            </div>

            {/* Checkout Button */}
            <button 
              onClick={checkoutHandler}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-sm flex justify-center items-center"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}