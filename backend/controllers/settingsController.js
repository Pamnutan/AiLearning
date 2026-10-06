const bcrypt = require("bcrypt");
const { sql, poolPromise } = require("../config/db");

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId; // Provided by authMiddleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }

    const pool = await poolPromise;

    // Fetch user hash matching token ID
    const userResult = await pool
      .request()
      .input("id", sql.Int, userId)
      .query("SELECT PasswordHash FROM Users WHERE Id = @id");

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: "User account records not found." });
    }

    const user = userResult.recordset[0];

    // Validate old password entry
    const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    // Encrypt structural new password entry
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Write change update transaction back to user table
    await pool
      .request()
      .input("id", sql.Int, userId)
      .input("newHash", sql.NVarChar(255), newPasswordHash)
      .query("UPDATE Users SET PasswordHash = @newHash WHERE Id = @id");

    return res.json({ message: "Password successfully changed." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server update failed." });
  }
}

module.exports = {
  changePassword,
};
