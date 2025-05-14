import { useContext, useEffect, useState } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import StatisticCard from "./admin_components/StatisticCard";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import { ToastContainer, toast } from "react-toastify";
import { Context } from "../../context/ContextProvider";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SubsidiaryTourRevenueChart from "./admin_components/SubsidiaryTourRevenueChart";
import ChartTotalRevenue from "./admin_components/ChartTotalRevenue";

function Revenue() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const { user } = useContext(Context);
  const [activeTab, setActiveTab] = useState("left");
  const [userData, setUserData] = useState([]);
  const [tourData, setTourData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: null, order: "asc" });

  const [statistics, setStatistics] = useState({
    revenue: { current: 0, growth: 0 },
    originalTours: { current: 0, growth: 0 },
    subsidiaryTours: { current: 0, growth: 0 },
    customers: { current: 0, growth: 0 },
    guides: { current: 0, growth: 0 },
  });

  const navigate = useNavigate();

  const notify = (message, status) => {
    if (status === "success") return toast.success(message);
    if (status === "error") return toast.error(message);
    if (status === "warn") return toast.warn(message);
  };

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <AdminHeader />

        <div className="dashboardTableContainer">
          <ChartTotalRevenue />
          <SubsidiaryTourRevenueChart />
        </div>
      </div>
      <ToastContainer style={{ width: "auto" }} />
    </div>
  );
}

export default Revenue;
