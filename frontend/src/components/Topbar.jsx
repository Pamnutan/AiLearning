import { Bell, Search, Menu } from "lucide-react";
// 1. Import the useAuth hook from your context file
import { useAuth } from "../context/AuthContext"; // Update this path to match your folder structure

function Topbar() {
  // 2. Consume the user object from the AuthContext
  const { user } = useAuth();

  // Fallbacks in case the user data is loading or null
  const userName = user?.name || "Guest";
  const userRole = user?.role || "User";
  const userInitials = userName.charAt(0).toUpperCase();

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
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar"> 
            {userInitials} 
          </div> 
          
          {/* Displaying dynamic information from AuthContext */}
          <div className="user-info">
            <strong>{userName}</strong>
            <span>{userRole}</span>
          </div>
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
