import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Reuse and extend filter styles
const filterStyles = `
  .filter-container_chartTotalRevenue {
    background: #ffffff;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    border: 1px solid #e0e0e0;
    max-width: 1000px;
    flex-wrap: wrap;
    margin: 0 auto;
    margin-bottom: 20px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  .filter-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }

  .filter-input, .filter-select {
    padding: 8px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    color: #555;
    background-color: #fafafa;
    transition: border-color 0.3s, box-shadow 0.3s;
    min-width: 150px;
  }

  .filter-input:focus, .filter-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }

  @media (max-width: 600px) {
    .filter-container_chartTotalRevenue {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Calculate date range based on filter type
const calculateDateRange = (filterType) => {
  const today = new Date();
  const endDate = formatDate(today);
  let startDate;

  switch (filterType) {
    case "30days":
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = formatDate(thirtyDaysAgo);
      break;
    case "3months":
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      startDate = formatDate(threeMonthsAgo);
      break;
    case "6months":
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      startDate = formatDate(sixMonthsAgo);
      break;
    case "12months":
      const twelveMonthsAgo = new Date(today);
      twelveMonthsAgo.setMonth(today.getMonth() - 12);
      startDate = formatDate(twelveMonthsAgo);
      break;
    case "all":
      startDate = "";
      break;
    default: // Default to 30 days
      const defaultThirtyDaysAgo = new Date(today);
      defaultThirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = formatDate(defaultThirtyDaysAgo);
  }

  return { startDate, endDate: filterType === "all" ? "" : endDate };
};

export default function ChartTotalRevenue() {
  const [filterType, setFilterType] = useState("30days"); // Default to 30 days
  const [originalToursData, setOriginalToursData] = useState([]);
  const [subsidiaryToursData, setSubsidiaryToursData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [revenueToursCount, setRevenueToursCount] = useState(0);
  const [startDate, setStartDate] = useState(calculateDateRange("30days").startDate);
  const [endDate, setEndDate] = useState(calculateDateRange("30days").endDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update startDate and endDate when filterType changes
  useEffect(() => {
    if (filterType !== "custom") {
      const { startDate: newStartDate, endDate: newEndDate } = calculateDateRange(filterType);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  }, [filterType]);

  // Fetch original tour data
  const fetchOriginalTours = async () => {
    try {
      const response = await axios.get("http://localhost:5000/originalTours/");
      console.log("Original tours data:", response.data);
      if (response.data && Array.isArray(response.data.originalTours)) {
        setOriginalToursData(response.data.originalTours);
      } else {
        setOriginalToursData([]);
        setError("Invalid original tours data format");
      }
    } catch (error) {
      console.error("Error fetching original tours data:", error);
      setError("Failed to fetch original tours data");
      setOriginalToursData([]);
    }
  };

  // Fetch subsidiary tour data
  const fetchSubsidiaryTours = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/subsidiaryTours/"
      );
      console.log("Subsidiary tours data:", response.data.subsidiaryTours);
      if (response.data && Array.isArray(response.data.subsidiaryTours)) {
        setSubsidiaryToursData(response.data.subsidiaryTours);
      } else {
        setSubsidiaryToursData([]);
        setError("Invalid subsidiary tours data format");
      }
    } catch (error) {
      console.error("Error fetching subsidiary tours data:", error);
      setError("Failed to fetch subsidiary tours data");
      setSubsidiaryToursData([]);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchOriginalTours(), fetchSubsidiaryTours()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Process revenue data for the chart
  const processRevenueData = () => {
    if (originalToursData.length === 0 || subsidiaryToursData.length === 0) {
      setChartData({ labels: [], datasets: [] });
      setRevenueToursCount(0);
      return;
    }

    // Filter subsidiary tours by createdAt within date range
    const filteredSubsidiaryTours = subsidiaryToursData.filter((subTour) => {
      if (!subTour.createdAt) {
        console.warn("Subsidiary tour missing creation date:", subTour);
        return false;
      }

      const creationDate = new Date(subTour.createdAt);
      if (isNaN(creationDate.getTime())) {
        console.warn("Invalid date for subsidiary tour:", subTour);
        return false;
      }

      const isAfterStartDate = startDate
        ? creationDate >= new Date(startDate)
        : true;
      const isBeforeEndDate = endDate
        ? creationDate <= new Date(endDate)
        : true;

      return (
        isAfterStartDate &&
        isBeforeEndDate &&
        !subTour.isCanceled &&
        !subTour.deleted
      );
    });

    console.log("Filtered subsidiary tours:", filteredSubsidiaryTours.length);

    // Aggregate revenue by original tour
    const revenueByOriginalTour = filteredSubsidiaryTours.reduce(
      (acc, subTour) => {
        const originalTourId = subTour.originalTourId?._id?.toString();
        if (!originalTourId) return acc;

        const originalTour = originalToursData.find(
          (tour) => tour._id.toString() === originalTourId
        );
        if (!originalTour) return acc;

        const tourId = originalTour._id;
        const tourTitle =
          originalTour.title || `Tour ${originalTour.originalTourCode}`;
        const revenue = subTour.revenue || 0;

        if (!acc[tourId]) {
          acc[tourId] = { title: tourTitle, revenue: 0 };
        }
        acc[tourId].revenue += revenue;

        return acc;
      },
      {}
    );

    // Filter out tours with zero revenue
    const validRevenueTours = Object.entries(revenueByOriginalTour)
      .filter(([_, tour]) => tour.revenue > 0)
      .reduce((acc, [id, tour]) => {
        acc[id] = tour;
        return acc;
      }, {});

    const labels = Object.values(validRevenueTours).map((tour) => tour.title);
    const revenues = Object.values(validRevenueTours).map((tour) => tour.revenue);

    setChartData({
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenues,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    });
    setRevenueToursCount(Object.keys(validRevenueTours).length);
  };

  useEffect(() => {
    if (originalToursData.length > 0 && subsidiaryToursData.length > 0) {
      processRevenueData();
    }
  }, [originalToursData, subsidiaryToursData, startDate, endDate, filterType]);

  // Event handlers for date and filter changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
    setFilterType("custom");
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  return (
    <div className="chartRevenue">
      <style>{filterStyles}</style>

      <div className="filter-container_chartTotalRevenue">
        <div className="filter-group">
          <label className="filter-label">Filter By</label>
          <select
            className="filter-select"
            value={filterType}
            onChange={handleFilterChange}
          >
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
        {filterType === "custom" && (
          <>
            <div className="filter-group">
              <label className="filter-label">Start Date</label>
              <input
                type="date"
                className="filter-input"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">End Date</label>
              <input
                type="date"
                className="filter-input"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
              />
            </div>
          </>
        )}
      </div>

      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
      {loading && <div style={{ margin: "10px 0" }}>Loading data...</div>}

      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
        {chartData.labels.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: `Total Revenue (${
                    filterType === "all" ? "All Time" : (startDate || "Start") + " - " + (endDate || "End")
                  })`,
                },
                legend: {
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `${tooltipItem.raw} (VND)`,
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Original Tours",
                  },
                  ticks: {
                    autoSkip: false,
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Revenue (VND)",
                  },
                  beginAtZero: true,
                },
              },
              
            }}
            style={{
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "10px",
              padding: "10px",
              width: "100%",
              
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "ghostwhite",
              border: "1px solid #dee2e6",
              borderRadius: "10px",
            }}
          >
            No data available for the selected date range
          </div>
        )}
      </div>
    </div>
  );
}