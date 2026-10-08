import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  UserPlus,
  Store,
  Box,
  BarChart3,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout, isAdmin, isVendor, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Build menu items based on user role
  const getMenuItems = () => {
    const items = [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Admin Panel", path: "/", icon: <Shield size={20} /> },
    ];

    if (isAdmin) {
      items.push(
        { name: "Manage Users", path: "/admin/users", icon: <Users size={20} /> },
        { name: "Manage Stores", path: "/admin/stores", icon: <Store size={20} /> },
        { name: "Manage Products", path: "/admin/products", icon: <Box size={20} /> },
        { name: "Reports", path: "/admin/reports", icon: <BarChart3 size={20} /> }
      );
    } else if (isVendor) {
      items.push(
        { name: "My Store", path: "/vendor/store", icon: <Store size={20} /> },
        { name: "My Products", path: "/vendor/products", icon: <Package size={20} /> },
        { name: "My Orders", path: "/vendor/orders", icon: <ShoppingCart size={20} /> }
      );
    } else {
      items.push(
        { name: "Products", path: "/products", icon: <Package size={20} /> },
        { name: "Orders", path: "/orders", icon: <ShoppingCart size={20} /> }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">D</div>
        <span>AdminPanel</span>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-heading">MAIN MENU</span>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-heading">ACCOUNT</span>
        <nav className="sidebar-nav">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link settings-button ${isActive ? "active" : ""}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>

          <button
            className="sidebar-link logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Role indicator */}
      <div className="sidebar-role">
        <span className="role-badge">
          {userRole === 'admin' && <Shield size={14} />}
          {userRole === 'vendor' && <Store size={14} />}
          {userRole === 'user' && <Users size={14} />}
          {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;


// import { NavLink } from "react-router-dom";

// import {
//   LayoutDashboard,
//   Package,
//   Users,
//   ShoppingCart,
//   Settings,
//   LogOut,
// } from "lucide-react";

// function Sidebar() {
//   const menuItems = [
//     {
//       name: "Dashboard",
//       path: "/dashboard",
//       icon: <LayoutDashboard size={20} />,
//     },
//     {
//       name: "Products",
//       path: "/products",
//       icon: <Package size={20} />,
//     },
//     {
//       name: "Users",
//       path: "/users",
//       icon: <Users size={20} />,
//     },
//     {
//       name: "Orders",
//       path: "/orders",
//       icon: <ShoppingCart size={20} />,
//     },
//   ];

//   return (
//     <aside className="sidebar">

//       <div className="sidebar-logo">
//         <div className="logo-icon">
//           D
//         </div>

//         <span>
//           AdminPanel
//         </span>
//       </div>

//       <div className="sidebar-section">
//         <span className="sidebar-heading">
//           MAIN MENU
//         </span>

//         <nav className="sidebar-nav">

//           {menuItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={({ isActive }) =>
//                 `sidebar-link ${
//                   isActive ? "active" : ""
//                 }`
//               }
//             >
//               {item.icon}

//               <span>
//                 {item.name}
//               </span>
//             </NavLink>
//           ))}

//         </nav>
//       </div>

//       <div className="sidebar-bottom">

//         <button className="sidebar-link settings-button">
//           <Settings size={20} />
//           <span>Settings</span>
//         </button>

//         <button className="sidebar-link logout-button">
//           <LogOut size={20} />
//           <span>Logout</span>
//         </button>

//       </div>

//     </aside>
//   );
// }

// export default Sidebar;


// import { NavLink } from "react-router-dom";

// function Sidebar() {

//   return (
//     <aside className="sidebar">

//       <h2>Admin Panel</h2>

//       <nav>

//         <NavLink to="/">
//           Dashboard
//         </NavLink>

//         <NavLink to="/users">
//           Users
//         </NavLink>

//         <NavLink to="/products">
//           Products
//         </NavLink>

//       </nav>

//     </aside>
//   );
// }

// export default Sidebar;
