import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { Star, ShoppingCart, User, AlertCircle, Loader } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, user } = useContext(StoreContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch the product from the backend
  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Handle the Review Form Submission
  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviewSuccess(true);
        setComment(''); // Clear the form
        setRating(5);
        fetchProduct(); // Instantly reload to show the new review!
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (error) {
      setReviewError('Server error. Please try again later.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (!product) return <div className="text-center py-20 text-2xl font-bold">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        <div className="md:w-1/2">
          <img src={product.image} alt={product.name} className="w-full rounded-2xl shadow-lg object-cover" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="text-sm text-indigo-600 font-bold tracking-wider uppercase mb-2">{product.category}</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-gray-500 font-medium">({product.numReviews || 0} reviews)</span>
          </div>
          
          <p className="text-3xl font-bold text-gray-900 mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          
          <div className="mb-8">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)}
            disabled={product.countInStock === 0}
            className={`w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white transition ${product.countInStock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
          >
            <ShoppingCart className="mr-2 h-6 w-6" />
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <hr className="border-gray-200 mb-12" />

      {/* Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Side: Existing Reviews List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {(!product.reviews || product.reviews.length === 0) ? (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-gray-500 text-center">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-indigo-100 p-2 rounded-full"><User className="w-4 h-4 text-indigo-600" /></div>
                      <span className="font-bold text-gray-900">{review.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{review.createdAt?.substring(0, 10)}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Write a Review Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>
          {user ? (
            <form onSubmit={submitReview} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              {reviewError && (
                <div className="mb-4 bg-red-50 p-3 rounded-lg flex items-center text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 mr-2" /> {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="mb-4 bg-green-50 p-3 rounded-lg text-green-700 text-sm font-medium">
                  Review submitted successfully!
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea 
                  rows="4" 
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={reviewLoading}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">You must be logged in to post a review.</p>
              <Link to="/login" className="inline-block bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                Log In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}