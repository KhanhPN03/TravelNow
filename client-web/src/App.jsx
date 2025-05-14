import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "./context/ContextProvider";
import AdminRoutes from "./navigation/AdminRoutes";
import GuideRoutes from "./navigation/GuideRoutes";
import ProtectedRoute from "./navigation/ProtectedRoute";
import Login from "./pages/Login";
import NoPermission from "./pages/NoPermission";
import ForgotPasswordContainer from "./pages/ForgotPasswordContainer";

function App() {
  const { user } = useContext(Context);
  if (user === undefined) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            user.role === "admin" || user.role === "superAdmin" ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Navigate to="/guide" />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route path="/forgotpassword" element={<ForgotPasswordContainer />} />
      <Route
        element={<ProtectedRoute allowedRoles={["admin", "superAdmin"]} />}
      >
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["guide"]} />}>
        <Route path="/guide/*" element={<GuideRoutes />} />
      </Route>

      <Route path="/no-permission" element={<NoPermission />} />

      <Route
        path="/*"
        element={
          <Navigate
            to={
              user
                ? user.role === "guide"
                  ? "/guide"
                  : "/admin/dashboard"
                : "/login"
            }
          />
        }
      />
    </Routes>
  );
}

export default App;
