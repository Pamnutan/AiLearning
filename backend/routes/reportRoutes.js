const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

router.get('/vendor-sales', protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'vendor') return res.status(403).json({ message: 'Vendor only' });
    const { period, from, to } = req.query;
    const vendorId = user.userId || user.id;
    const pool = await poolPromise;
    let dateFilter = '';
    if (period === 'daily') dateFilter = "AND CAST(o.CreatedAt AS DATE) = CAST(GETDATE() AS DATE)";
    else if (period === 'monthly') dateFilter = "AND MONTH(o.CreatedAt) = MONTH(GETDATE()) AND YEAR(o.CreatedAt) = YEAR(GETDATE())";
    else if (period === 'yearly') dateFilter = "AND YEAR(o.CreatedAt) = YEAR(GETDATE())";
    else if (from && to) dateFilter = `AND o.CreatedAt BETWEEN '${from}' AND '${to}'`;
    const result = await pool.request()
      .input('vendorId', sql.Int, vendorId)
      .query(`
        SELECT p.Name as ProductName, SUM(oi.Quantity) as TotalQty, SUM(oi.Quantity * oi.Price) as Revenue
        FROM OrderItems oi
        JOIN Products p ON oi.ProductId = p.ProductId
        JOIN Stores s ON oi.StoreId = s.StoreId
        JOIN Orders o ON oi.OrderId = o.Id
        WHERE s.VendorId = @vendorId ${dateFilter}
        GROUP BY p.Name
      `);
    res.json({ data: result.recordset });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
module.exports = router;
