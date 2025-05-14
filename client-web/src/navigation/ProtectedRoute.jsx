import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Context } from "../context/ContextProvider";
import NoPermission from "../pages/NoPermission";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(Context);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in allowedRoles array
  if (!allowedRoles.includes(user.user.role)) {
    return <NoPermission />; // Show NoPermission page if not authorized
  }

  return <Outlet />; // Allow access to the protected route
};

export default ProtectedRoute;
