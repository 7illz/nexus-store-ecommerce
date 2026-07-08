import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext'; 

export default function AdminProducts() {
  const { products, addProduct, deleteProduct } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialProductState = {
    name: '', 
    brand: '', 
    category: '', 
    price: '', 
    countInStock: '', 
    description: '', 
    image: '',       // For the text URL
    imageFile: null  // For the physical file
  };
  
  const [newProduct, setNewProduct] = useState(initialProductState);

  // Metrics
  const safeProducts = Array.isArray(products) ? products : [];
  const totalProducts = safeProducts.length;
  const totalInventoryValue = safeProducts.reduce((acc, item) => acc + ((item?.price || 0) * (item?.countInStock || 0)), 0);
  const lowStockItems = safeProducts.filter(item => item.countInStock < 5).length;

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    let payload;

    // If they uploaded a file, we MUST use FormData to send binary data over HTTP
    if (newProduct.imageFile) {
      payload = new FormData();
      payload.append('name', newProduct.name);
      payload.append('brand', newProduct.brand);
      payload.append('category', newProduct.category);
      payload.append('price', Number(newProduct.price));
      payload.append('countInStock', Number(newProduct.countInStock));
      payload.append('description', newProduct.description);
      payload.append('imageFile', newProduct.imageFile); // Attach the actual file
    } else {
      // If no file, just send the normal JSON object
      payload = {
        name: newProduct.name,
        brand: newProduct.brand,
        category: newProduct.category,
        price: Number(newProduct.price),
        countInStock: Number(newProduct.countInStock),
        description: newProduct.description,
        image: newProduct.image // Send the URL string
      };
    }

    const success = await addProduct(payload);
    if (success) {
      setNewProduct(initialProductState);
      setIsModalOpen(false);
    } else {
      alert("Failed to create product. Check backend terminal for errors.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    // Grab the first file the user selected
    setNewProduct({ ...newProduct, imageFile: e.target.files[0] });
  };

  return (
    <div className="relative space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
        >
          + Add New Product
        </button>
      </div>

      {/* Metric Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900">${totalInventoryValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Category / Brand</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Stock Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeProducts.length > 0 ? (
                safeProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded object-cover border" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="block text-sm font-medium">{product.category}</span>
                      <span className="block text-xs text-gray-400">{product.brand}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">${product.price}</td>
                    <td className="px-6 py-4">
                      {product.countInStock > 0 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          In Stock ({product.countInStock})
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium hover:underline mr-4 transition">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 font-medium hover:underline transition">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products found. Start adding inventory!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Product</h2>
            
            <form onSubmit={handleCreateProduct} className="space-y-5">
              
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" name="name" required value={newProduct.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Product Image (Choose one)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Upload File</label>
                    <input 
                      type="file" 
                      name="imageFile" 
                      accept="image/*"
                      onChange={handleFileChange} 
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">OR Image URL</label>
                    <input 
                      type="text" 
                      name="image" 
                      placeholder="https://..."
                      value={newProduct.image} 
                      onChange={handleInputChange} 
                      disabled={!!newProduct.imageFile} // Disable text input if they selected a file
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 disabled:bg-gray-200" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input type="text" name="brand" required value={newProduct.brand} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" name="category" required value={newProduct.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" name="price" step="0.01" min="0" required value={newProduct.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Count In Stock</label>
                  <input type="number" name="countInStock" min="0" required value={newProduct.countInStock} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="3" required value={newProduct.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}