import {
  useAuth
} from "../context/AuthContext";


function Navbar() {

  const {
    user,
    logout
  } = useAuth();


  return (

    <header className="navbar">

      <h3>
        Dashboard
      </h3>


      <div className="navbar-user">

        <span>
          {user?.name}
        </span>


        <span>
          ({user?.role})
        </span>


        <button
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}


export default Navbar;


// function Navbar() {

//   return (
//     <header className="navbar">

//       <h3>
//         Dashboard
//       </h3>

//       <div>
//         Admin
//       </div>

//     </header>
//   );
// }

// export default Navbar;
