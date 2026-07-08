// src/pages/admin/DashboardHome.jsx
import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

export default function DashboardHome() {
  const { products, orders } = useContext(StoreContext);

  // Safely calculate metrics
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const totalProducts = safeProducts.length;
  const totalOrders = safeOrders.length;
  
  // Calculate total revenue from all orders
  const totalRevenue = safeOrders.reduce((acc, order) => acc + (order?.totalPrice || 0), 0);
  
  // Find orders that haven't been delivered yet
  const pendingDeliveries = safeOrders.filter(order => !order.isDelivered).length;
  
  // Find products that have less than 5 items in stock
  const lowStockProducts = safeProducts.filter(product => product.countInStock < 5).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back. Here is what is happening with your store today.</p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-4">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-4">{totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Deliveries</p>
          <p className="text-3xl font-bold text-orange-500 mt-4">{pendingDeliveries}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
          <p className="text-3xl font-bold text-indigo-600 mt-4">{totalProducts}</p>
        </div>
      </div>

      {/* Actionable Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Inventory Alerts</h3>
          </div>
          <div className="p-6">
            {lowStockProducts > 0 ? (
              <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <span className="font-medium">You have {lowStockProducts} products low on stock!</span>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                <span className="font-medium">All products are sufficiently stocked.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <a href="/admin/products" className="flex items-center justify-center py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Add New Product
            </a>
            <a href="/admin/orders" className="flex items-center justify-center py-3 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
              View Pending Orders
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}