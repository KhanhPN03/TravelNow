import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import CreateTour from "./admin_components/CreateTour";

function CreateTourWrapper() {
  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div datatype="bgFalse" className="rightSidebarContainer">
        <AdminHeader />
        <div className="dashboardTableContainer">
          <CreateTour />
        </div>
      </div>
    </div>
  );
}

export default CreateTourWrapper;
