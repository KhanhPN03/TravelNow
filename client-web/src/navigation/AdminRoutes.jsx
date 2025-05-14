import { Route, Routes } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminList from "../pages/admin/AdminList";
import Discount from "../pages/admin/Discount";
import EditProfile from "../pages/admin/EditProfile";
import CustomerManage from "../pages/admin/CustomerMange";

import CreateCustomer from "../pages/admin/admin_components/CreateCustomer";
import ToursManage from "../pages/admin/ToursManage";
import CreateTourWrapper from "../pages/admin/admin_components/CreateTourWrapper";
import Trash from "../pages/admin/Trash";

import SubsidiaryToursManage from "../pages/admin/admin_components/SusidiaryToursManage";
import TourDetailWrapper from "../pages/admin/TourDetailWrapper";
import GuideManage from "../pages/admin/GuideManage";

import CreateAdmin from "../pages/admin/admin_components/CreateAdmin";
import CreateGuide from "../pages/admin/admin_components/CreateGuide";
import NotificationManage from "../pages/admin/NotificationManage";
import AttendanceList from "../pages/tourguide/AttendanceList";
import RefundMange from "../pages/admin/RefundManage";
import FeedbackManage from "../pages/admin/admin_components/FeedbackManage";
import ReviewModal from "../pages/admin/admin_components/ReviewModal";
import TicketsManage from "../pages/admin/TicketsManage";
import SubToursManage from "../pages/admin/SubToursManage";
import Revenue from "../pages/admin/Revenue";

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="dashboard/toursmanage/createTour"
        element={<CreateTourWrapper />}
      />
      <Route
        path="dashboard/subtoursmanage/createTour"
        element={<CreateTourWrapper />}
      />
      <Route
        path="dashboard/toursmanage/subsidiarytoursmanage/:orgTourId"
        element={<SubsidiaryToursManage />}
      />
      <Route path="refund" element={<RefundMange />} />
      <Route
        path="dashboard/customerManage/createCustomer"
        element={<CreateCustomer />}
      />
      <Route
        path="dashboard/guideManage/createGuide"
        element={<CreateGuide />}
      />
      <Route path="dashboard/guideManage" element={<GuideManage />} />

      <Route path="dashboard/customerManage" element={<CustomerManage />} />
      <Route path="adminList/createAdmin" element={<CreateAdmin />} />

      <Route path="dashboard/toursmanage" element={<ToursManage />} />
      <Route path="dashboard/subtoursmanage" element={<SubToursManage />} />
      <Route
        path="dashboard/toursmanage/tourdetail/:tourType/:tourId"
        element={<TourDetailWrapper />}
      />
      <Route
        path="dashboard/subtoursmanage/tourdetail/:tourType/:tourId"
        element={<TourDetailWrapper />}
      />

      <Route
        path="dashboard/toursmanage/tourfeedback/:tourType/:tourId"
        element={<FeedbackManage />}
      />

      <Route
        path="dashboard/subtoursmanage/tourfeedback/:tourType/:tourId"
        element={<FeedbackManage />}
      />

      <Route
        path="dashboard/toursmanage/subsidiarytoursmanage/:tourId/tourticket"
        element={<TicketsManage />}
      />
      <Route
        path="dashboard/subtoursmanage/:tourId/tourticket"
        element={<TicketsManage />}
      />

      <Route path="dashboard/revenue" element={<Revenue />} />

      <Route path="dashboard/test" element={<ReviewModal />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="adminList" element={<AdminList />} />
      <Route path="gifts" element={<Discount />} />
      <Route path="editProfile" element={<EditProfile />} />
      <Route path="trash" element={<Trash />} />
      <Route path="/notification" element={<NotificationManage />} />
      <Route path="/attendance" element={<AttendanceList />} />
    </Routes>
  );
}

export default AdminRoutes;
