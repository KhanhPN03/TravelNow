import AdminHeader from "./AdminHeader";
import SidebarNavigate from "./SidebarNavigate";
import CreateTour from "./CreateTour";

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
