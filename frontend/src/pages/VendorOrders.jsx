import React, { useEffect, useState } from 'react';
import { orderService } from '../services/api';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getVendorOrders();
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderItemId, newStatus) => {
    try {
      await orderService.updateOrderItemStatus(orderItemId, newStatus);
      alert('Status updated!');
      // In a real app, we'd refetch or update local state
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-6">Loading Orders...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Orders</h1>
      <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Order ID</th>
              <th className="p-4 font-semibold text-gray-600">Customer ID</th>
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.Id} className="border-b hover:bg-gray-50">
                <td className="p-4">#{order.Id}</td>
                <td className="p-4">{order.UserId}</td>
                <td className="p-4">{new Date(order.CreatedAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                    {order.Status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    onChange={(e) => updateStatus(order.Id, e.target.value)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="">Update Status</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No orders found for your store.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorOrders;
