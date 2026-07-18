import React, { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  
  const [discount, setDiscount] = useState(() => {
    const saved = localStorage.getItem('cartDiscount');
    return saved ? Number(saved) : 0;
  });
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cartDiscount', discount.toString());
  }, [discount]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        const safeProducts = Array.isArray(data) ? data : (data?.products || []);
        setProducts(safeProducts);
      })
      .catch((err) => {
        console.error("Database connection error (Products):", err);
        setProducts([]); 
      });
  }, []);

  useEffect(() => {
    // Only fetch ALL orders if the user is logged in as an owner (admin)
    if (user && user.role === 'owner') {
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch orders");
          return res.json();
        })
        .then((data) => {
          const safeOrders = Array.isArray(data) ? data : (data?.orders || []);
          setOrders(safeOrders);
        })
        .catch((err) => {
          console.error("Database connection error (Orders):", err);
          setOrders([]); 
        });
    } else {
      // Normal users don't need the global orders state populated
      setOrders([]);
    }
  }, [user]);

  // Function for Admin Dashboard to mark orders as delivered
  const updateOrderStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        showToast("Order marked as delivered!");
      } else {
        showToast("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Error updating order status.");
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };
  const logout = () => {
    setUser(null); // This triggers the useEffect to clear localStorage
    setOrders([]); // Clears their personal orders from the screen for security
    showToast("Logged out successfully");
  };  
  const addToCart = (newProduct) => {
    setCartItems((prevCartItems) => {
      const itemExists = prevCartItems.find((item) => item._id === newProduct._id);
      if (itemExists) {
        return prevCartItems.map((item) =>
          item._id === itemExists._id 
            ? { ...newProduct, qty: newProduct.qty || item.qty } 
            : item
        );
      } else {
        return [...prevCartItems, { ...newProduct, qty: newProduct.qty || 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevCartItems) => prevCartItems.filter((item) => item._id !== id));
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartTotal = safeCartItems.reduce((acc, item) => acc + ((item?.price || 0) * (item?.qty || 0)), 0);
  const cartCount = safeCartItems.reduce((acc, item) => acc + (item?.qty || 0), 0);

  const addProduct = async (productData) => {
      try {
        const isFormData = productData instanceof FormData;
        
        const fetchOptions = {
          method: 'POST',
          body: isFormData ? productData : JSON.stringify(productData),
        };

        if (!isFormData) {
          fetchOptions.headers = {
            'Content-Type': 'application/json'
          };
        }

        const response = await fetch('http://localhost:5000/api/products', fetchOptions);
        
        if (response.ok) {
          const createdProduct = await response.json();
          const newItem = createdProduct?.product || createdProduct;
          setProducts(prev => [...prev, newItem]); 
          return true;
        }
        return false;
      } catch (error) {
        console.error("API Error - Creating product:", error);
        return false;
      }
    };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProducts(prev => prev.filter((product) => product._id !== id)); 
      }
    } catch (error) {
      console.error("API Error - Deleting product:", error);
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const isFormData = productData instanceof FormData;
      
      const fetchOptions = {
        method: 'PUT', 
        body: isFormData ? productData : JSON.stringify(productData),
      };

      if (!isFormData) {
        fetchOptions.headers = {
          'Content-Type': 'application/json'
        };
      }

      const response = await fetch(`http://localhost:5000/api/products/${id}`, fetchOptions);
      
      if (response.ok) {
        const updatedItem = await response.json();
        setProducts(prev => prev.map(p => p._id === id ? updatedItem : p)); 
        return true;
      }
      return false;
    } catch (error) {
      console.error("API Error - Updating product:", error);
      return false;
    }
  };



  return (
    <StoreContext.Provider value={{ 
      user, setUser, logout, // 👇 ADDED logout HERE
      searchQuery, setSearchQuery, 
      toast, showToast,
      discount, setDiscount,
      cartItems, setCartItems, addToCart, removeFromCart, cartTotal, cartCount, 
      products, addProduct, deleteProduct, updateProduct,
      orders, updateOrderStatus
    }}>
      {children}
    </StoreContext.Provider>
  );
};