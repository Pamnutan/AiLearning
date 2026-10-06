const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

// Helper function to send email (Mockup - configure with Nodemailer or SendGrid)
async function sendEmail({ to, subject, html }) {
  console.log(`Sending Email to: ${to}\nSubject: ${subject}\nBody: ${html}`);
  // In production, integrate your nodemailer transport here:
  // await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const pool = await poolPromise;

    // Check existing user
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .query(`SELECT Id FROM Users WHERE Email = @email`);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool
      .request()
      .input("name", sql.NVarChar(100), name)
      .input("email", sql.NVarChar(150), email)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .input("role", sql.NVarChar(20), "user")
      .query(`
        INSERT INTO Users (Name, Email, PasswordHash, Role)
        OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Email, INSERTED.Role
        VALUES (@name, @email, @passwordHash, @role)
      `);

    const user = result.recordset[0];

    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .query(`SELECT Id, Name, Email, PasswordHash, Role FROM Users WHERE Email = @email`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.recordset[0];

    // Compare password
    const passwordValid = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.Id, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        role: user.Role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
}

// ==========================================
// 1. ADDED: Forgot Password Handler
// ==========================================
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const pool = await poolPromise;

    // Verify user exists
    const result = await pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .query(`SELECT Id, Name FROM Users WHERE Email = @email`);

    if (result.recordset.length === 0) {
      // Security standard: don't reveal user doesn't exist
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const user = result.recordset[0];

    // Sign a temporary reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { userId: user.Id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Build fallback link matching your frontend URL pattern
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send the email (ensure background utility is active)
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.Name},</p>
        <p>We received a request to reset your password. Click the link below to set up a new one:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to process forgot password request" });
  }
}

// ==========================================
// 2. ADDED: Reset Password Handler
// ==========================================
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let decoded;
    try {
      // Decode and check token integrity
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired recovery token." });
    }

    // Verify purpose flag
    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Malformed token authentication." });
    }

    const pool = await poolPromise;
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password inside MSSQL Database
    const result = await pool
      .request()
      .input("userId", sql.Int, decoded.userId)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .query(`
        UPDATE Users 
        SET PasswordHash = @passwordHash 
        WHERE Id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User records not found." });
    }

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update your password" });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};


// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const {
//   sql,
//   poolPromise
// } = require("../config/db");


// async function register(req, res) {

//   try {

//     const {
//       name,
//       email,
//       password
//     } = req.body;

//     if (
//       !name ||
//       !email ||
//       !password
//     ) {

//       return res.status(400).json({
//         message:
//           "Name, email and password are required"
//       });
//     }

//     if (password.length < 6) {

//       return res.status(400).json({
//         message:
//           "Password must be at least 6 characters"
//       });
//     }


//     const pool =
//       await poolPromise;


//     // Check existing user

//     const existingUser =
//       await pool
//         .request()

//         .input(
//           "email",
//           sql.NVarChar(150),
//           email
//         )

//         .query(`
//           SELECT Id
//           FROM Users
//           WHERE Email = @email
//         `);


//     if (
//       existingUser.recordset.length > 0
//     ) {

//       return res.status(409).json({
//         message:
//           "Email already registered"
//       });
//     }


//     // Hash password

//     const passwordHash =
//       await bcrypt.hash(
//         password,
//         10
//       );


//     // Insert user

//     const result =
//       await pool
//         .request()

//         .input(
//           "name",
//           sql.NVarChar(100),
//           name
//         )

//         .input(
//           "email",
//           sql.NVarChar(150),
//           email
//         )

//         .input(
//           "passwordHash",
//           sql.NVarChar(255),
//           passwordHash
//         )

//         .input(
//           "role",
//           sql.NVarChar(20),
//           "user"
//         )

//         .query(`
//           INSERT INTO Users
//           (
//             Name,
//             Email,
//             PasswordHash,
//             Role
//           )

//           OUTPUT
//             INSERTED.Id,
//             INSERTED.Name,
//             INSERTED.Email,
//             INSERTED.Role

//           VALUES
//           (
//             @name,
//             @email,
//             @passwordHash,
//             @role
//           )
//         `);


//     const user =
//       result.recordset[0];


//     res.status(201).json({
//       message:
//         "Registration successful",

//       user
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message:
//         "Registration failed"
//     });
//   }
// }


// async function login(req, res) {

//   try {

//     const {
//       email,
//       password
//     } = req.body;


//     if (!email || !password) {

//       return res.status(400).json({
//         message:
//           "Email and password are required"
//       });
//     }


//     const pool =
//       await poolPromise;


//     const result =
//       await pool
//         .request()

//         .input(
//           "email",
//           sql.NVarChar(150),
//           email
//         )

//         .query(`
//           SELECT
//             Id,
//             Name,
//             Email,
//             PasswordHash,
//             Role

//           FROM Users

//           WHERE Email = @email
//         `);


//     if (
//       result.recordset.length === 0
//     ) {

//       return res.status(401).json({
//         message:
//           "Invalid email or password"
//       });
//     }


//     const user =
//       result.recordset[0];


//     // Compare password

//     const passwordValid =
//       await bcrypt.compare(
//         password,
//         user.PasswordHash
//       );


//     if (!passwordValid) {

//       return res.status(401).json({
//         message:
//           "Invalid email or password"
//       });
//     }


//     // Create JWT

//     const token =
//       jwt.sign(

//         {
//           userId: user.Id,
//           role: user.Role
//         },

//         process.env.JWT_SECRET,

//         {
//           expiresIn: "1d"
//         }
//       );


//     res.json({

//       message:
//         "Login successful",

//       token,

//       user: {
//         id: user.Id,
//         name: user.Name,
//         email: user.Email,
//         role: user.Role
//       }

//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message:
//         "Login failed"
//     });
//   }
// }


// module.exports = {
//   register,
//   login
// };
