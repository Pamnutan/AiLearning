require("dotenv").config();
const { poolPromise, sql } = require('../config/db');

async function migrate() {
  try {
    const pool = await poolPromise;
    console.log('Starting marketplace migration...');

    // 1. Create Stores Table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Stores')
      BEGIN
        CREATE TABLE Stores (
          StoreId INT PRIMARY KEY IDENTITY(1,1),
          VendorId INT NOT NULL,
          StoreName NVARCHAR(150) NOT NULL,
          Description NVARCHAR(MAX),
          Logo NVARCHAR(255),
          CreatedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (VendorId) REFERENCES Users(Id)
        );
        PRINT 'Stores table created.';
      END
    `);

    // 2. Update Products Table to include StoreId
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'StoreId' AND object_id = OBJECT_ID('Products'))
      BEGIN
        ALTER TABLE Products ADD StoreId INT;
        ALTER TABLE Products ADD CONSTRAINT FK_Product_Store FOREIGN KEY (StoreId) REFERENCES Stores(StoreId);
        PRINT 'StoreId added to Products table.';
      END
    `);

    // 3. Create Orders Table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
      BEGIN
        CREATE TABLE Orders (
          OrderId INT PRIMARY KEY IDENTITY(1,1),
          CustomerId INT NOT NULL,
          TotalAmount DECIMAL(18, 2) NOT NULL,
          OrderStatus NVARCHAR(50) DEFAULT 'Pending',
          CreatedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (CustomerId) REFERENCES Users(Id)
        );
        PRINT 'Orders table created.';
      END
    `);

    // 4. Create OrderItems Table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
      BEGIN
        CREATE TABLE OrderItems (
          OrderItemId INT PRIMARY KEY IDENTITY(1,1),
          OrderId INT NOT NULL,
          ProductId INT NOT NULL,
          StoreId INT NOT NULL,
          Quantity INT NOT NULL,
          UnitPrice DECIMAL(18, 2) NOT NULL,
          FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
          FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
          FOREIGN KEY (StoreId) REFERENCES Stores(StoreId)
        );
        PRINT 'OrderItems table created.';
      END
    `);

    // 4b. Add Status to OrderItems (for per-item vendor updates)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'Status' AND object_id = OBJECT_ID('OrderItems'))
      BEGIN
        ALTER TABLE OrderItems ADD Status NVARCHAR(50) DEFAULT 'Pending';
        PRINT 'Status column added to OrderItems.';
      END
    `);

    // 5. Create CartItems Table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CartItems')
      BEGIN
        CREATE TABLE CartItems (
          CartItemId INT PRIMARY KEY IDENTITY(1,1),
          UserId INT NOT NULL,
          ProductId INT NOT NULL,
          Quantity INT NOT NULL DEFAULT 1,
          AddedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (UserId) REFERENCES Users(Id),
          FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
        );
        PRINT 'CartItems table created.';
      END
    `);

    // 6. Create WishlistItems Table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WishlistItems')
      BEGIN
        CREATE TABLE WishlistItems (
          WishlistItemId INT PRIMARY KEY IDENTITY(1,1),
          UserId INT NOT NULL,
          ProductId INT NOT NULL,
          AddedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (UserId) REFERENCES Users(Id),
          FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
          CONSTRAINT UC_User_Product UNIQUE (UserId, ProductId)
        );
        PRINT 'WishlistItems table created.';
      END
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
