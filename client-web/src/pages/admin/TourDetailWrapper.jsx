import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import TourDetail from "./admin_components/TourDetail";

function TourDetailWrapper() {
  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div datatype="bgFalse" className="rightSidebarContainer">
        <AdminHeader />
        <div className="dashboardTableContainer">
          <TourDetail />
        </div>
      </div>
    </div>
  );
}

export default TourDetailWrapper;
