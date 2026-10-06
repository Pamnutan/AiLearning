const express = require("express");

const router = express.Router();

const {
  sql,
  poolPromise
} = require("../config/db");



// ============================================
// GET ALL ORDERS
// ============================================

router.get("/", async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        o.Id,
        o.UserId,
        u.Name AS UserName,
        u.Email,
        o.TotalAmount,
        o.Status,
        o.CreatedAt,

        COUNT(oi.Id) AS ItemCount

      FROM Orders o

      INNER JOIN Users u
        ON o.UserId = u.Id

      LEFT JOIN OrderItems oi
        ON o.Id = oi.OrderId

      GROUP BY
        o.Id,
        o.UserId,
        u.Name,
        u.Email,
        o.TotalAmount,
        o.Status,
        o.CreatedAt

      ORDER BY
        o.Id DESC
    `);

    res.json(result.recordset);

  } catch (error) {

    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch orders"
    });

  }

});


// ============================================
// GET SINGLE ORDER
// ============================================

router.get("/:id", async (req, res) => {

  try {

    const pool = await poolPromise;

    // ----------------------------------------
    // ORDER
    // ----------------------------------------

    const orderResult =
      await pool
        .request()
        .input(
          "OrderId",
          req.params.id
        )
        .query(`
          SELECT
            o.Id,
            o.UserId,
            u.Name AS UserName,
            u.Email,
            o.TotalAmount,
            o.Status,
            o.CreatedAt

          FROM Orders o

          INNER JOIN Users u
            ON o.UserId = u.Id

          WHERE o.Id = @OrderId
        `);


    if (
      orderResult.recordset.length === 0
    ) {

      return res.status(404).json({
        message: "Order not found"
      });

    }


    // ----------------------------------------
    // ORDER ITEMS
    // ----------------------------------------

    const itemsResult =
      await pool
        .request()
        .input(
          "OrderId",
          req.params.id
        )
        .query(`
          SELECT
            oi.Id,
            oi.OrderId,
            oi.ProductId,
            p.Name AS ProductName,
            oi.Quantity,
            oi.Price,
            (oi.Quantity * oi.Price)
              AS Subtotal

          FROM OrderItems oi

          INNER JOIN Products p
            ON oi.ProductId = p.ProductId

          WHERE oi.OrderId = @OrderId

          ORDER BY oi.Id
        `);


    res.json({
      order:
        orderResult.recordset[0],

      items:
        itemsResult.recordset
    });

  } catch (error) {

    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch order"
    });

  }

});


// ============================================
// CREATE ORDER
// ============================================

router.post("/", async (req, res) => {

  // const transaction =
  //   new (require("mssql").Transaction)(
  //     await poolPromise
  //   );
const pool = await poolPromise;

const transaction =
  new sql.Transaction(pool);

  try {

    const {
      userId,
      items,
      status
    } = req.body;


    if (
      !userId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {

      return res.status(400).json({
        message:
          "User and at least one item are required"
      });

    }


    //const pool = await poolPromise;

    // ----------------------------------------
    // CHECK USER
    // ----------------------------------------

    const userResult =
      await pool
        .request()
        .input(
          "UserId",
          userId
        )
        .query(`
          SELECT Id
          FROM Users
          WHERE Id = @UserId
        `);


    if (
      userResult.recordset.length === 0
    ) {

      return res.status(404).json({
        message: "User not found"
      });

    }


    // ----------------------------------------
    // CALCULATE TOTAL
    // ----------------------------------------

    let totalAmount = 0;


    for (const item of items) {

      if (
        !item.productId ||
        !item.quantity ||
        item.quantity <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid product or quantity"
        });

      }


      const productResult =
        await pool
          .request()
          .input(
            "ProductId",
            item.productId
          )
          .query(`
            SELECT
              ProductId,
              Price,
              Stock

            FROM Products

            WHERE ProductId = @ProductId
          `);


      if (
        productResult.recordset.length === 0
      ) {

        return res.status(404).json({
          message:
            `Product ${item.productId} not found`
        });

      }


      const product =
        productResult.recordset[0];


      if (
        product.Stock < item.quantity
      ) {

        return res.status(400).json({
          message:
            `Insufficient stock for product ${item.productId}`
        });

      }


      totalAmount +=
        Number(product.Price) *
        Number(item.quantity);

    }


    // ----------------------------------------
    // TRANSACTION
    // ----------------------------------------

    await transaction.begin();


    // ----------------------------------------
    // CREATE ORDER
    // ----------------------------------------

    const orderResult =
      await transaction
        .request()
        .input(
          "UserId",
          userId
        )
        .input(
          "TotalAmount",
          totalAmount
        )
        .input(
          "Status",
          status || "Pending"
        )
        .query(`
          INSERT INTO Orders
          (
            UserId,
            TotalAmount,
            Status
          )

          OUTPUT
            INSERTED.Id,
            INSERTED.UserId,
            INSERTED.TotalAmount,
            INSERTED.Status,
            INSERTED.CreatedAt

          VALUES
          (
            @UserId,
            @TotalAmount,
            @Status
          )
        `);


    const order =
      orderResult.recordset[0];


    // ----------------------------------------
    // CREATE ORDER ITEMS
    // ----------------------------------------

    for (const item of items) {

      const productResult =
        await transaction
          .request()
          .input(
            "ProductId",
            item.productId
          )
          .query(`
            SELECT
              ProductId,
              Price,
              Stock

            FROM Products

            WHERE ProductId = @ProductId
          `);


      const product =
        productResult.recordset[0];


      await transaction
        .request()
        .input(
          "OrderId",
          order.Id
        )
        .input(
          "ProductId",
          item.productId
        )
        .input(
          "Quantity",
          item.quantity
        )
        .input(
          "Price",
          product.Price
        )
        .query(`
          INSERT INTO OrderItems
          (
            OrderId,
            ProductId,
            Quantity,
            Price
          )

          VALUES
          (
            @OrderId,
            @ProductId,
            @Quantity,
            @Price
          )
        `);


      // --------------------------------------
      // REDUCE STOCK
      // --------------------------------------

      await transaction
        .request()
        .input(
          "ProductId",
          item.productId
        )
        .input(
          "Quantity",
          item.quantity
        )
        .query(`
          UPDATE Products

          SET Stock =
            Stock - @Quantity

          WHERE ProductId = @ProductId
        `);

    }


    await transaction.commit();


    res.status(201).json({
      message:
        "Order created successfully",

      order
    });


  } catch (error) {

    try {
      await transaction.rollback();
    } catch (_) {
      // transaction may not have started
    }


    console.error(
      "Create order error:",
      error
    );


    res.status(500).json({
      message:
        "Failed to create order"
    });

  }

});


// ============================================
// UPDATE ORDER STATUS
// ============================================

router.put("/:id/status", async (req, res) => {

  try {

    const {
      status
    } = req.body;


    const allowedStatuses = [
      "Pending",
      "Processing",
      "Completed",
      "Cancelled"
    ];


    if (
      !allowedStatuses.includes(status)
    ) {

      return res.status(400).json({
        message:
          "Invalid order status"
      });

    }


    const pool = await poolPromise;

    const result =
      await pool
        .request()
        .input(
          "Id",
          req.params.id
        )
        .input(
          "Status",
          status
        )
        .query(`
          UPDATE Orders

          SET Status = @Status

          OUTPUT
            INSERTED.Id,
            INSERTED.UserId,
            INSERTED.TotalAmount,
            INSERTED.Status,
            INSERTED.CreatedAt

          WHERE Id = @Id
        `);


    if (
      result.recordset.length === 0
    ) {

      return res.status(404).json({
        message:
          "Order not found"
      });

    }


    res.json({
      message:
        "Order status updated",

      order:
        result.recordset[0]
    });

  } catch (error) {

    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update order"
    });

  }

});


module.exports = router;
