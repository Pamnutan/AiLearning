import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password
      });

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;


// import {
//   useState
// } from "react";

// import {
//   useNavigate
// } from "react-router-dom";

// import api
//   from "../services/api";


// function Register() {

//   const navigate =
//     useNavigate();


//   const [name, setName] =
//     useState("");

//   const [email, setEmail] =
//     useState("");

//   const [password, setPassword] =
//     useState("");

//   const [error, setError] =
//     useState("");

//   const [loading, setLoading] =
//     useState(false);


//   async function handleSubmit(e) {

//     e.preventDefault();

//     setError("");
//     setLoading(true);


//     try {

//       await api.post(
//         "/auth/register",
//         {
//           name,
//           email,
//           password
//         }
//       );


//       navigate("/login");

//     } catch (error) {

//       setError(
//         error.response?.data?.message ||
//         "Registration failed"
//       );

//     } finally {

//       setLoading(false);
//     }
//   }


//   return (

//     <div className="auth-page">

//       <form
//         className="auth-form"
//         onSubmit={handleSubmit}
//       >

//         <h1>
//           Create Account
//         </h1>


//         {error && (
//           <div className="error">
//             {error}
//           </div>
//         )}


//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={e =>
//             setName(
//               e.target.value
//             )
//           }
//           required
//         />


//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={e =>
//             setEmail(
//               e.target.value
//             )
//           }
//           required
//         />


//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={e =>
//             setPassword(
//               e.target.value
//             )
//           }
//           required
//         />


//         <button
//           type="submit"
//           disabled={loading}
//         >

//           {loading
//             ? "Creating..."
//             : "Register"}

//         </button>

//       </form>

//     </div>
//   );
// }


// export default Register;
