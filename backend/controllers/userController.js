const bcrypt = require("bcrypt");
const {
  sql,
  poolPromise
} = require("../config/db");


async function getUsers(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`
        SELECT
          Id,
          Name,
          Email,
          Role,
          CreatedAt
        FROM Users
        ORDER BY Id DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch users"
    });
  }
}

async function createUser(req, res) {
  try {
    const { 
      name, fullName, 
      email, emailAddress, 
      password, 
      role, userRole 
    } = req.body;

    const finalName = name || fullName;
    const finalEmail = email || emailAddress;
    const finalRole = role || userRole;

    if (!finalName || !finalEmail || !password || !finalRole) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const pool = await poolPromise;

    // Check existing user
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar(150), finalEmail)
      .query(`SELECT Id FROM Users WHERE Email = @email`);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool
      .request()
      .input("name", sql.NVarChar(100), finalName)
      .input("email", sql.NVarChar(150), finalEmail)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .input("role", sql.NVarChar(20), finalRole)
      .query(`
        INSERT INTO Users (Name, Email, PasswordHash, Role)
        OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Email, INSERTED.Role
        VALUES (@name, @email, @passwordHash, @role)
      `);

    const user = result.recordset[0];
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user" });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { 
      name, fullName, 
      email, emailAddress, 
      password, 
      role, userRole 
    } = req.body;

    const finalName = name || fullName;
    const finalEmail = email || emailAddress;
    const finalRole = role || userRole;

    const pool = await poolPromise;

    // 1. Check if user exists
    const userCheck = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`SELECT Id FROM Users WHERE Id = @id`);

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Handle email uniqueness if email is being changed
    if (finalEmail) {
      const emailCheck = await pool
        .request()
        .input("email", sql.NVarChar(150), finalEmail)
        .input("id", sql.Int, id)
        .query(`SELECT Id FROM Users WHERE Email = @email AND Id != @id`);
      
      if (emailCheck.recordset.length > 0) {
        return res.status(409).json({ message: "Email already registered to another user" });
      }
    }

    // 3. Handle password hashing
    let passwordHash = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    // 4. Build dynamic update query
    const updates = [];
    const request = pool.request().input("id", sql.Int, id);

    if (finalName) {
      updates.push("Name = @name");
      request.input("name", sql.NVarChar(100), finalName);
    }
    if (finalEmail) {
      updates.push("Email = @email");
      request.input("email", sql.NVarChar(150), finalEmail);
    }
    if (passwordHash) {
      updates.push("PasswordHash = @passwordHash");
      request.input("passwordHash", sql.NVarChar(255), passwordHash);
    }
    if (finalRole) {
      updates.push("Role = @role");
      request.input("role", sql.NVarChar(20), finalRole);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const query = `
      UPDATE Users 
      SET ${updates.join(", ")} 
      OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Email, INSERTED.Role
      WHERE Id = @id`;

    const result = await request.query(query);
    const user = result.recordset[0];
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    console.log(`[DELETE USER] Attempting to delete ID: ${id} (Type: ${typeof id})`);
    const pool = await poolPromise;

    // Check if user exists first
    const userCheck = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`SELECT Id, Name FROM Users WHERE Id = @id`);

    console.log(`[DELETE USER] DB Check Result:`, userCheck.recordset);

    if (userCheck.recordset.length === 0) {
      console.log(`[DELETE USER] User with ID ${id} not found in DB`);
      return res.status(404).json({ message: "User not found" });
    }

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Users WHERE Id = @id`);

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ message: "Unable to delete user from database" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
