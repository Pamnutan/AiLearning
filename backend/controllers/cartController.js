const { sql, poolPromise } = require('../config/db');

async function getCart(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT c.*, p.Name, p.Price, p.Category 
        FROM CartItems c
        JOIN Products p ON c.ProductId = p.ProductId
        WHERE c.UserId = @userId
      `);
      
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
}

async function addToCart(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const pool = await poolPromise;

    // Check if item already in cart
    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query('SELECT CartItemId, Quantity FROM CartItems WHERE UserId = @userId AND ProductId = @productId');

    if (existing.recordset.length > 0) {
      const cartItemId = existing.recordset[0].CartItemId;
      const newQuantity = existing.recordset[0].Quantity + quantity;
      
      await pool.request()
        .input('id', sql.Int, cartItemId)
        .input('qty', sql.Int, newQuantity)
        .query('UPDATE CartItems SET Quantity = @qty WHERE CartItemId = @id');
        
      return res.json({ message: 'Cart updated', quantity: newQuantity });
    }

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .input('quantity', sql.Int, quantity)
      .query(`
        INSERT INTO CartItems (UserId, ProductId, Quantity)
        OUTPUT INSERTED.*
        VALUES (@userId, @productId, @quantity)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
}

async function removeFromCart(req, res) {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM CartItems WHERE CartItemId = @id');
      
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
}

async function clearCart(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const pool = await poolPromise;
    
    await pool.request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM CartItems WHERE UserId = @userId');
      
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
