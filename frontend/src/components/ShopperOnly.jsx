import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ShopperOnly({ children }) {
  const { userRole } = useAuth();
  if (userRole === 'admin' || userRole === 'vendor') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default ShopperOnly;