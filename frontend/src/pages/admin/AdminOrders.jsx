import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

export default function AdminOrders() {
  // Pulling orders from your global state. 
  // (Make sure to add an 'orders' array to your StoreContext later!)
  const { orders = [], updateOrderStatus } = useContext(StoreContext);

  // Calculate Dashboard Metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;
  const pendingDeliveries = orders?.filter(order => !order.isDelivered).length || 0;

  // Handler for marking an order as delivered
  const handleMarkDelivered = (orderId) => {
    if (window.confirm("Mark this order as delivered?")) {
      // This function should be added to your StoreContext to hit your PUT /api/orders/:id/deliver route
      if (updateOrderStatus) {
        updateOrderStatus(orderId);
      } else {
        alert("Please add the updateOrderStatus function to your StoreContext!");
      }
    }
  };

  return (
    <div className="relative space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
      </div>

      {/* Metric Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending Deliveries</p>
          <p className="text-2xl font-bold text-orange-600">{pendingDeliveries}</p>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Order ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Total</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Paid Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Delivery</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                    
                    {/* Order ID (Truncated for clean UI) */}
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      ...{order._id.substring(order._id.length - 6)}
                    </td>
                    
                    {/* Customer Name */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.user?.name || 'Guest User'}
                    </td>
                    
                    {/* Date Formatting */}
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    
                    {/* Total Price */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${order.totalPrice?.toFixed(2)}
                    </td>
                    
                    {/* Paid Status Badge */}
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Paid: {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Not Paid
                        </span>
                      )}
                    </td>
                    
                    {/* Delivery Status Badge */}
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Delivered
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline mr-4 transition">
                        Details
                      </button>
                      {!order.isDelivered && (
                        <button 
                          onClick={() => handleMarkDelivered(order._id)} 
                          className="text-green-600 hover:text-green-800 font-medium hover:underline transition"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No orders found. When customers check out, they will appear here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}