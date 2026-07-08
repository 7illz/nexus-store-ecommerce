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
    fetch('http://localhost:5000/api/orders')
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
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
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

  // 👇 THIS IS THE UPDATED FUNCTION 👇
  const addProduct = async (productData) => {
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData),
        });
        
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

  const updateOrderStatus = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}/deliver`, {
        method: 'PUT',
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map((order) => (order._id === id ? updatedOrder : order)));
      }
    } catch (error) {
      console.error("API Error - Updating order:", error);
    }
  };

  return (
    <StoreContext.Provider value={{ 
      user, setUser, 
      searchQuery, setSearchQuery, 
      toast, showToast,
      cartItems, setCartItems, addToCart, removeFromCart, cartTotal, cartCount, 
      products, addProduct, deleteProduct,
      orders, updateOrderStatus
    }}>
      {children}
    </StoreContext.Provider>
  );
};