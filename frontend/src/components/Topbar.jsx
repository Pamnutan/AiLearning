import { Bell, Search, Menu, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext"; 
import { NavLink, useNavigate } from "react-router-dom";

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || "Guest";
  const userRole = user?.role || "User";
  const userInitials = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="mobile-menu">
        <Menu size={22} />
      </div>
      
      <div className="search-box">
        <Search size={18} />
        <input type="text" placeholder="Search..." />
      </div>
      
      <div className="topbar-right">
        <NavLink 
          to="/cart" 
          className="notification-button" 
          style={{ position: 'relative' }}
        >
          <ShoppingCart size={20} />
        </NavLink>
        
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar"> 
            {userInitials} 
          </div> 
          
          <div className="user-info">
            <strong>{userName}</strong>
            <span>{userRole}</span>
          </div>

          <button 
            onClick={handleLogout} 
            className="logout-button" 
            title="Logout"
            style={{ marginLeft: '10px', cursor: 'pointer', border: 'none', background: 'none', color: '#ef4444' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;



// import {
//   Bell,
//   Search,
//   Menu,
// } from "lucide-react";

// function Topbar() {
//   return (
//     <header className="topbar">

//       <div className="mobile-menu">
//         <Menu size={22} />
//       </div>

//       <div className="search-box">

//         <Search size={18} />

//         <input
//           type="text"
//           placeholder="Search..."
//         />

//       </div>

//       <div className="topbar-right">

//         <button className="notification-button">
//           <Bell size={20} />

//           <span className="notification-dot"></span>
//         </button>

//         <div className="user-profile">

//           <div className="avatar">
//             A
//           </div>

//           <div className="user-info">
//             <strong>Admin User</strong>
//             <span>Administrator</span>
//           </div>

//         </div>

//       </div>

//     </header>
//   );
// }

// export default Topbar;
