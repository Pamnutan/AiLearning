import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // Automatically attach the token to the API instance if it exists on app load
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Regular Login function
  async function login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Dynamically attach token to subsequent requests immediately
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(newUser);

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Rethrow so the UI component can show an alert/error message
    }
  }

  async function sendPasswordResetEmail(email) {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password email failed:", error);
      throw error;
    }
  }

  async function resetPassword(resetToken, newPassword) {
    try {
      const response = await api.post("/auth/reset-password", {
        token: resetToken,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear global API authentication token header
    delete api.defaults.headers.common["Authorization"];
    
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        sendPasswordResetEmail,
        resetPassword, // FIXED: Now properly exposed to your components!
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
 
  return context;
}



// import {
//   createContext,
//   useContext,
//   useState
// } from "react";

// import api from "../services/api";


// const AuthContext =
//   createContext(null);


// export function AuthProvider({
//   children
// }) {

//   const [user, setUser] =
//     useState(() => {

//       const savedUser =
//         localStorage.getItem(
//           "user"
//         );

//       return savedUser
//         ? JSON.parse(savedUser)
//         : null;
//     });


//   const [token, setToken] =
//     useState(() => {

//       return localStorage.getItem(
//         "token"
//       );

//     });


//   async function login(
//     email,
//     password
//   ) {

//     const response =
//       await api.post(
//         "/auth/login",
//         {
//           email,
//           password
//         }
//       );


//     const {
//       token,
//       user
//     } = response.data;


//     localStorage.setItem(
//       "token",
//       token
//     );


//     localStorage.setItem(
//       "user",
//       JSON.stringify(user)
//     );


//     setToken(token);
//     setUser(user);


//     return response.data;
//   }


//   function logout() {

//     localStorage.removeItem(
//       "token"
//     );

//     localStorage.removeItem(
//       "user"
//     );

//     setToken(null);
//     setUser(null);
//   }


//   return (

//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         login,
//         logout,
//         isAuthenticated:
//           Boolean(token)
//       }}
//     >

//       {children}

//     </AuthContext.Provider>
//   );
// }


// export function useAuth() {

//   return useContext(
//     AuthContext
//   );
// }
