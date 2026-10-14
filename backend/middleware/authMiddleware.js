const jwt = require("jsonwebtoken");


function authenticateToken(
  req,
  res,
  next
) {

  const authHeader =
    req.headers.authorization;


  if (!authHeader) {

    return res.status(401).json({
      message:
        "Authentication required"
    });
  }


  const parts =
    authHeader.split(" ");


  const token =
    parts[1];


  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer" ||
    !token
  ) {

    return res.status(401).json({
      message:
        "Invalid authorization format"
    });
  }


  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    req.user = decoded;


    next();

  } catch (error) {

    return res.status(403).json({
      message:
        "Invalid or expired token"
    });
  }
}


function authorizeRoles(...allowedRoles) {

  return (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        message:
          "Authentication required"
      });
    }


    const userRole = (req.user?.role || '').toString().toLowerCase();
    if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {

      return res.status(403).json({
        message:
          "Access denied"
      });
    }


    next();
  };
}


module.exports = {
  authenticateToken,
  protect: authenticateToken,
  authorize: authorizeRoles
};
