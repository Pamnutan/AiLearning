const { sql, poolPromise } = require('../config/db');

async function createOrder(req, res) {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    const customerId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      let totalAmount = 0;
      const orderItemsData = [];

      // 1. Validate items and calculate total
      for (const item of items) {
        const productResult = await transaction.request()
          .input('productId', sql.Int, item.productId)
          .query('SELECT ProductId, Price, Stock, StoreId FROM Products WHERE ProductId = @productId');

        if (productResult.recordset.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const product = productResult.recordset[0];
        if (product.Stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.ProductId}`);
        }

        const itemTotal = product.Price * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: product.ProductId,
          storeId: product.StoreId,
          quantity: item.quantity,
          unitPrice: product.Price
        });

        // 2. Deduct stock
        await transaction.request()
          .input('productId', sql.Int, item.productId)
          .input('quantity', sql.Int, item.quantity)
          .query('UPDATE Products SET Stock = Stock - @quantity WHERE ProductId = @productId');
      }

      // 3. Create Order
      const orderResult = await transaction.request()
        .input('customerId', sql.Int, customerId)
        .input('totalAmount', sql.Decimal(18, 2), totalAmount)
        .query(`
          INSERT INTO Orders (CustomerId, TotalAmount, Status)
          OUTPUT INSERTED.Id
          VALUES (@customerId, @totalAmount, 'Pending')
        `);

      const orderId = orderResult.recordset[0].Id;

      // 4. Create Order Items
      for (const item of orderItemsData) {
        await transaction.request()
          .input('orderId', sql.Int, orderId)
          .input('productId', sql.Int, item.productId)
          .input('storeId', sql.Int, item.storeId)
          .input('quantity', sql.Int, item.quantity)
          .input('unitPrice', sql.Decimal(18, 2), item.unitPrice)
          .query(`
            INSERT INTO OrderItems (OrderId, ProductId, StoreId, Quantity, UnitPrice)
            VALUES (@orderId, @productId, @storeId, @quantity, @unitPrice)
          `);
      }

      await transaction.commit();
      res.status(201).json({ message: 'Order created successfully', orderId, totalAmount });

    } catch (err) {
      await transaction.rollback();
      res.status(400).json({ message: err.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error during checkout' });
  }
}

async function getMyOrders(req, res) {
  try {
    const customerId = req.user.id;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('customerId', sql.Int, customerId)
      .query(`
        SELECT o.Id, o.TotalAmount, o.Status, o.CreatedAt,
               (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount
        FROM Orders o
        WHERE o.CustomerId = @customerId
        ORDER BY o.CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

async function getVendorOrders(req, res) {
  try {
    const vendorId = req.user.id;
    const pool = await poolPromise;
    
    // Get orders that contain items from the vendor's store
    const result = await pool.request()
      .input('vendorId', sql.Int, vendorId)
      .query(`
        SELECT DISTINCT o.Id, o.CustomerId, o.CreatedAt, o.Status
        FROM Orders o
        JOIN OrderItems oi ON o.Id = oi.OrderId
        JOIN Stores s ON oi.StoreId = s.StoreId
        WHERE s.VendorId = @vendorId
        ORDER BY o.CreatedAt DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch vendor orders' });
  }
}

async function updateOrderItemStatus(req, res) {
  try {
    const { orderItemId } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;

    const pool = await poolPromise;

    // Verify ownership of the store associated with this order item
    const check = await pool.request()
      .input('itemId', sql.Int, orderItemId)
      .input('vendorId', sql.Int, vendorId)
      .query(`
        SELECT oi.OrderItemId 
        FROM OrderItems oi
        JOIN Stores s ON oi.StoreId = s.StoreId
        WHERE oi.OrderItemId = @itemId AND s.VendorId = @vendorId
      `);

    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to update this item' });
    }

    // Update the status in Orders (simplified: in a real app, status would be on OrderItems)
    // Since we created Status on Orders table, let's update that or assume we track per item.
    // For this marketplace, I'll treat 'Pending' as Global and 'Processed' as per-vendor.
    // Let's assume we want to update the main order status if all vendors processed it, 
    // but for now, I'll implement a simple Order update.
    
    await pool.request()
      .input('itemId', sql.Int, orderItemId)
      .input('status', sql.NVarChar(50), status)
      .query(`
        UPDATE Orders 
        SET Status = @status 
        WHERE Id = (SELECT OrderId FROM OrderItems WHERE OrderItemId = @itemId)
      `);

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update status' });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderItemStatus
};
