require("dotenv").config();

const express = require("express");
const cors = require("cors");


const { poolPromise } = require("./config/db");
const userRoutes =
  require("./routes/userRoutes");

const productRoutes =
  require("./routes/productRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");
  const authRoutes =
  require("./routes/authRoutes");

  const orderRoutes =
  require("./routes/orderRoutes");
  const settingsRoutes = require("./routes/settingsRoutes");



const app = express();

app.use(cors());



// 💡 ADD THESE PARSERS BEFORE YOUR ROUTE DEFINITIONS
app.use(express.json()); // For handling application/json requests
app.use(express.urlencoded({ extended: true })); // For handling form submissions

app.get("/", (req, res) => {
  res.json({
    message: "Dashboard API is running"
  });
});

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use(
  "/api/auth",
  authRoutes
);
app.use(
  "/api/orders",
  orderRoutes
);
app.use("/api/settings", settingsRoutes); // Add this hook line below auth mapping

const PORT =
  process.env.PORT || 5000;

async function startServer() {

  await poolPromise;

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
}

startServer();
