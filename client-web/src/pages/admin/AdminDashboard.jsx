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

// Định nghĩa các khoảng thời gian
const TIME_PERIODS = {
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
};

function AdminDashboard() {
 
  const [activeTab, setActiveTab] = useState("left");
  const [userData, setUserData] = useState([]);
  const [tourData, setTourData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  

  const [statistics, setStatistics] = useState({
    revenue: { current: 0, growth: 0 },
    originalTours: { current: 0, growth: 0 },
    subsidiaryTours: { current: 0, growth: 0 },
    customers: { current: 0, growth: 0 },
    guides: { current: 0, growth: 0 },
  });

  const [selectedTimePeriod, setSelectedTimePeriod] = useState(
    TIME_PERIODS.MONTH
  );




  const calculateGrowthPercentage = (current, previous) => {
    current = Number(current);
    previous = Number(previous);
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  };



  // Updated calculateRevenue to use revenue field from SubsidiaryTour
  const calculateRevenue = (subsidiaryTours, startDate, endDate) => {
    if (!subsidiaryTours || subsidiaryTours.length === 0) return 0;
    return subsidiaryTours
      .filter((tour) => {
        const tourDate = new Date(tour.createdAt);
        return tourDate >= startDate && tourDate <= endDate && !tour.deleted;
      })
      .reduce((total, tour) => total + (tour.revenue || 0), 0);
  };

  // Hàm định dạng Date thành chuỗi
  const formatDateToString = (date) => {
    return date
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          customersResponse,
          guidesResponse,
          originalToursResponse,
          subsidiaryToursResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/account/customer/"),
          axios.get("http://localhost:5000/account/guide/"),
          axios.get("http://localhost:5000/originalTour/"),
          axios.get("http://localhost:5000/subsidiaryTours/"),
        ]);

        if (!isMounted) return;

        const customers = customersResponse?.data?.users || [];
        const processedCustomers = customers.map((customer) => ({
          ...customer,
          createdAt: customer.createdAt
            ? formatDateToString(new Date(customer.createdAt))
            : formatDateToString(new Date()),
        }));
        setUserData(processedCustomers);

        const guides = guidesResponse?.data?.guides || [];
        const processedGuides = guides.map((guide) => ({
          ...guide,
          createdAt: guide.createdAt
            ? formatDateToString(new Date(guide.createdAt))
            : formatDateToString(new Date()),
        }));

        const originalTours =
          originalToursResponse?.data?.originalTours?.filter(
            (tour) => !tour.deleted
          ) || [];
        const processedOriginalTours = originalTours.map((tour) => ({
          ...tour,
          createdAt: tour.createdAt
            ? formatDateToString(new Date(tour.createdAt))
            : formatDateToString(new Date()),
          createdBy: tour.createdBy?.accountCode || "Unknown",
        }));
        setTourData(processedOriginalTours);

        const subsidiaryTours =
          subsidiaryToursResponse?.data?.subsidiaryTours || [];
        const processedSubsidiaryTours = subsidiaryTours.map((tour) => ({
          ...tour,
          createdAt: tour.createdAt
            ? formatDateToString(new Date(tour.createdAt))
            : formatDateToString(new Date()),
        }));

        updateStatistics(
          processedCustomers,
          processedGuides,
          processedOriginalTours,
          processedSubsidiaryTours
        );

        setFilteredData(
          activeTab === "left" ? processedCustomers : processedOriginalTours
        );
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching statistics:", error);
        
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedTimePeriod, activeTab]);

  const updateStatistics = (
    customers,
    guides,
    originalTours,
    subsidiaryTours
  ) => {
    const now = new Date();
    let currentStartDate, previousStartDate, previousEndDate;

    switch (selectedTimePeriod) {
      case TIME_PERIODS.WEEK:
        currentStartDate = new Date(now);
        currentStartDate.setDate(now.getDate() - 7);
        previousStartDate = new Date(currentStartDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(currentStartDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        break;
      case TIME_PERIODS.MONTH:
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case TIME_PERIODS.QUARTER:
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStartDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousStartDate = new Date(
          now.getFullYear(),
          (currentQuarter - 1) * 3,
          1
        );
        previousEndDate = new Date(now.getFullYear(), currentQuarter * 3, 0);
        break;
      case TIME_PERIODS.YEAR:
        currentStartDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(now.getFullYear(), 0, 0);
        break;
      default:
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    const currentCustomers = customers.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= currentStartDate && itemDate <= now;
    });

    const currentGuides = guides.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= currentStartDate && itemDate <= now;
    });

    const currentOriginalTours = originalTours.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= currentStartDate && itemDate <= now;
    });

    const currentSubsidiaryTours = subsidiaryTours.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= currentStartDate && itemDate <= now;
    });

    const previousCustomers = customers.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= previousStartDate && itemDate <= previousEndDate;
    });

    const previousGuides = guides.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= previousStartDate && itemDate <= previousEndDate;
    });

    const previousOriginalTours = originalTours.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= previousStartDate && itemDate <= previousEndDate;
    });

    const previousSubsidiaryTours = subsidiaryTours.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      return itemDate >= previousStartDate && itemDate <= previousEndDate;
    });

    const currentRevenue = calculateRevenue(
      subsidiaryTours,
      currentStartDate,
      now
    );
    const previousRevenue = calculateRevenue(
      subsidiaryTours,
      previousStartDate,
      previousEndDate
    );

    setStatistics({
      revenue: {
        current: currentRevenue,
        growth: calculateGrowthPercentage(currentRevenue, previousRevenue),
      },
      originalTours: {
        current: currentOriginalTours.length,
        growth: calculateGrowthPercentage(
          currentOriginalTours.length,
          previousOriginalTours.length
        ),
      },
      subsidiaryTours: {
        current: currentSubsidiaryTours.length,
        growth: calculateGrowthPercentage(
          currentSubsidiaryTours.length,
          previousSubsidiaryTours.length
        ),
      },
      customers: {
        current: currentCustomers.length,
        growth: calculateGrowthPercentage(
          currentCustomers.length,
          previousCustomers.length
        ),
      },
      guides: {
        current: currentGuides.length,
        growth: calculateGrowthPercentage(
          currentGuides.length,
          previousGuides.length
        ),
      },
    });
  };

  const formatGrowthPercentage = (growth) => {
    if (growth > 0) {
      return `+${growth}%`;
    } else if (growth < 0) {
      return `${growth}%`;
    } else {
      return "0%";
    }
  };

  const handleTimePeriodChange = (event) => {
    setSelectedTimePeriod(event.target.value);
  };


  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <AdminHeader />
        <div className="timePeriodSelectortotal">
          <div
            className="timePeriodSelector"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              margin: "20px 0",
              padding: "10px",
              backgroundColor: "#f5f7fa",
              borderRadius: "8px",
              maxWidth: "300px",
            }}
          >
            <label
              htmlFor="timePeriodSelect"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Time Period Select:
            </label>
            <select
              id="timePeriodSelect"
              value={selectedTimePeriod}
              onChange={handleTimePeriodChange}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                border: "1px solid #dcdcdc",
                borderRadius: "6px",
                backgroundColor: "#fff",
                color: "#333",
                outline: "none",
                cursor: "pointer",
                width: "150px",
                appearance: "none",
                backgroundImage:
                  'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="%23333" d="M7 10l5 5 5-5z"/></svg>\')',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5087C3")}
              onBlur={(e) => (e.target.style.borderColor = "#dcdcdc")}
            >
              <option value={TIME_PERIODS.WEEK}>WEEK</option>
              <option value={TIME_PERIODS.MONTH}>MONTH</option>
              <option value={TIME_PERIODS.QUARTER}>QUARTER</option>
              <option value={TIME_PERIODS.YEAR}>YEAR</option>
            </select>
          </div>
        </div>
        <div className="statisticCardsContainer">
        <StatisticCard
            title="Revenue current (VND)"
            value={statistics.revenue.current.toLocaleString()}
            percentageChange={formatGrowthPercentage(statistics.revenue.growth)}
            viewMoreLink="revenue"
            backgroundColor="#FD9E5F"
          />
          <StatisticCard
            title="Total Original Tours (tour(s))"
            value={statistics.originalTours.current}
            percentageChange={formatGrowthPercentage(
              statistics.originalTours.growth
            )}
            viewMoreLink="toursmanage"
            backgroundColor="#5087C3"
          />
          <StatisticCard
            title="Total Subsidiary Tours (tour(s))"
            value={statistics.subsidiaryTours.current}
            percentageChange={formatGrowthPercentage(
              statistics.subsidiaryTours.growth
            )}
            viewMoreLink="subtoursmanage"
            backgroundColor="#5087C3"
          />
          <StatisticCard
            title="Total Customers (account(s))"
            value={statistics.customers.current}
            percentageChange={formatGrowthPercentage(
              statistics.customers.growth
            )}
            viewMoreLink="customerManage"
            backgroundColor="#213A58"
          />
          <StatisticCard
            title="Total Guides (account(s))"
            value={statistics.guides.current}
            percentageChange={formatGrowthPercentage(statistics.guides.growth)}
            viewMoreLink="guideManage"
            backgroundColor="#213A58"
          />
        </div>

        <div className="dashboardTableContainer">
          <ChartTotalRevenue />
          <SubsidiaryTourRevenueChart />
        </div>
    </div>
    </div>
  );
}

export default AdminDashboard;
