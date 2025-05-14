import React, { useEffect, useState } from "react";
import axios from "axios";
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

export default function CompletedTourChart() {
  const [completedToursData, setCompletedToursData] = useState([]);
  const [cities, setCities] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [timePeriod, setTimePeriod] = useState("year");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("2025-04-20"); // Match current date
  const [isAll, setIsAll] = useState(true);
  const [isTotal, setIsTotal] = useState(true);
  const [selectedTourType, setSelectedTourType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState("all");

  // Fetch city data
  useEffect(() => {
    fetch("http://localhost:4000/city.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Cities data loaded:", data);
        setCities(data);
      })
      .catch((error) => {
        console.error("Error loading cities JSON:", error);
        setError("Failed to load city data. Using raw place codes.");
      });
  }, []);

  // Helper function to get city name from code
  const getCityNameFromCode = (code) => {
    if (!code) return "Unknown Location";
    const city = cities.find((city) => city.code === code);
    return city ? city.name : code;
  };

  // Fetch completed tours data
  const fetchCompletedTours = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/subsidiaryTours/"
      );
      if (
        response.data &&
        response.data.message === "success" &&
        Array.isArray(response.data.subsidiaryTours)
      ) {
        console.log("Subsidiary tours fetched:", response.data.subsidiaryTours);
        setCompletedToursData(response.data.subsidiaryTours);
      } else {
        console.warn("Invalid subsidiary tours data format:", response.data);
        setCompletedToursData([]);
        setError("Invalid subsidiary tours data format");
      }
    } catch (error) {
      console.error("Error fetching subsidiary tours data:", error);
      setError("Failed to fetch subsidiary tours data");
      setCompletedToursData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTours();
    const completedInterval = setInterval(fetchCompletedTours, 30000);
    return () => clearInterval(completedInterval);
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

  // Function to determine tour type from original tour data
  const getTourType = (originalTourId) => {
    if (!originalTourId || !originalTourId.duration) return "UNKNOWN";
    return originalTourId.duration === 1 ? "ADVENTURE" : "LONG-TRIP";
  };

  // Get all places/destinations from original tour data
  const getOriginalTourPlaces = (originalTourId) => {
    if (!originalTourId) return ["Unknown Destination"];

    const places = [];

    if (originalTourId.place) {
      if (Array.isArray(originalTourId.place)) {
        // Nếu place là mảng, lấy tất cả các code và ánh xạ thành tên
        places.push(
          ...originalTourId.place.map((code) => getCityNameFromCode(code))
        );
      } else if (typeof originalTourId.place === "object") {
        // Nếu place là object, kiểm tra các trường có thể chứa code
        if (originalTourId.place.code) {
          places.push(getCityNameFromCode(originalTourId.place.code));
        }
        if (
          originalTourId.place.codes &&
          Array.isArray(originalTourId.place.codes)
        ) {
          // Nếu place có trường codes là mảng
          places.push(
            ...originalTourId.place.codes.map((code) =>
              getCityNameFromCode(code)
            )
          );
        }
        if (originalTourId.place.name) {
          places.push(originalTourId.place.name);
        }
        if (
          originalTourId.place.names &&
          Array.isArray(originalTourId.place.names)
        ) {
          // Nếu place có trường names là mảng
          places.push(...originalTourId.place.names);
        }
      } else if (typeof originalTourId.place === "string") {
        // Nếu place là chuỗi, ánh xạ trực tiếp
        places.push(getCityNameFromCode(originalTourId.place));
      }
    }

    // Kiểm tra các trường khác có thể chứa địa điểm
    const possibleFields = ["destination", "locations", "tourDestinations"];
    for (const field of possibleFields) {
      if (originalTourId[field]) {
        if (typeof originalTourId[field] === "string") {
          places.push(getCityNameFromCode(originalTourId[field]));
        } else if (Array.isArray(originalTourId[field])) {
          places.push(
            ...originalTourId[field].map((item) => getCityNameFromCode(item))
          );
        } else if (typeof originalTourId[field] === "object") {
          if (originalTourId[field].code) {
            places.push(getCityNameFromCode(originalTourId[field].code));
          }
          if (originalTourId[field].name) {
            places.push(originalTourId[field].name);
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
    if (completedToursData.length === 0) {
      console.log("No subsidiary tours data available");
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
      toursCount: completedToursData.length,
      citiesCount: cities.length,
    });

    let effectiveStartDate = startDate;
    let effectiveEndDate = endDate;

    if (isAll && !startDate && !endDate) {
      const dates = completedToursData
        .filter((tour) => tour.createdAt)
        .map((tour) => new Date(tour.createdAt));
      if (dates.length === 0) {
        console.log("No valid createdAt dates found");
        setChartData({ labels: [], datasets: [] });
        setPieChartData({ labels: [], datasets: [] });
        return;
      }
      effectiveStartDate = new Date(Math.min(...dates))
        .toISOString()
        .split("T")[0];
      effectiveEndDate = new Date().toISOString().split("T")[0];
      console.log("Effective date range:", {
        effectiveStartDate,
        effectiveEndDate,
      });
    }

    let filteredData = completedToursData.filter((tour) => {
      const creationDate = new Date(tour.createdAt);
      if (isNaN(creationDate.getTime())) {
        console.log("Invalid createdAt for tour:", tour._id);
        return false;
      }
      const isAfterStartDate = effectiveStartDate
        ? creationDate >= new Date(effectiveStartDate)
        : true;
      const isBeforeEndDate = effectiveEndDate
        ? creationDate <= new Date(effectiveEndDate + "T23:59:59.999Z")
        : true;
      const tourType = getTourType(tour.originalTourId);
      const isMatchingTourType =
        selectedTourType === "all" || tourType === selectedTourType;
      return isAfterStartDate && isBeforeEndDate && isMatchingTourType;
    });

    console.log("Filtered tours:", filteredData);

    if (filteredData.length === 0) {
      console.log("No tours passed the filter");
      setChartData({ labels: [], datasets: [] });
      setPieChartData({ labels: [], datasets: [] });
      return;
    }

    if (isTotal) {
      const totalAdventure = filteredData.reduce(
        (acc, tour) =>
          acc + (getTourType(tour.originalTourId) === "ADVENTURE" ? 1 : 0),
        0
      );
      const totalLongTrip = filteredData.reduce(
        (acc, tour) =>
          acc + (getTourType(tour.originalTourId) === "LONG-TRIP" ? 1 : 0),
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
            label: "Total Susidiary Tours",
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
      const groupedData = filteredData.reduce((acc, tour) => {
        const tourType = getTourType(tour.originalTourId);
        const date = formatDate(tour.createdAt, timePeriod);
        if (!acc[date]) {
          acc[date] = { ADVENTURE: 0, LONG_TRIP: 0 };
        }
        if (tourType === "ADVENTURE") {
          acc[date].ADVENTURE += 1;
        } else if (tourType === "LONG-TRIP") {
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
            label: "Total Susidiary Tours",
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
      const places = getOriginalTourPlaces(tour.originalTourId); // Lấy tất cả các place từ originalTourId
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

    console.log("Pie Chart Data:", { labels: finalLabels, data: finalCounts });

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
    filterAndSortData();
  }, [
    completedToursData,
    cities,
    timePeriod,
    startDate,
    endDate,
    isAll,
    isTotal,
    selectedTourType,
  ]);

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
      setStartDate(isAll ? "" : startDate);
      setEndDate(isAll ? "" : endDate);
      setFilterOption(isAll ? "all" : filterOption);
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
            disabled={isTotal}
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

      {error && (
        <div style={{ color: "red", margin: "10px 0" }}>
          {error}
          <button
            onClick={() => {
              setError(null);
              fetchCompletedTours();
            }}
            style={{ marginLeft: "10px" }}
          >
            Retry
          </button>
        </div>
      )}
      {loading && <div style={{ margin: "10px 0" }}>Loading data...</div>}

      {!loading && (
        <div style={{ margin: "10px 0", fontSize: "0.9em", color: "#666" }}>
          Loaded {completedToursData.length} tours and {cities.length} cities
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
                    text: `Tours Susidiary by Type (${
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
                    title: { display: true, text: "Number of Susidiary Tours" },
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
              No tour data available. Please try adjusting the date range or
              tour type.
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
