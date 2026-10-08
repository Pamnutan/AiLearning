import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
} from "lucide-react";

import StatCard from "../components/StatCard";
import api from "../services/api";

function Dashboard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (userRole === 'user') { navigate('/orders', { replace: true }); }
  }, [userRole, navigate]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    fetchDashboardData();

  }, []);


  async function fetchDashboardData() {

    try {

      setLoading(true);
      setError("");

      const [
        statsResponse,
        ordersResponse,
      ] = await Promise.all([

        api.get(
          "/dashboard/stats"
        ),

        api.get(
          "/dashboard/recent-orders"
        ),

      ]);
      setStats(
        statsResponse.data
      );

      setRecentOrders(
        ordersResponse.data
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

      setError(
        "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }

  }


  function formatCurrency(amount) {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount || 0);

  }


  function formatDate(date) {

    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

  }


  if (loading) {

    return (
      <div className="loading-page">
        Loading dashboard...
      </div>
    );

  }


  if (error) {

    return (
      <div>

        <div className="page-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back, Admin User
            </p>
          </div>

        </div>

        <div className="error-message">
          {error}
        </div>

      </div>
    );

  }


  return (
    <div>

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="page-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back, Admin User
          </p>

        </div>

        {/* <button className="primary-button">
          + Add Product
        </button> */}

      </div>


      {/* =========================
          STAT CARDS
      ========================== */}

      <div className="stats-grid">

        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={
            <Users size={24} />
          }
          color="#6366f1"
          description="Registered users"
        />


        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={
            <Package size={24} />
          }
          color="#10b981"
          description="Products in inventory"
        />


        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={
            <ShoppingCart size={24} />
          }
          color="#f59e0b"
          description="Orders received"
        />


        <StatCard
          title="Total Revenue"
          value={
            formatCurrency(
              stats.totalRevenue
            )
          }
          icon={
            <IndianRupee size={24} />
          }
          color="#ef4444"
          description="Completed order revenue"
        />

      </div>


      {/* =========================
          RECENT ORDERS
      ========================== */}

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                Recent Orders
              </h2>

              <p>
                Latest customer orders
              </p>

            </div>

            <button className="text-button">
              View All
            </button>

          </div>


          <div className="table-wrapper">

            {recentOrders.length === 0 ? (

              <div className="empty-state">

                <ShoppingCart
                  size={40}
                />

                <h3>
                  No orders found
                </h3>

                <p>
                  There are no orders yet.
                </p>

              </div>

            ) : (

              <table>

                <thead>

                  <tr>

                    <th>
                      Order ID
                    </th>

                    <th>
                      User
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentOrders.map(
                    (order) => (

                      <tr
                        key={order.Id}
                      >

                        <td>
                          #{order.Id}
                        </td>

                        <td>
                          {order.UserName}
                        </td>

                        <td>
                          {formatCurrency(
                            order.TotalAmount
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              `status ${
                                order.Status
                                  ?.toLowerCase()
                              }`
                            }
                          >
                            {order.Status}
                          </span>

                        </td>

                        <td>
                          {formatDate(
                            order.CreatedAt
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;



// import {
//   Users,
//   Package,
//   ShoppingCart,
//   IndianRupee,
// } from "lucide-react";

// import StatCard from "../components/StatCard";

// function Dashboard() {
  // function Dashboard() {
//     <div>

//       <div className="page-header">

//         <div>
//           <h1>Dashboard</h1>

//           <p>
//             Welcome back, Admin User
//           </p>
//         </div>

//         <button className="primary-button">
//           + Add Product
//         </button>

//       </div>

//       <div className="stats-grid">

//         <StatCard
//           title="Total Users"
//           value="3"
//           icon={<Users size={24} />}
//           color="#6366f1"
//           description="Registered users"
//         />

//         <StatCard
//           title="Total Products"
//           value="5"
//           icon={<Package size={24} />}
//           color="#10b981"
//           description="Products in inventory"
//         />

//         <StatCard
//           title="Total Orders"
//           value="4"
//           icon={<ShoppingCart size={24} />}
//           color="#f59e0b"
//           description="Orders received"
//         />

//         <StatCard
//           title="Total Revenue"
//           value="₹96,700"
//           icon={<IndianRupee size={24} />}
//           color="#ef4444"
//           description="Completed order revenue"
//         />

//       </div>

//       <div className="dashboard-grid">

//         <div className="dashboard-card">

//           <div className="card-header">
//             <div>
//               <h2>Recent Orders</h2>
//               <p>Latest customer orders</p>
//             </div>

//             <button className="text-button">
//               View All
//             </button>
//           </div>

//           <div className="table-wrapper">

//             <table>

//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>User</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>

//               <tbody>

//                 <tr>
//                   <td>#4</td>
//                   <td>Rahul</td>
//                   <td>₹18,000</td>
//                   <td>
//                     <span className="status completed">
//                       Completed
//                     </span>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td>#3</td>
//                   <td>Amit</td>
//                   <td>₹1,200</td>
//                   <td>
//                     <span className="status pending">
//                       Pending
//                     </span>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td>#2</td>
//                   <td>Rahul</td>
//                   <td>₹2,500</td>
//                   <td>
//                     <span className="status completed">
//                       Completed
//                     </span>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td>#1</td>
//                   <td>Admin User</td>
//                   <td>₹75,000</td>
//                   <td>
//                     <span className="status completed">
//                       Completed
//                     </span>
//                   </td>
//                 </tr>

//               </tbody>

//             </table>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Dashboard;



// import {
//   useEffect,
//   useState
// } from "react";

// import api from "../services/api";

// import StatCard
//   from "../components/StatCard";

// function Dashboard() {
  // function Dashboard() {
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   useEffect(() => {

//     async function loadStats() {

//       try {

//         const response =
//           await api.get(
//             "/dashboard/stats"
//           );

//         setStats(response.data);

//       } catch (error) {

//         setError(
//           "Unable to load dashboard"
//         );

//       } finally {

//         setLoading(false);
//       }
//     }

//     loadStats();

//   }, []);

//   if (loading) {
//     return <p>Loading dashboard...</p>;
//   }

//   if (error) {
//     return <p>{error}</p>;
//   }

//   return (
//     <div>

//       <h1>
//         Dashboard
//       </h1>

//       <div className="stats-grid">

//         <StatCard
//           title="Total Users"
//           value={stats.TotalUsers}
//         />

//         <StatCard
//           title="Products"
//           value={stats.TotalProducts}
//         />

//         <StatCard
//           title="Orders"
//           value={stats.TotalOrders}
//         />

//         <StatCard
//           title="Revenue"
//           value={`₹${stats.TotalRevenue}`}
//         />

//       </div>

//     </div>
//   );
// }

// export default Dashboard;
