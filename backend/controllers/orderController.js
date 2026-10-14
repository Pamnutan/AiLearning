const { sql, poolPromise } = require('../config/db');

async function createOrder(req, res) {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    const customerId = req.user.userId;

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
          INSERT INTO Orders (UserId, TotalAmount, Status)
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
            INSERT INTO OrderItems (OrderId, ProductId, StoreId, Quantity, Price, Status)
            VALUES (@orderId, @productId, @storeId, @quantity, @unitPrice, 'Pending')
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

async function getOrders(req, res) {
  try {
    const user = req.user;
    const pool = await poolPromise;

    if (user.role === 'admin') {
      const result = await pool.request().query(`
        SELECT o.Id, o.UserId, o.TotalAmount, o.Status, o.CreatedAt,
               (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount
        FROM Orders o
        ORDER BY o.CreatedAt DESC
      `);
      return res.json(result.recordset);
    }

    if (user.role === 'vendor') {
      return getVendorOrders(req, res);
    }

    // User / customer: their own orders
    const customerId = user.userId || user.id;
    const result = await pool.request()
      .input('customerId', sql.Int, customerId)
      .query(`
        SELECT o.Id, o.UserId, o.TotalAmount, o.Status, o.CreatedAt,
               (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount
        FROM Orders o
        WHERE o.UserId = @customerId
        ORDER BY o.CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}

async function getMyOrders(req, res) {
  try {
    const customerId = req.user.userId;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('customerId', sql.Int, customerId)
      .query(`
        SELECT o.Id, o.TotalAmount, o.Status, o.CreatedAt,
               (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount
        FROM Orders o
        WHERE o.UserId = @customerId
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
    const vendorId = req.user.userId;
    const pool = await poolPromise;
    
    // Get orders that contain items from the vendor's store, with vendor-specific items and status
    const result = await pool.request()
      .input('vendorId', sql.Int, vendorId)
      .query(`
        SELECT DISTINCT o.Id, o.UserId, o.CreatedAt, o.Status, o.TotalAmount
        FROM Orders o
        JOIN OrderItems oi ON o.Id = oi.OrderId
        JOIN Stores s ON oi.StoreId = s.StoreId
        WHERE s.VendorId = @vendorId
        ORDER BY o.CreatedAt DESC
      `);

    const orders = result.recordset;
    // Enrich each order with vendor-specific order items (including status and item id)
    for (const order of orders) {
      const itemsRes = await pool.request()
        .input('orderId', sql.Int, order.Id)
        .input('vendorId', sql.Int, vendorId)
        .query(`
          SELECT oi.Id, oi.Quantity, oi.Price, oi.Status, p.Name as ProductName, p.ProductId
          FROM OrderItems oi
          JOIN Products p ON oi.ProductId = p.ProductId
          JOIN Stores s ON oi.StoreId = s.StoreId
          WHERE oi.OrderId = @orderId AND s.VendorId = @vendorId
        `);
      order.Items = itemsRes.recordset;
      const productsText = itemsRes.recordset.map(i => i.ProductName + ' (x' + i.Quantity + ')').join(', ');
      order.Products = productsText || '';
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch vendor orders' });
  }
}

async function updateOrderItemStatus(req, res) {
  try {
    const { orderItemId } = req.params;
    const { status } = req.body;
    const vendorId = req.user.userId;

    const pool = await poolPromise;

    // Verify ownership of the store associated with this order item
    const check = await pool.request()
      .input('itemId', sql.Int, orderItemId)
      .input('vendorId', sql.Int, vendorId)
      .query(`
        SELECT oi.Id 
        FROM OrderItems oi
        JOIN Stores s ON oi.StoreId = s.StoreId
        WHERE oi.Id = @itemId AND s.VendorId = @vendorId
      `);

    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to update this item' });
    }

    // Update the item status
    await pool.request()
      .input('itemId', sql.Int, orderItemId)
      .input('status', sql.NVarChar(50), status)
      .query(`
        UPDATE OrderItems
        SET Status = @status
        WHERE Id = @itemId
      `);

    // Check if all items in the order are completed, then update main order status
    const orderIdResult = await pool.request()
      .input('itemId', sql.Int, orderItemId)
      .query(`SELECT OrderId FROM OrderItems WHERE Id = @itemId`);
    const orderId = orderIdResult.recordset[0]?.OrderId;

    if (orderId) {
      const itemsStatus = await pool.request()
        .input('orderId', sql.Int, orderId)
        .query(`SELECT Status FROM OrderItems WHERE OrderId = @orderId`);
      const allStatuses = itemsStatus.recordset.map(r => r.Status);
      const allCompleted = allStatuses.length > 0 && allStatuses.every(s => s === 'Completed');
      const anyPending = allStatuses.some(s => s === 'Pending');

      let mainStatus = 'Processing';
      if (allCompleted) mainStatus = 'Completed';
      else if (anyPending) mainStatus = 'Pending';

      await pool.request()
        .input('orderId', sql.Int, orderId)
        .input('mainStatus', sql.NVarChar(50), mainStatus)
        .query(`UPDATE Orders SET Status = @mainStatus WHERE Id = @orderId`);
    }

    res.json({ message: 'Order item status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update status' });
  }
}

async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const pool = await poolPromise;

    // For admin: return any order. For vendor/user: restrict access
    let queryStr = `
      SELECT o.Id, o.UserId, o.TotalAmount, o.Status, o.CreatedAt,
             u.Name as UserName, u.Email,
             (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount
      FROM Orders o
      LEFT JOIN Users u ON o.UserId = u.Id
      WHERE o.Id = @id
    `;

    // Get order items separately
        const itemsQuery = `
          SELECT oi.Id, p.Name as ProductName, s.StoreName as StoreName, u.Name as VendorName, oi.Quantity, oi.Price, oi.Status,
                 (oi.Quantity * oi.Price) as Subtotal
          FROM OrderItems oi
          JOIN Products p ON oi.ProductId = p.ProductId
          JOIN Stores s ON oi.StoreId = s.StoreId
          LEFT JOIN Users u ON s.VendorId = u.Id
          WHERE oi.OrderId = @id
        `;

    if (user.role !== 'admin') {
      // Vendor: only orders for vendor's store; User: only their own orders
      if (user.role === 'vendor') {
        queryStr = `
          SELECT DISTINCT o.Id, o.UserId, o.TotalAmount, o.Status, o.CreatedAt,
                 u.Name as UserName, u.Email,
                 (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.Id) as ItemCount
          FROM Orders o
          JOIN OrderItems oi ON o.Id = oi.OrderId
          JOIN Stores s ON oi.StoreId = s.StoreId
          LEFT JOIN Users u ON o.UserId = u.Id
          WHERE o.Id = @id AND s.VendorId = @vendorId
        `;
        const result = await pool.request()
          .input('id', sql.Int, id)
          .input('vendorId', sql.Int, user.userId || user.id)
          .query(queryStr);
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        const itemsResult = await pool.request()
          .input('id', sql.Int, id)
          .query(itemsQuery);
        
        return res.json({ order: result.recordset[0], items: itemsResult.recordset });
      } else {
        queryStr += ' AND o.UserId = @userId';
        const result = await pool.request()
          .input('id', sql.Int, id)
          .input('userId', sql.Int, user.userId || user.id)
          .query(queryStr);
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Order not found' });

        const itemsResult = await pool.request()
          .input('id', sql.Int, id)
          .query(itemsQuery);

        return res.json({ order: result.recordset[0], items: itemsResult.recordset });
      }
    }

    const result = await pool.request().input('id', sql.Int, id).query(queryStr);
    if (result.recordset.length === 0) return res.status(404).json({ message: 'Order not found' });

    const itemsResult = await pool.request()
      .input('id', sql.Int, id)
      .query(itemsQuery);

    res.json({ order: result.recordset[0], items: itemsResult.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getVendorOrders,
  updateOrderItemStatus,
  getOrder
};
