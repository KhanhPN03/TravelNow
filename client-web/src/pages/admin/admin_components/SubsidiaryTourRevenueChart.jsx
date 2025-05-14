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
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// CSS styles for filter (reused from OriginalTourChart)
const filterStyles = `
  .filter-container {
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
    margin: 0 auto;
    margin-bottom: 20px;
    flex-wrap: wrap;
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

  .filter-select, .filter-input {
    padding: 8px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    color: #555;
    background-color: #fafafa;
    transition: border-color 0.3s, box-shadow 0.3s;
    min-width: 150px;
  }

  .filter-select:focus, .filter-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }

  @media (max-width: 600px) {
    .filter-container {
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

// Calculate default date range (last 30 days)
const getDefaultDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return {
    startDate: formatDate(thirtyDaysAgo),
    endDate: formatDate(today),
  };
};

export default function SubsidiaryTourRevenueChart() {
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  const [originalToursData, setOriginalToursData] = useState([]);
  const [subsidiaryToursData, setSubsidiaryToursData] = useState([]);
  const [selectedOriginalTour, setSelectedOriginalTour] = useState("");
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [isAll, setIsAll] = useState(false);
  const [filterOption, setFilterOption] = useState("last30days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch original tour data
  const fetchOriginalTours = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/originalTour/");
      if (response.data && Array.isArray(response.data.originalTours)) {
        setOriginalToursData(response.data.originalTours);
      } else {
        console.warn("Invalid original tours data format:", response.data);
        setOriginalToursData([]);
        setError("Invalid original tours data format");
      }
    } catch (error) {
      console.error("Error fetching original tours data:", error);
      setError("Failed to fetch original tours data");
      setOriginalToursData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subsidiary tours based on selected original tour
  const fetchSubsidiaryTours = async () => {
    if (!selectedOriginalTour) {
      setSubsidiaryToursData([]);
      setChartData({ labels: [], datasets: [] });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/subsidiaryTours/getByOriginal/${selectedOriginalTour}`
      );
      if (response.data && Array.isArray(response.data.subsidiaryTours)) {
        setSubsidiaryToursData(response.data.subsidiaryTours);
      } else {
        console.warn("Invalid subsidiary tours data format:", response.data);
        setSubsidiaryToursData([]);
        setError("Invalid subsidiary tours data format");
      }
    } catch (error) {
      console.error("Error fetching subsidiary tours data:", error);
      setError("Failed to fetch subsidiary tours data");
      setSubsidiaryToursData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOriginalTours();
  }, []);

  useEffect(() => {
    fetchSubsidiaryTours();
  }, [selectedOriginalTour]);

  // Filter and process data for bar chart
  const filterAndSortData = () => {
    if (subsidiaryToursData.length === 0 || !selectedOriginalTour) {
      setChartData({ labels: [], datasets: [] });
      return;
    }

    // Determine date range for filtering
    let effectiveStartDate = startDate;
    let effectiveEndDate = endDate;

    if (isAll && !startDate && !endDate) {
      const dates = subsidiaryToursData
        .filter((tour) => tour.createdAt)
        .map((tour) => new Date(tour.createdAt));
      effectiveStartDate = new Date(Math.min(...dates))
        .toISOString()
        .split("T")[0];
      effectiveEndDate = new Date().toISOString().split("T")[0];
    }

    // Filter subsidiary tours by date range
    const filteredSubsidiaryTours = subsidiaryToursData.filter((tour) => {
      if (!tour.createdAt) {
        console.warn("Subsidiary tour missing creation date:", tour);
        return false;
      }

      const creationDate = new Date(tour.createdAt);
      if (isNaN(creationDate.getTime())) {
        console.warn("Invalid date for subsidiary tour:", tour);
        return false;
      }

      const isAfterStartDate = effectiveStartDate
        ? creationDate >= new Date(effectiveStartDate)
        : true;
      const isBeforeEndDate = effectiveEndDate
        ? creationDate <= new Date(effectiveEndDate)
        : true;

      return isAfterStartDate && isBeforeEndDate;
    });

    // Prepare chart data
    const labels = filteredSubsidiaryTours.map(
      (tour) => tour.tourCode || `Tour ${tour.subTourCode}`
    );
    const revenueData = filteredSubsidiaryTours.map(
      (tour) => tour.revenue || 0
    );

    setChartData({
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  };

  useEffect(() => {
    filterAndSortData();
  }, [subsidiaryToursData, startDate, endDate, isAll]);

  // Event handlers
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterOption(value);

    const end = new Date();
    const start = new Date();

    switch (value) {
      case "last7days":
        start.setDate(end.getDate() - 7);
        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
        setIsAll(false);
        break;
      case "last15days":
        start.setDate(end.getDate() - 15);
        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
        setIsAll(false);
        break;
      case "last30days":
        start.setDate(end.getDate() - 30);
        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
        setIsAll(false);
        break;
      case "all":
        setStartDate("");
        setEndDate("");
        setIsAll(true);
        break;
      case "custom":
        setStartDate("");
        setEndDate("");
        setIsAll(false);
        break;
      case "none":
        setStartDate("");
        setEndDate("");
        setIsAll(false);
        break;
      default:
        break;
    }
  };

  const handleOriginalTourChange = (e) => {
    setSelectedOriginalTour(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
    setFilterOption("custom");
    setIsAll(false);
  };

  return (
    <div className="chartRevenue">
      <style>{filterStyles}</style>

      <div className="filter-container">
        <div className="filter-group filterDataTitle">
          <label className="filter-label">Select Original Tour</label>
          <select
            className="filter-select"
            value={selectedOriginalTour}
            onChange={handleOriginalTourChange}
          >
            <option value="">-- Select an Original Tour --</option>
            {originalToursData.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.name || `Tour ${tour.title} - ${tour.originalTourCode}`}
              </option>
            ))}
          </select>
        </div>
        <div className="chartOriTourOptionDate">
          <div className="filter-group">
            <label className="filter-label">Filter Data</label>
            <select
              className="filter-select"
              value={filterOption}
              onChange={handleFilterChange}
            >
              <optgroup label="Quick Filters">
                <option value="last7days">Last 7 Days</option>
                <option value="last15days">Last 15 Days</option>
                <option value="last30days">Last 30 Days</option>
              </optgroup>
              <optgroup label="Special">
                <option value="none">None</option>
                <option value="all">All Data</option>
                <option value="custom">Custom Date Range</option>
              </optgroup>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Start Date</label>
            <input
              type="date"
              className="filter-input"
              name="startDate"
              value={startDate}
              onChange={handleDateChange}
              disabled={isAll && !startDate}
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
              disabled={isAll && !endDate}
            />
          </div>
        </div>
      </div>

      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
      {loading && <div style={{ margin: "10px 0" }}>Loading data...</div>}

      <div
        style={{
          flex: "1 1 100%",
          minWidth: "400px",
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {chartData.labels.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: `Revenue of Subsidiary Tours for ${
                    selectedOriginalTour
                      ? originalToursData.find(
                          (t) => t._id === selectedOriginalTour
                        )?.name || "Selected Tour"
                      : "No Tour Selected"
                  }`,
                },
                legend: {
                  position: "top",
                  labels: {
                    padding: 12, // Adds 12px padding below the legend (margin-bottom effect)
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) =>
                      `${
                        tooltipItem.dataset.label
                      }: $${tooltipItem.raw.toLocaleString()}`,
                  },
                },
                datalabels: {
                  display: true,
                  color: "black",
                  font: { weight: "bold", size: 12 },
                  anchor: "end",
                  align: "top",
                  formatter: (value) => `${value.toLocaleString()}₫`,
                },
              },
              scales: {
                x: {
                  title: { display: true, text: "Subsidiary Tours" },
                },
                y: {
                  title: { display: true, text: "Revenue (VND)" },
                  beginAtZero: true,
                },
              },
            }}
            style={{
              width: "100%",
              height: "auto",
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "10px",
              padding: "10px",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "ghostwhite",
              border: "1px solid #dee2e6",
              borderRadius: "10px",
            }}
          >
            {selectedOriginalTour
              ? "No subsidiary tour revenue data available for the selected filters"
              : "Please select an original tour to view subsidiary tour revenue"}
          </div>
        )}
      </div>
    </div>
  );
}