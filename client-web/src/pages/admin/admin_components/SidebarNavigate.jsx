import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../../../context/ContextProvider";

const SidebarNavigate = () => {
  const location = useLocation(); // Lấy thông tin URL hiện tại
  const { logout, user } = useContext(Context);
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <i className="bx bxs-dashboard"></i>,
      link: "/admin/dashboard",
    },
    {
      id: "discount",
      label: "Discounts",
      icon: <i className="bx bxs-plane-alt"></i>,
      link: "/admin/gifts",
    },
    {
      id: "profile",
      label: "Edit Profile",
      icon: <i className="bx bxs-user-circle"></i>,
      link: "/admin/editProfile",
    },
    {
      id: "notification",
      label: "Notification",
      icon: <i class="bx bxs-bell"></i>,
      link: "/admin/notification",
    },
    {
      id: "refund",
      label: "Refund",
      icon: <i class="bx bxs-wallet"></i>,
      link: "/admin/refund",
    },
    {
      id: "bin",
      label: "Trash",
      icon: <i className="bx bxs-trash-alt"></i>,
      link: "/admin/trash",
    },
    user.user.role === "superAdmin"
      ? {
          id: "admin",
          label: "Admin List",
          icon: <i className="bx bxs-user-detail"></i>,
          link: "/admin/adminList",
        }
      : [],
  ];

  return (
    <aside className="AdminSidebar">
      {/* Logo */}
      <div className="AdminSidebarLogo">
        <img src="../../../../../images/logo_admin.png" alt="" />
      </div>

      {/* Navigation Items */}
      <nav className="AdminSidebarNav">
        {menuItems.map((item) => (
          <Link to={item?.link} key={item?.id}>
            <button
              className={`AdminNavItem ${
                location?.pathname.startsWith(item?.link) ? "active" : ""
              }`}
            >
              <span className="AdminNavIcon">{item?.icon}</span>
              <span className="AdminNavLabel ffGTBold fs-20">
                {item?.label}
              </span>
            </button>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button className="AdminLogoutButton" onClick={logout}>
        <i className="bx bx-log-out AdminLogoutIcon"></i>
        <span className="ffGTMedium fs-20">Logout</span>
      </button>
    </aside>
  );
};

export default SidebarNavigate;
