import { Route, Routes } from "react-router-dom";
import AttendanceList from "../pages/tourguide/AttendanceList";
import AdminDashboard from "../pages/admin/AdminDashboard";

function GuideRoutes() {
  return (
    <Routes>
      {/* <Route path="/revenue" element={<RevenueReport />} />
      <Route path="/toursmanage/createTour" element={<CreateTourWrapper />} />
      <Route
        path="/toursmanage/subsidiarytoursmanage/:orgTourId"
        element={<SubsidiaryToursManage />}
      />
      <Route
        path="dashboard/customerManage/createCustomer"
        element={<CreateCustomer />}
      />
      <Route
        path="dashboard/guideManage/createGuide"
        element={<CreateGuide />}
      />

      <Route
        path="dashboard/customerManage/demoExcel"
        element={<CustomerExportDemo />}
      />
      <Route path="dashboard/customerManage" element={<CustomerManage />} />

      <Route path="dashboard/guideManage" element={<GuideManage />} />
      <Route path="adminList/createAdmin" element={<CreateAdmin />} />

      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/adminList" element={<AdminList />} />
      <Route path="/gifts" element={<Discount />} />
      <Route path="/editProfile" element={<EditProfile />} />
      <Route path="/toursmanage" element={<ToursManage />} />
      <Route path="/trash" element={<Trash />} />

      <Route
        path="/toursmanage/tourdetail/:tourId"
        element={<TourDetailWrapper />}
      />

      <Route path="/notification" element={<NotificationManage />} />

      <Route
        path="/toursmanage/tourdetail/:tourId"
        element={<TourDetailWrapper />}
      /> */}
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/attendance" element={<AttendanceList />} />
    </Routes>
  );
}

export default GuideRoutes;
