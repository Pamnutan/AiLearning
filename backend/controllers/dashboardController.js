const { poolPromise, sql } = require("../config/db");

// ============================================
// Dashboard Statistics Function
// ============================================
async function getStats(req, res) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Users) AS totalUsers,
        (SELECT COUNT(*) FROM Products) AS totalProducts,
        (SELECT COUNT(*) FROM Orders) AS totalOrders,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM Orders WHERE Status = 'Completed') AS totalRevenue
    `);

    const stats = result.recordset[0];

    res.json({
      totalUsers: stats.totalUsers,
      totalProducts: stats.totalProducts,
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard statistics"
    });
  }
}

// ============================================
// Recent Orders Function
// ============================================
async function getRecentOrders(req, res) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 5
        Orders.Id,
        Orders.UserId,
        Users.Name AS UserName,
        Orders.TotalAmount,
        Orders.Status,
        Orders.CreatedAt
      FROM Orders
      INNER JOIN Users ON Orders.UserId = Users.Id
      ORDER BY Orders.CreatedAt DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({
      message: "Failed to fetch recent orders"
    });
  }
}

// 💡 Export them as an object containing the functions
module.exports = {
  getStats,
  getRecentOrders
};



// const {
//   poolPromise
// } = require("../config/db");

// async function getStats(req, res) {

//   try {

//     const pool =
//       await poolPromise;

//     const result =
//       await pool
//         .request()
//         .query(`
//           SELECT

//             (
//               SELECT COUNT(*)
//               FROM Users
//             ) AS TotalUsers,

//             (
//               SELECT COUNT(*)
//               FROM Products
//             ) AS TotalProducts,

//             (
//               SELECT COUNT(*)
//               FROM Orders
//             ) AS TotalOrders,

//             (
//               SELECT
//                 ISNULL(
//                   SUM(TotalAmount),
//                   0
//                 )
//               FROM Orders
//             ) AS TotalRevenue
//         `);

//     res.json(
//       result.recordset[0]
//     );

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message:
//         "Failed to fetch dashboard stats"
//     });
//   }
// }

// module.exports = {
//   getStats
// };
