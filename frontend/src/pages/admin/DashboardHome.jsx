import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { TrendingUp, ShoppingBag, PackageX, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="space-y-8 animate-fade-in relative z-10">
      <div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 tracking-tight">
          Overview
        </h1>
        <p className="text-gray-400 mt-2 font-medium">System diagnostics and real-time metrics.</p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-green-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Revenue</p>
            <TrendingUp className="text-green-400 w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-3xl font-black text-green-400 mt-4">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Orders</p>
            <ShoppingBag className="text-emerald-400 w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-3xl font-black text-gray-100 mt-4">{totalOrders}</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-yellow-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending Deliveries</p>
            <PackageX className="text-yellow-400 w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-3xl font-black text-yellow-400 mt-4">{pendingDeliveries}</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Products</p>
            <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="text-blue-400 text-xs font-bold">#</span>
            </div>
          </div>
          <p className="text-3xl font-black text-gray-100 mt-4">{totalProducts}</p>
        </div>
      </div>

      {/* Actionable Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-800/50 bg-gray-900/80">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              System Alerts
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {lowStockProducts > 0 ? (
              <div className="flex items-center p-4 bg-red-950/30 text-red-400 rounded-xl border border-red-900/50">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-3" />
                <span className="font-semibold">Critical: {lowStockProducts} products low on stock!</span>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-green-950/30 text-green-400 rounded-xl border border-green-900/50">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-3" />
                <span className="font-semibold">All systems nominal. Inventory stable.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-800/50 bg-gray-900/80">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 flex-1">
            <Link to="/admin/products" className="group flex flex-col items-center justify-center p-4 bg-gray-950 rounded-xl border border-gray-800 text-sm font-bold text-gray-400 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5 transition-all">
              <span className="mb-2">Add New Product</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link to="/admin/orders" className="group flex flex-col items-center justify-center p-4 bg-green-600 rounded-xl border border-green-500 text-sm font-bold text-black hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
              <span className="mb-2">Pending Orders</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}