import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  return (
    <div className="app">

      <Sidebar />

      <div className="main-wrapper">

        <Topbar />

        <main className="main-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default Layout;


// import Sidebar
//   from "./Sidebar";

// import Navbar
//   from "./Navbar";

// function Layout({ children }) {

//   return (
//     <div className="app-layout">

//       <Sidebar />

//       <div className="main-area">

//         <Navbar />

//         <main className="content">
//           {children}
//         </main>

//       </div>

//     </div>
//   );
// }

// export default Layout;
