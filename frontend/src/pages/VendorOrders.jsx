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

  const [selectedStatus, setSelectedStatus] = useState({});

  const updateStatus = async (orderItemId, newStatus) => {
    try {
      await orderService.updateOrderItemStatus(orderItemId, newStatus);
      alert('Status updated!');
      const res = await orderService.getVendorOrders();
      setOrders(res.data);
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
              <th className="p-4 font-semibold text-gray-600">Customer</th>
              <th className="p-4 font-semibold text-gray-600">Product</th>
              <th className="p-4 font-semibold text-gray-600">Qty</th>
              <th className="p-4 font-semibold text-gray-600">Item Status</th>
              <th className="p-4 font-semibold text-gray-600">Order Status</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.Id}>
                {(order.Items || []).map((item, idx) => (
                  <tr key={item.Id || (order.Id + '-' + idx)} className="border-b hover:bg-gray-50">
                    {idx === 0 ? (
                      <>
                        <td className="p-4 align-top font-medium" rowSpan={(order.Items || []).length}>#{order.Id}</td>
                        <td className="p-4 align-top" rowSpan={(order.Items || []).length}>{order.UserId}</td>
                      </>
                    ) : null}
                    <td className="p-4">{item.ProductName || order.Products}</td>
                    <td className="p-4">{item.Quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.Status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        item.Status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.Status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                        order.Status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.Status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.Status}
                      </span>
                    </td>
                    <td className="p-4 align-top flex gap-2">
                      <select
                        value={selectedStatus[item.Id] || ''}
                        onChange={(e) => setSelectedStatus({ ...selectedStatus, [item.Id]: e.target.value })}
                        className="p-1 border rounded text-sm bg-white"
                      >
                        <option value="">Select Status</option>
                        <option value="Order Accepted">Order Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => {
                          if (selectedStatus[item.Id]) updateStatus(item.Id, selectedStatus[item.Id]);
                        }}
                        disabled={!selectedStatus[item.Id]}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 italic">No orders found for your store.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorOrders;
