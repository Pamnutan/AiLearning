const { sql, poolPromise } = require('../config/db');

async function createStore(req, res) {
  try {
    const { storeName, description, logo } = req.body;
    const vendorId = req.body.vendorId ? Number(req.body.vendorId) : (req.user.userId || req.user.id);

    if (!storeName) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    const pool = await poolPromise;
    
    // Check if vendor already has a store
    const existingStore = await pool.request()
      .input('vendorId', sql.Int, vendorId)
      .query('SELECT StoreId FROM Stores WHERE VendorId = @vendorId');

    if (existingStore.recordset.length > 0) {
      return res.status(409).json({ message: 'Vendor already has a store' });
    }

    const result = await pool.request()
      .input('vendorId', sql.Int, vendorId)
      .input('storeName', sql.NVarChar(150), storeName)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('logo', sql.NVarChar(255), logo)
      .query(`
        INSERT INTO Stores (VendorId, StoreName, Description, Logo)
        OUTPUT INSERTED.*
        VALUES (@vendorId, @storeName, @description, @logo)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create store' });
  }
}

async function getStore(req, res) {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Stores WHERE StoreId = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch store' });
  }
}

async function getAllStores(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Stores');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
}

async function updateStore(req, res) {
  try {
    const { id } = req.params;
    const { storeName, description, logo } = req.body;
    const vendorId = req.user.userId || req.user.id;

    const pool = await poolPromise;
    
    // Verify store ownership
    const storeCheck = await pool.request()
      .input('id', sql.Int, id)
      .input('vendorId', sql.Int, vendorId)
      .query('SELECT StoreId FROM Stores WHERE StoreId = @id AND VendorId = @vendorId');

    if (storeCheck.recordset.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to update this store' });
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('storeName', sql.NVarChar(150), storeName)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('logo', sql.NVarChar(255), logo)
      .query(`
        UPDATE Stores 
        SET StoreName = COALESCE(@storeName, StoreName), 
            Description = COALESCE(@description, Description), 
            Logo = COALESCE(@logo, Logo)
        OUTPUT INSERTED.*
        WHERE StoreId = @id
      `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update store' });
  }
}

module.exports = {
  createStore,
  getStore,
  getAllStores,
  updateStore
};
