const { sql, poolPromise } = require('../config/db');

async function getWishlist(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT w.*, p.Name, p.Price, p.Category 
        FROM WishlistItems w
        JOIN Products p ON w.ProductId = p.ProductId
        WHERE w.UserId = @userId
      `);
      
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
}

async function addToWishlist(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`
        INSERT INTO WishlistItems (UserId, ProductId)
        OUTPUT INSERTED.*
        VALUES (@userId, @productId)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('DELETE FROM WishlistItems WHERE WishlistItemId = @id AND UserId = @userId');

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
