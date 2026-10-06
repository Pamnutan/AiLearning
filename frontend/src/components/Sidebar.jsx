import { NavLink, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate(); // 2. Initialize the navigate function

  // 3. Create a handleLogout function
  const handleLogout = () => {
    logout();             // Clears state and localStorage
    navigate("/login");   // Redirects to the login route
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/products", icon: <Package size={20} /> },
    { name: "Users", path: "/users", icon: <Users size={20} /> },
    { name: "Orders", path: "/orders", icon: <ShoppingCart size={20} /> },
  ];

  return (
    <aside className="sidebar">
      {/* ... keeping your logo and menu items the exact same ... */}
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

      
         <div className="sidebar-bottom">
        {/* 1. Changed button to NavLink to handle visual state and routing */}
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `sidebar-link settings-button ${isActive ? "active" : ""}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>


        {/* 4. Update the onClick handler to use handleLogout */}
        <button 
          className="sidebar-link logout-button" 
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
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
