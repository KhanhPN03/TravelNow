import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
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
  LineElement,
  PointElement,
  ArcElement,
  ChartDataLabels
);

// CSS styles for filter
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
    max-width: 1200px;
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

export default function OriginalTourChart() {
  const [originalToursData, setOriginalToursData] = useState([]);
  const [cities, setCities] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [timePeriod, setTimePeriod] = useState("year"); // Default to "year" for total
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAll, setIsAll] = useState(true); // Default to true (Show All Data)
  const [isTotal, setIsTotal] = useState(true); // Default to true (Total Data)
  const [selectedTourType, setSelectedTourType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState("all"); // Default to "all"

  // Fetch city data from static JSON file
  useEffect(() => {
    fetch("http://localhost:4000/city.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Cities data loaded:", data.length);
        setCities(data);
      })
      .catch((error) => {
        console.error("Error loading cities JSON:", error);
        setError("Failed to load city data");
      });
  }, []);

  // Helper function to get city name from code
  const getCityNameFromCode = (code) => {
    if (!code) return "Unknown Location";
    const city = cities.find((city) => city.code === code);
    return city ? city.name : code;
  };

  // Fetch original tour data
  const fetchOriginalTours = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/originalTour/");
      console.log("Original tours data:", response.data);

      if (response.data && Array.isArray(response.data.originalTours)) {
        // Lọc chỉ lấy các tour có deleted = false
        const activeTours = response.data.originalTours.filter(
          (tour) => tour.deleted === false
        );
        setOriginalToursData(activeTours);
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

  useEffect(() => {
    fetchOriginalTours();
    const intervalId = setInterval(fetchOriginalTours, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to format date based on selected time period
  const formatDate = (date, period) => {
    if (!date) return "Unknown Date";

    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "Invalid Date";

    switch (period) {
      case "week": {
        const startOfWeek = new Date(newDate);
        startOfWeek.setDate(newDate.getDate() - newDate.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const startStr = `${startOfWeek.getDate()}/${
          startOfWeek.getMonth() + 1
        }`;
        const endStr = `${endOfWeek.getDate()}/${
          endOfWeek.getMonth() + 1
        }/${endOfWeek.getFullYear()}`;
        return `${startStr} - ${endStr}`;
      }
      case "month":
        return `${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
      case "year":
      case "multiple_years":
        return `${newDate.getFullYear()}`;
      default:
        return newDate.toLocaleDateString();
    }
  };

  // Get all places/destinations from tour data
  const getTourPlaces = (tour) => {
    if (!tour) return ["Unknown Destination"];

    const places = [];

    if (tour.place) {
      if (Array.isArray(tour.place)) {
        // Nếu place là mảng, lấy tất cả các code và ánh xạ thành tên
        places.push(...tour.place.map((code) => getCityNameFromCode(code)));
      } else if (typeof tour.place === "object") {
        // Nếu place là object, kiểm tra các trường có thể chứa code
        if (tour.place.code) {
          places.push(getCityNameFromCode(tour.place.code));
        }
        if (tour.place.codes && Array.isArray(tour.place.codes)) {
          // Nếu place có trường codes là mảng
          places.push(
            ...tour.place.codes.map((code) => getCityNameFromCode(code))
          );
        }
        if (tour.place.name) {
          places.push(tour.place.name);
        }
        if (tour.place.names && Array.isArray(tour.place.names)) {
          // Nếu place có trường names là mảng
          places.push(...tour.place.names);
        }
      } else if (typeof tour.place === "string") {
        // Nếu place là chuỗi, ánh xạ trực tiếp
        places.push(getCityNameFromCode(tour.place));
      }
    }

    // Kiểm tra các trường khác có thể chứa địa điểm
    const possibleFields = ["destination", "locations", "tourDestinations"];
    for (const field of possibleFields) {
      if (tour[field]) {
        if (typeof tour[field] === "string") {
          places.push(getCityNameFromCode(tour[field]));
        } else if (Array.isArray(tour[field])) {
          places.push(...tour[field].map((item) => getCityNameFromCode(item)));
        } else if (typeof tour[field] === "object") {
          if (tour[field].code) {
            places.push(getCityNameFromCode(tour[field].code));
          }
          if (tour[field].name) {
            places.push(tour[field].name);
          }
        }
      }
    }

    // Loại bỏ các giá trị trùng lặp và giá trị không hợp lệ
    const uniquePlaces = [
      ...new Set(
        places.filter((place) => place && place !== "Unknown Location")
      ),
    ];
    return uniquePlaces.length > 0 ? uniquePlaces : ["Unknown Destination"];
  };

  // Filter and process data for charts
  const filterAndSortData = () => {
    if (originalToursData.length === 0) {
      setChartData({ labels: [], datasets: [] });
      setPieChartData({ labels: [], datasets: [] });
      return;
    }

    console.log("Filtering data with parameters:", {
      timePeriod,
      startDate,
      endDate,
      selectedTourType,
      isAll,
      isTotal,
      toursCount: originalToursData.length,
      citiesCount: cities.length,
    });

    // Determine date range for filtering
    let effectiveStartDate = startDate;
    let effectiveEndDate = endDate;

    if (isAll && !startDate && !endDate) {
      // If Show All Data is selected, use the earliest and latest dates from data
      const dates = originalToursData
        .filter((tour) => tour.createdAt)
        .map((tour) => new Date(tour.createdAt));
      effectiveStartDate = new Date(Math.min(...dates))
        .toISOString()
        .split("T")[0];
      effectiveEndDate = new Date().toISOString().split("T")[0]; // Current date
    }

    let filteredData = originalToursData.filter((tour) => {
      if (!tour.createdAt) {
        console.warn("Tour missing creation date:", tour);
        return false;
      }

      const creationDate = new Date(tour.createdAt);
      if (isNaN(creationDate.getTime())) {
        console.warn("Invalid date for tour:", tour);
        return false;
      }

      const isAfterStartDate = effectiveStartDate
        ? creationDate >= new Date(effectiveStartDate)
        : true;
      const isBeforeEndDate = effectiveEndDate
        ? creationDate <= new Date(effectiveEndDate)
        : true;
      const tourType = tour.duration === 1 ? "ADVENTURE" : "LONG-TRIP";
      const isMatchingTourType =
        selectedTourType === "all" || tourType === selectedTourType;

      return isAfterStartDate && isBeforeEndDate && isMatchingTourType;
    });

    console.log("Filtered tours:", filteredData.length);

    if (filteredData.length === 0) {
      setChartData({ labels: [], datasets: [] });
      setPieChartData({ labels: [], datasets: [] });
      return;
    }

    if (isTotal) {
      // If Total is selected, aggregate all data into a single bar
      const totalAdventure = filteredData.reduce(
        (acc, tour) => acc + (tour.duration === 1 ? 1 : 0),
        0
      );
      const totalLongTrip = filteredData.reduce(
        (acc, tour) => acc + (tour.duration !== 1 ? 1 : 0),
        0
      );
      const totalTours = totalAdventure + totalLongTrip;

      const label = isAll
        ? "All Data Total"
        : `${effectiveStartDate || "Start"} - ${effectiveEndDate || "End"}`;

      setChartData({
        labels: [label],
        datasets: [
          {
            label: "Adventure Tours",
            data: [totalAdventure],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
          {
            label: "Long Trip Tours",
            data: [totalLongTrip],
            backgroundColor: "rgba(153, 102, 255, 0.2)",
          },
          {
            label: "Total Tours",
            data: [totalTours],
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: "rgba(0, 0, 0, 1)",
            borderWidth: 2,
            type: "line",
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: "rgba(0, 0, 0, 1)",
            pointBorderColor: "rgba(0, 0, 0, 1)",
          },
        ],
      });
    } else {
      // Group data by time period
      const groupedData = filteredData.reduce((acc, tour) => {
        const tourType = tour.duration === 1 ? "ADVENTURE" : "LONG-TRIP";
        const date = formatDate(tour.createdAt, timePeriod);

        if (!acc[date]) {
          acc[date] = { ADVENTURE: 0, LONG_TRIP: 0 };
        }

        if (tourType === "ADVENTURE") {
          acc[date].ADVENTURE += 1;
        } else {
          acc[date].LONG_TRIP += 1;
        }

        return acc;
      }, {});

      console.log("Grouped data:", groupedData);

      const labels = Object.keys(groupedData).sort((a, b) => {
        if (timePeriod === "week") {
          const [startA] = a.split(" - ");
          const [startB] = b.split(" - ");
          const [dayA, monthA] = startA.split("/").map(Number);
          const [dayB, monthB] = startB.split("/").map(Number);
          return (
            new Date(2023, monthA - 1, dayA) - new Date(2023, monthB - 1, dayB)
          );
        }
        return a.localeCompare(b);
      });

      const adventureData = labels.map(
        (date) => groupedData[date].ADVENTURE || 0
      );
      const longTripData = labels.map(
        (date) => groupedData[date].LONG_TRIP || 0
      );
      const totalData = labels.map(
        (date) =>
          (groupedData[date].ADVENTURE || 0) +
          (groupedData[date].LONG_TRIP || 0)
      );

      setChartData({
        labels,
        datasets: [
          {
            label: "Adventure Tours",
            data: adventureData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
          {
            label: "Long Trip Tours",
            data: longTripData,
            backgroundColor: "rgba(153, 102, 255, 0.2)",
          },
          {
            label: "Total Tours",
            data: totalData,
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: "rgba(0, 0, 0, 1)",
            borderWidth: 2,
            type: "line",
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: "rgba(0, 0, 0, 1)",
            pointBorderColor: "rgba(0, 0, 0, 1)",
          },
        ],
      });
    }

    // Pie Chart data: Count all places
    const destinationCount = filteredData.reduce((acc, tour) => {
      const places = getTourPlaces(tour); // Lấy tất cả các place từ tour
      places.forEach((place) => {
        if (place) {
          acc[place] = (acc[place] || 0) + 1;
        }
      });
      return acc;
    }, {});

    console.log("Destination counts:", destinationCount);

    const totalDestinations = Object.values(destinationCount).reduce(
      (acc, count) => acc + count,
      0
    );

    if (totalDestinations === 0) {
      setPieChartData({
        labels: ["No Destination Data"],
        datasets: [
          {
            data: [100],
            backgroundColor: ["rgba(200, 200, 200, 0.6)"],
            label: "No Data Available",
          },
        ],
      });
      return;
    }

    const sortedDestinations = Object.entries(destinationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topDestinations = sortedDestinations.map(([dest]) => dest);
    const topDestinationsCounts = sortedDestinations.map(([_, count]) => count);
    const topDestinationsPercentage = topDestinationsCounts.map((count) =>
      ((count / totalDestinations) * 100).toFixed(2)
    );

    const otherCount = Object.entries(destinationCount)
      .filter(([dest]) => !topDestinations.includes(dest))
      .reduce((acc, [_, count]) => acc + count, 0);

    const finalLabels = [...topDestinations];
    const finalCounts = [...topDestinationsPercentage];

    if (otherCount > 0) {
      finalLabels.push("Other Places");
      finalCounts.push(((otherCount / totalDestinations) * 100).toFixed(2));
    }

    console.log("Pie Chart Data:", {
      labels: finalLabels,
      data: finalCounts,
    });

    setPieChartData({
      labels: finalLabels,
      datasets: [
        {
          data: finalCounts,
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(231, 233, 237, 0.6)",
            "rgba(201, 203, 207, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          label: "Top Destinations",
        },
      ],
    });
  };

  useEffect(() => {
    if (cities.length > 0) {
      filterAndSortData();
    }
  }, [
    originalToursData,
    cities,
    timePeriod,
    startDate,
    endDate,
    isAll,
    isTotal,
    selectedTourType,
  ]);

  // Event handlers
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterOption(value);

    const end = new Date();
    const start = new Date();

    switch (value) {
      case "last7days":
        start.setDate(end.getDate() - 7);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
        setIsAll(false);
        break;
      case "last15days":
        start.setDate(end.getDate() - 15);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
        setIsAll(false);
        break;
      case "last30days":
        start.setDate(end.getDate() - 30);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
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

  const handleViewByChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const handleTotalChange = (e) => {
    const value = e.target.value === "total";
    setIsTotal(value);
    if (value) {
      setStartDate(isAll ? "" : startDate); // Keep startDate if not in All mode
      setEndDate(isAll ? "" : endDate); // Keep endDate if not in All mode
      setFilterOption(isAll ? "all" : filterOption); // Keep "all" if in All mode
    }
  };

  const handleTourTypeChange = (e) => {
    setSelectedTourType(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
    setFilterOption("custom");
    setIsAll(false);
  };

  return (
    <div>
      <style>{filterStyles}</style>

      <div className="filter-container">
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
          <label className="filter-label">View By</label>
          <select
            className="filter-select"
            value={timePeriod}
            onChange={handleViewByChange}
            disabled={isTotal} // Disable View By when Total is selected
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Total Data</label>
          <select
            className="filter-select"
            value={isTotal ? "total" : "no"}
            onChange={handleTotalChange}
          >
            <option value="no">No</option>
            <option value="total">Yes</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Tour Type</label>
          <select
            className="filter-select"
            value={selectedTourType}
            onChange={handleTourTypeChange}
          >
            <option value="all">All Tours</option>
            <option value="ADVENTURE">Adventure</option>
            <option value="LONG-TRIP">Long Trip</option>
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
            disabled={isAll && !startDate} // Disable unless custom dates are set
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
            disabled={isAll && !endDate} // Disable unless custom dates are set
          />
        </div>
      </div>

      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
      {loading && <div style={{ margin: "10px 0" }}>Loading data...</div>}

      {!loading && (
        <div style={{ margin: "10px 0", fontSize: "0.9em", color: "#666" }}>
          Loaded {originalToursData.length} original tours and {cities.length}{" "}
          cities
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 60%", minWidth: "400px" }}>
          {chartData.labels.length > 0 ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: `Original Tours by Type (${
                      selectedTourType === "all" ? "All" : selectedTourType
                    })`,
                  },
                  legend: { position: "top" },
                  tooltip: { mode: "index", intersect: false },
                  datalabels: {
                    display: false,
                    color: "black",
                    font: { weight: "bold", size: 12 },
                    anchor: "end",
                    align: "top",
                  },
                },
                scales: {
                  x: {
                    stacked: true,
                    title: { display: true, text: "Time" },
                  },
                  y: {
                    stacked: true,
                    title: { display: true, text: "Number of Original Tours" },
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
              No tour data available for the selected filters
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 30%", minWidth: "300px" }}>
          {pieChartData.labels.length > 0 ? (
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  title: { display: true, text: "Top 10 Destinations" },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) =>
                        `${tooltipItem.label}: ${tooltipItem.raw}%`,
                    },
                  },
                  datalabels: {
                    display: true,
                    color: "black",
                    font: { weight: "bold", size: 12 },
                    formatter: (value) => (value > 5 ? `${value}%` : ""),
                  },
                  legend: {
                    display: true,
                    position: "bottom",
                    labels: { font: { size: 11 }, boxWidth: 15 },
                  },
                },
                radius: "100%",
                cutout: 0,
              }}
              style={{
                width: "100%",
                height: "auto",
                marginBottom: "30px",
                marginLeft: "24px",
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
                marginTop: "30px",
              }}
            >
              No destination data available for the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
