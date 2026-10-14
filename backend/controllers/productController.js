const {
  sql,
  poolPromise
} = require("../config/db");

async function getProducts(req, res) {
  try {
    const pool = await poolPromise;
    const storeId = req.query.storeId ? Number(req.query.storeId) : null;
    const queryStr = storeId
      ? `SELECT p.ProductId, p.Name, p.Price, p.Category, p.Stock, p.CreatedAt, p.StoreId, s.StoreName, s.VendorId, u.Name as VendorName FROM Products p LEFT JOIN Stores s ON p.StoreId = s.StoreId LEFT JOIN Users u ON s.VendorId = u.Id WHERE p.StoreId = @storeId ORDER BY p.ProductId DESC`
      : `SELECT p.ProductId, p.Name, p.Price, p.Category, p.Stock, p.CreatedAt, p.StoreId, s.StoreName, s.VendorId, u.Name as VendorName FROM Products p LEFT JOIN Stores s ON p.StoreId = s.StoreId LEFT JOIN Users u ON s.VendorId = u.Id ORDER BY p.ProductId DESC`;
    const request = pool.request();
    if (storeId) request.input('storeId', sql.Int, storeId);
    const result = await request.query(queryStr);
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
}

async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          p.ProductId, 
          p.Name, 
          p.Price, 
          p.Category, 
          p.Stock, 
          p.CreatedAt, 
          s.StoreName 
        FROM Products p
        LEFT JOIN Stores s ON p.StoreId = s.StoreId
        WHERE p.ProductId = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  try {
    const {
      name,
      price,
      category,
      stock,
      storeId
    } = req.body;

    if (!name || price == null || !category) {
      return res.status(400).json({
        message: "Name, price and category are required"
      });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input("name", sql.NVarChar(150), name);
    request.input("price", sql.Decimal(10, 2), price);
    request.input("category", sql.NVarChar(100), category);
    request.input("stock", sql.Int, stock || 0);
    if (storeId) {
      request.input("storeId", sql.Int, storeId);
    }
    const query = storeId ? `
        INSERT INTO Products (Name, Price, Category, Stock, StoreId)
        OUTPUT INSERTED.*
        VALUES (@name, @price, @category, @stock, @storeId)
      ` : `
        INSERT INTO Products (Name, Price, Category, Stock)
        OUTPUT INSERTED.*
        VALUES (@name, @price, @category, @stock)
      `;

    const result = await request.query(query);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create product"
    });
  }
}

// NEW: Update product function (PUT)
async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, price, category, stock, storeId } = req.body;

    // Validate ID
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Validate body payload fields
    if (!name || price == null || !category || stock == null) {
      return res.status(400).json({
        message: "Name, price, category, and stock are all required for a full update"
      });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input("id", sql.Int, id);
    request.input("name", sql.NVarChar(150), name);
    request.input("price", sql.Decimal(10, 2), price);
    request.input("category", sql.NVarChar(100), category);
    request.input("stock", sql.Int, stock);
    if (storeId != null && storeId !== 0 && storeId !== "") {
      request.input("storeId", sql.Int, storeId);
    }
    const queryStr = (storeId != null && storeId !== 0 && storeId !== "") ? `
        UPDATE Products
        SET
          Name = @name,
          Price = @price,
          Category = @category,
          Stock = @stock,
          StoreId = @storeId
        OUTPUT INSERTED.*
        WHERE ProductId = @id
      ` : `
        UPDATE Products
        SET
          Name = @name,
          Price = @price,
          Category = @category,
          Stock = @stock
        OUTPUT INSERTED.*
        WHERE ProductId = @id
      `;
    const result = await request.query(queryStr);

    // Check if the product existed
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the updated product object
    res.json(result.recordset[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update product"
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM Products
        WHERE ProductId = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete product"
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct, // Remember to export it!
  deleteProduct
};

// const {
//   sql,
//   poolPromise
// } = require("../config/db");

// async function getProducts(req, res) {

//   try {

//     const pool =
//       await poolPromise;

//     const result =
//       await pool
//         .request()
//         .query(`
//           SELECT
//             ProductId,
//             Name,
//             Price,
//             Category,
//             Stock,
//             CreatedAt
//           FROM Products
//           ORDER BY ProductId DESC
//         `);

//     res.json(result.recordset);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Failed to fetch products"
//     });
//   }
// }

// async function createProduct(req, res) {

//   try {

//     const {
//       name,
//       price,
//       category,
//       stock
//     } = req.body;

//     if (!name || price == null || !category) {

//       return res.status(400).json({
//         message:
//           "Name, price and category are required"
//       });
//     }

//     const pool =
//       await poolPromise;

//     const result =
//       await pool
//         .request()

//         .input(
//           "name",
//           sql.NVarChar(150),
//           name
//         )

//         .input(
//           "price",
//           sql.Decimal(10, 2),
//           price
//         )

//         .input(
//           "category",
//           sql.NVarChar(100),
//           category
//         )

//         .input(
//           "stock",
//           sql.Int,
//           stock || 0
//         )

//         .query(`
//           INSERT INTO Products
//           (
//             Name,
//             Price,
//             Category,
//             Stock
//           )

//           OUTPUT INSERTED.*

//           VALUES
//           (
//             @name,
//             @price,
//             @category,
//             @stock
//           )
//         `);

//     res.status(201).json(
//       result.recordset[0]
//     );

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message:
//         "Failed to create product"
//     });
//   }
// }

// async function deleteProduct(req, res) {

//   try {

//     const id =
//       Number(req.params.id);

//     if (!Number.isInteger(id)) {

//       return res.status(400).json({
//         message: "Invalid product ID"
//       });
//     }

//     const pool =
//       await poolPromise;

//     const result =
//       await pool
//         .request()
//         .input(
//           "id",
//           sql.Int,
//           id
//         )
//         .query(`
//           DELETE FROM Products
//           WHERE ProductId = @id
//         `);

//     if (result.rowsAffected[0] === 0) {

//       return res.status(404).json({
//         message: "Product not found"
//       });
//     }

//     res.json({
//       message:
//         "Product deleted successfully"
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message:
//         "Failed to delete product"
//     });
//   }
// }

// module.exports = {
//   getProducts,
//   createProduct,
//   deleteProduct
// };
