const express = require("express");

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/userController");


const {
  authenticateToken
} = require("../middleware/authMiddleware");


const router =
  express.Router();


router.get(
  "/",
  authenticateToken,
  getUsers
);

router.post(
  "/",
  authenticateToken,
  createUser
);

router.put(
  "/:id",
  authenticateToken,
  updateUser
);

router.delete(
  "/:id",
  authenticateToken,
  deleteUser
);



module.exports = router;

// const express = require("express");

// const {
//   getUsers
// } = require("../controllers/userController");

// const router =
//   express.Router();

// router.get(
//   "/",
//   getUsers
// );

// module.exports = router;
