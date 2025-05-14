import React, { useEffect, useState, useMemo, useCallback } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const DiscountCodeChart = () => {
  const [discountData, setDiscountData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timePeriod, setTimePeriod] = useState("month");
  const [isAll, setIsAll] = useState(true);
  const [dateRange, setDateRange] = useState("all");

  // Fetch discount data
  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/discount");
      // Lọc chỉ lấy các discount có deleted = false
      const activeDiscounts =
        response.data?.discounts.filter(
          (discount) => discount.deleted === false
        ) || [];
      setDiscountData(activeDiscounts);
    } catch (error) {
      console.error("Error fetching discount data:", error);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
    const intervalId = setInterval(fetchDiscounts, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [fetchDiscounts]);

  // Format date based on time period, including week
  const formatDate = (date, period) => {
    const newDate = new Date(date);
    switch (period) {
      case "day":
        return `${newDate.getDate()}/${
          newDate.getMonth() + 1
        }/${newDate.getFullYear()}`;
      case "week":
        const startOfYear = new Date(newDate.getFullYear(), 0, 1);
        const diff = newDate - startOfYear;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const weekNumber = Math.ceil(
          (diff + startOfYear.getDay() * 24 * 60 * 60 * 1000) / oneWeek
        );
        return `Week ${weekNumber}/${newDate.getFullYear()}`;
      case "month":
        return `${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
      case "year":
        return `${newDate.getFullYear()}`;
      default:
        return newDate.toISOString().split("T")[0];
    }
  };

  // Handle date range selection
  useEffect(() => {
    const today = new Date();
    let start;

    switch (dateRange) {
      case "last7":
        start = new Date();
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        setIsAll(false);
        break;
      case "last15":
        start = new Date();
        start.setDate(today.getDate() - 15);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        setIsAll(false);
        break;
      case "last30":
        start = new Date();
        start.setDate(today.getDate() - 30);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        setIsAll(false);
        break;
      case "all":
      default:
        setStartDate("");
        setEndDate("");
        setIsAll(true);
        break;
    }
  }, [dateRange]);

  // Filter data with date range
  const filteredData = useMemo(() => {
    if (isAll) return discountData;
    return discountData.filter((d) => {
      const discountStart = new Date(d.discountDateStart);
      return (
        (!startDate || discountStart >= new Date(startDate)) &&
        (!endDate || discountStart <= new Date(endDate))
      );
    });
  }, [discountData, startDate, endDate, isAll]);

  // Process data for charts
  const processedData = useMemo(() => {
    const groupedByCode = {};
    const groupedByTime = {};
    const discountPrices = {};

    filteredData.forEach((d) => {
      const code = d.discountCode;
      const period = formatDate(d.discountDateStart, timePeriod);
      const usedSlots = d.discountSlots - d.discountAvailableSlots;
      const remainingSlots = d.discountAvailableSlots;
      const discountPrice = d.discountPrice || 0;

      if (!groupedByCode[code]) {
        groupedByCode[code] = { used: 0, remaining: 0 };
      }
      groupedByCode[code].used += usedSlots;
      groupedByCode[code].remaining += remainingSlots;

      if (!groupedByTime[period]) {
        groupedByTime[period] = { used: 0, remaining: 0 };
      }
      groupedByTime[period].used += usedSlots;
      groupedByTime[period].remaining += remainingSlots;

      const priceBucket = Math.round(discountPrice / 10) * 10;
      if (!discountPrices[priceBucket]) {
        discountPrices[priceBucket] = 0;
      }
      discountPrices[priceBucket] += 1;
    });

    return { groupedByCode, groupedByTime, discountPrices };
  }, [filteredData, timePeriod]);

  // Chart 1: Discount Price Distribution
  const priceChartData = useMemo(() => {
    const labels = Object.keys(processedData.discountPrices).sort(
      (a, b) => a - b
    );
    return {
      labels: labels.map((v) => `${v}-${parseInt(v) + 9}`),
      datasets: [
        {
          label: "Number of Discounts",
          data: labels.map((v) => processedData.discountPrices[v]),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [processedData]);

  // Chart 2: Used vs Remaining Slots by Code
  const slotsChartData = useMemo(() => {
    const labels = Object.keys(processedData.groupedByCode);
    return {
      labels,
      datasets: [
        {
          label: "Used Slots",
          data: labels.map((code) => processedData.groupedByCode[code].used),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Remaining Slots",
          data: labels.map(
            (code) => processedData.groupedByCode[code].remaining
          ),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [processedData]);

  // Chart 3: Used vs Remaining Slots by Time
  const timeChartData = useMemo(() => {
    const labels = Object.keys(processedData.groupedByTime).sort((a, b) => {
      if (timePeriod === "day") {
        const [dayA, monthA, yearA] = a.split("/").map(Number);
        const [dayB, monthB, yearB] = b.split("/").map(Number);
        return (
          new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
        );
      } else if (timePeriod === "week") {
        const [weekA, yearA] = a.split(" ")[1].split("/").map(Number);
        const [weekB, yearB] = b.split(" ")[1].split("/").map(Number);
        return yearA === yearB ? weekA - weekB : yearA - yearB;
      } else if (timePeriod === "month") {
        const [monthA, yearA] = a.split("/").map(Number);
        const [monthB, yearB] = b.split("/").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      } else {
        return parseInt(a) - parseInt(b);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Used Slots",
          data: labels.map((time) => processedData.groupedByTime[time].used),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Remaining Slots",
          data: labels.map(
            (time) => processedData.groupedByTime[time].remaining
          ),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [processedData, timePeriod]);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
      datalabels: {
        display: false,
        color: "black",
        font: { weight: "bold" },
        formatter: (value) => (value > 0 ? value : ""),
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: "Count" },
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <form
        className="filterForm"
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div className="filterFormGroup">
          <label htmlFor="dateRange" className="filterFormLabel">
            Date Range:
          </label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ marginLeft: "5px" }}
            className="filterFormSelect"
          >
            <option value="all">All Data</option>
            <option value="last7">Last 7 Days</option>
            <option value="last15">Last 15 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        {dateRange === "custom" && (
          <>
            <div className="filterFormGroup">
              <label htmlFor="startDate" className="filterFormLabel">
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                className="filterFormSelect"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setIsAll(false);
                }}
                max={endDate || new Date().toISOString().split("T")[0]}
                style={{ marginLeft: "5px" }}
              />
            </div>
            <div className="filterFormGroup">
              <label htmlFor="endDate" className="filterFormLabel">
                End Date:
              </label>
              <input
                type="date"
                id="endDate"
                className="filterFormSelect"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setIsAll(false);
                }}
                min={startDate}
                style={{ marginLeft: "5px" }}
              />
            </div>
          </>
        )}
        <div className="filterFormGroup">
          <label htmlFor="timePeriod" className="filterFormLabel">
            View by:
          </label>
          <select
            id="timePeriod"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            style={{ marginLeft: "5px" }}
            className="filterFormSelect"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </form>

      {filteredData.length === 0 ? (
        <p style={{ textAlign: "center", color: "gray" }}>
          No discount data available for the selected filters.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: "40px" }}>
            <Bar
              data={priceChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: "Discount Price Distribution" },
                },
                scales: {
                  x: { title: { display: true, text: "Discount Price Range" } },
                  y: { title: { display: true, text: "Number of Discounts" } },
                },
              }}
              style={{
                maxWidth: "100%",
                width: "900px",
                margin: "0 auto",
                backgroundColor: "white",
                borderRadius: "10px",
              }}
            />
          </div>

          <div style={{ marginBottom: "40px" }}>
            <Bar
              data={slotsChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Used vs Remaining Slots by Discount Code",
                  },
                },
              }}
              style={{
                maxWidth: "100%",
                width: "900px",
                margin: "0 auto",
                backgroundColor: "white",
                borderRadius: "10px",
              }}
            />
          </div>

          <div>
            <Bar
              data={timeChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: `${
                      timePeriod === "day"
                        ? "Daily"
                        : timePeriod === "week"
                        ? "Weekly"
                        : timePeriod === "month"
                        ? "Monthly"
                        : "Yearly"
                    } Discount Usage`,
                  },
                },
              }}
              style={{
                maxWidth: "100%",
                width: "900px",
                margin: "0 auto",
                backgroundColor: "white",
                borderRadius: "10px",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DiscountCodeChart;
