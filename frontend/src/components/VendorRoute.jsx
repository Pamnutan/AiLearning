import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VendorRoute({ children }) {
  const { isAuthenticated, isVendor, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin can also access vendor routes
  if (!isVendor && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default VendorRoute;