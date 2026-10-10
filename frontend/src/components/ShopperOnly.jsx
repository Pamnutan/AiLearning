import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ShopperOnly({ children }) {
  const { userRole } = useAuth();
  if (userRole === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  if (userRole === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  return children;
}

export default ShopperOnly;