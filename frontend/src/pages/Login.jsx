import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Loader2, ArrowRight, X } from "lucide-react"; 

function Login() {
  const navigate = useNavigate();
  const { login, sendPasswordResetEmail } = useAuth();

  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState("");

  // Check if an email was remembered previously
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle Login Submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      // Save or remove email based on Remember Me checkbox
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      navigate("/");
      // Redirect vendor to vendor dashboard after login
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if ((userData?.role || userData?.Role)?.toLowerCase() === 'vendor') {
        navigate("/vendor/dashboard", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  // Handle Forgot Password Submission
  async function handleForgotPassword(e) {
    e.preventDefault();
    setModalError("");
    setModalMessage("");
    setModalLoading(true);

    try {
      await sendPasswordResetEmail(resetEmail);
      setModalMessage("A password reset link has been sent to your email address.");
      setResetEmail("");
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"></div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20">
            <Lock size={22} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm"
              />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center space-x-2 text-slate-500 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600" 
              />
              <span>Remember me</span>
            </label>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Register here
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl relative">
            <button 
              onClick={() => { setIsModalOpen(false); setModalError(""); setModalMessage(""); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h2>
            <p className="text-sm text-slate-500 mb-4">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              {modalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {modalError}
                </div>
              )}
              {modalMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {modalMessage}
                </div>
              )}

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50"
              >
                {modalLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;


// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Lock, Mail, Loader2, ArrowRight } from "lucide-react"; 

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await login(email, password);
//       navigate("/");
//     } catch (error) {
//       setError(
//         error.response?.data?.message || "Login failed. Please check your credentials."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
//       {/* Soft Decorative Ambient Background Glows */}
//       <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl"></div>
//       <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"></div>

//       <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-md">
//         <div className="text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20">
//             <Lock size={22} />
//           </div>
//           <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
//             Welcome back
//           </h1>
//           <p className="mt-2 text-sm text-slate-500">
//             Enter your credentials to access your account
//           </p>
//         </div>

//         <form className="space-y-5" onSubmit={handleSubmit}>
//           {error && (
//             <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
//               {error}
//             </div>
//           )}

//           <div className="space-y-4">
//             <div className="relative">
//               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
//                 <Mail size={18} />
//               </div>
//               <input
//                 type="email"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm"
//               />
//             </div>

//             <div className="relative">
//               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
//                 <Lock size={18} />
//               </div>
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm"
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <label className="flex items-center space-x-2 text-slate-500 cursor-pointer select-none">
//               <input 
//                 type="checkbox" 
//                 className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600" 
//               />
//               <span>Remember me</span>
//             </label>
//             <a href="#forgot" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
//               Forgot password?
//             </a>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
//           >
//             {loading ? (
//               <>
//                 <Loader2 size={18} className="animate-spin" />
//                 <span>Signing in...</span>
//               </>
//             ) : (
//               <>
//                 <span>Sign In</span>
//                 <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
//               </>
//             )}
//           </button>
//         </form>

//         <p className="text-center text-sm text-slate-500">
//           Don't have an account?{" "}
//           <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
//             Register here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom"; // Added Link
// import { useAuth } from "../context/AuthContext";

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await login(email, password);
//       navigate("/");
//     } catch (error) {
//       setError(
//         error.response?.data?.message || "Login failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
//         <div>
//           <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
//             Sign in to your account
//           </h1>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
//               {error}
//             </div>
//           )}

//           <div className="space-y-4 rounded-md shadow-sm">
//             <div>
//               <input
//                 type="email"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//               />
//             </div>

//             <div>
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Logging in..." : "Sign In"}
//             </button>
//           </div>
//         </form>

//         <p className="mt-2 text-center text-sm text-gray-600">
//           Don't have an account?{" "}
//           <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
//             Register here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


// import {
//   useState
// } from "react";

// import {
//   useNavigate
// } from "react-router-dom";

// import {
//   useAuth
// } from "../context/AuthContext";


// function Login() {

//   const navigate =
//     useNavigate();

//   const {
//     login
//   } = useAuth();


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

//       await login(
//         email,
//         password
//       );

//       navigate("/");

//     } catch (error) {

//       setError(
//         error.response?.data?.message ||
//         "Login failed"
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
//           Login
//         </h1>


//         {error && (

//           <div className="error">
//             {error}
//           </div>

//         )}


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
//             ? "Logging in..."
//             : "Login"}

//         </button>

//       </form>

//     </div>
//   );
// }


// export default Login;
