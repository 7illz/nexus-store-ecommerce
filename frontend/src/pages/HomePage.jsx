import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Filter, ArrowDownUp, Loader } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

export default function HomePage() {
  const { searchQuery, addToCart } = useContext(StoreContext);
  
  // Local state for our filters and products
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Fetch products whenever search, category, or sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build the dynamic URL query string
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('keyword', searchQuery);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (sortOrder) queryParams.append('sort', sortOrder);

        const response = await fetch(`http://localhost:5000/api/products?${queryParams.toString()}`);
        const data = await response.json();
        
        // Update our state with data from the new controller
        setProducts(data.products || []);
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    // Use a small timeout (debounce) so we don't spam the backend while the user is typing
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, sortOrder]);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-indigo-600 text-white mb-12 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-500 opacity-90"></div>
        <div className="relative px-8 py-16 sm:px-16 sm:py-24 lg:py-32 flex flex-col items-start">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">
            Next-Gen Tech & Gear
          </h1>
          <p className="max-w-xl text-lg text-indigo-100 mb-8">
            Upgrade your lifestyle with our premium selection of electronics, wearables, and accessories. Fast shipping guaranteed.
          </p>
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h2>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          
          {/* Category Filter */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-4 h-4 text-gray-500" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2 w-full sm:w-48 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative flex items-center">
            <ArrowDownUp className="absolute left-3 w-4 h-4 text-gray-500" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="pl-9 pr-8 py-2 w-full sm:w-48 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="lowest">Price: Low to High</option>
              <option value="highest">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State or Empty State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setSelectedCategory(''); setSortOrder('newest'); setSearchQuery && setSearchQuery(''); }}
            className="mt-4 text-indigo-600 font-medium hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              <Link to={`/product/${product._id}`}>
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {product.countInStock === 0 && (
                    <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                      Out of Stock
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-5">
                <div className="text-xs text-indigo-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</div>
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex items-center mt-1 mb-3 text-sm text-gray-500">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  {product.rating} ({product.numReviews})
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.countInStock === 0}
                    className={`p-2 rounded-full transition ${product.countInStock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}