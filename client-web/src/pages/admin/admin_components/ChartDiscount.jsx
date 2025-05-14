import React, { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
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
  LineElement,
  PointElement,
  ChartDataLabels
);

export default function ChartDiscount() {
  const [discountData, setDiscountData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [timePeriod, setTimePeriod] = useState("year");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAll, setIsAll] = useState(true); // Show All Data, default to true
  const [isTotal, setIsTotal] = useState(true); // Total Data, default to true
  const [isTimePeriodDisabled, setIsTimePeriodDisabled] = useState(false);
  // Add filter for discount status
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  // Helper function to get week number from a date
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `Week ${weekNum}, ${d.getFullYear()}`;
  };

  // Format date based on time period
  const formatDate = (date, period) => {
    const newDate = new Date(date);
    switch (period) {
      case "day":
        return `${newDate.getDate()}/${
          newDate.getMonth() + 1
        }/${newDate.getFullYear()}`;
      case "week":
        return getWeekNumber(newDate);
      case "month":
        return `${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
      case "year":
        return `${newDate.getFullYear()}`;
      default:
        return newDate.toLocaleDateString();
    }
  };

  // Helper function to format date range for display
  const formatDateRange = (dateStr) => {
    if (!dateStr) return "All time";
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  useEffect(() => {
    fetchDiscounts();
    // Refresh data every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchDiscounts();
    }, 300000);
    return () => clearInterval(intervalId);
  }, []);

  // Set initial date range based on available data
  useEffect(() => {
    if (discountData.length > 0) {
      const earliestDate = new Date(
        Math.min(...discountData.map((d) => new Date(d.discountDateStart)))
      );
      const latestDate = new Date(
        Math.max(...discountData.map((d) => new Date(d.discountDateEnd)))
      );

      setStartDate(earliestDate.toISOString().split("T")[0]);
      setEndDate(latestDate.toISOString().split("T")[0]);
    }
  }, [discountData]);

  // Filter data by date range and status
  const filterData = useCallback(
    (data) => {
      // If "All" is selected, use all data
      if (isAll) {
        // Apply status filter if needed
        if (selectedStatus === "all") return data;

        // Filter based on isActive field
        if (selectedStatus === "active") {
          return data.filter((discount) => discount.isActive === true);
        } else if (selectedStatus === "inactive") {
          return data.filter((discount) => discount.isActive === false);
        }

        return data;
      }

      // Filter by discountDateStart within the date range
      let filtered = data.filter((discount) => {
        const discountStart = new Date(discount.discountDateStart);

        const isWithinDateRange =
          (!startDate || discountStart >= new Date(startDate)) &&
          (!endDate || discountStart <= new Date(endDate));

        return isWithinDateRange;
      });

      // Apply status filter if needed
      if (selectedStatus !== "all") {
        if (selectedStatus === "active") {
          filtered = filtered.filter((discount) => discount.isActive === true);
        } else if (selectedStatus === "inactive") {
          filtered = filtered.filter((discount) => discount.isActive === false);
        }
      }

      return filtered;
    },
    [isAll, startDate, endDate, selectedStatus]
  );

  // Prepare chart data
  useEffect(() => {
    const prepareChartData = () => {
      const filteredData = filterData(discountData);

      if (isTotal) {
        // When "Total Data" is selected, sum all values into one column
        const totalAmount = filteredData.reduce(
          (acc, discount) =>
            acc + (discount.discountPrice || 0) * (discount.discountSlots || 0),
          0
        );
        const actualAmount = filteredData.reduce(
          (acc, discount) =>
            acc +
            (discount.discountPrice || 0) *
              (discount.discountSlots - (discount.discountAvailableSlots || 0)),
          0
        );
        const remainingAmount = filteredData.reduce(
          (acc, discount) =>
            acc +
            (discount.discountPrice || 0) *
              (discount.discountAvailableSlots || 0),
          0
        );

        const displayTime = isAll
          ? "All time"
          : `${formatDateRange(startDate)} to ${formatDateRange(endDate)}`;

        setChartData({
          labels: [displayTime],
          datasets: [
            {
              label: "Total Amount",
              data: [totalAmount],
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderColor: "black",
              borderWidth: 2,
              type: "line",
              fill: false,
              pointRadius: 5,
              pointBackgroundColor: "black",
              pointBorderColor: "black",
            },
            {
              label: "Actual Amount",
              data: [actualAmount],
              backgroundColor: "rgba(44, 28, 28, 0.2)",
            },
            {
              label: "Remaining Amount",
              data: [remainingAmount],
              backgroundColor: "rgba(16, 165, 120, 0.2)",
            },
          ],
        });
      } else {
        // Group data by time period
        const groupedData = filteredData.reduce((acc, discount) => {
          const discountPrice = discount.discountPrice || 0;
          const discountSlots = discount.discountSlots || 0;
          const discountAvailableSlots = discount.discountAvailableSlots || 0;

          const actualAmount =
            discountPrice * (discountSlots - discountAvailableSlots);
          const remainingAmount = discountPrice * discountAvailableSlots;
          const totalAmount = discountPrice * discountSlots;

          if (
            isNaN(actualAmount) ||
            isNaN(remainingAmount) ||
            isNaN(totalAmount)
          ) {
            return acc;
          }

          const date = formatDate(discount.discountDateStart, timePeriod);
          if (!acc[date]) {
            acc[date] = { totalAmount: 0, actualAmount: 0, remainingAmount: 0 };
          }

          acc[date].totalAmount += totalAmount;
          acc[date].actualAmount += actualAmount;
          acc[date].remainingAmount += remainingAmount;

          return acc;
        }, {});

        // Sort date keys based on the time period
        const sortedKeys = Object.keys(groupedData).sort((a, b) => {
          if (timePeriod === "day") {
            const [dayA, monthA, yearA] = a.split("/").map(Number);
            const [dayB, monthB, yearB] = b.split("/").map(Number);
            return (
              new Date(yearA, monthA - 1, dayA) -
              new Date(yearB, monthB - 1, dayB)
            );
          } else if (timePeriod === "week") {
            const weekA = parseInt(a.split(", ")[0].replace("Week ", ""));
            const yearA = parseInt(a.split(", ")[1]);
            const weekB = parseInt(b.split(", ")[0].replace("Week ", ""));
            const yearB = parseInt(b.split(", ")[1]);
            return yearA === yearB ? weekA - weekB : yearA - yearB;
          } else if (timePeriod === "month") {
            const [monthA, yearA] = a.split("/").map(Number);
            const [monthB, yearB] = b.split("/").map(Number);
            return yearA === yearB ? monthA - monthB : yearA - yearB;
          } else {
            return parseInt(a) - parseInt(b);
          }
        });

        const totalAmountData = sortedKeys.map(
          (date) => groupedData[date].totalAmount
        );
        const actualAmountData = sortedKeys.map(
          (date) => groupedData[date].actualAmount
        );
        const remainingAmountData = sortedKeys.map(
          (date) => groupedData[date].remainingAmount
        );

        setChartData({
          labels: sortedKeys,
          datasets: [
            {
              label: "Actual Amount",
              data: actualAmountData,
              backgroundColor: "rgba(44, 28, 28, 0.2)",
            },
            {
              label: "Remaining Amount",
              data: remainingAmountData,
              backgroundColor: "rgba(16, 165, 120, 0.2)",
            },
            {
              label: "Total Amount",
              data: totalAmountData,
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderColor: "black",
              borderWidth: 2,
              type: "line",
              fill: false,
              pointRadius: 5,
              pointBackgroundColor: "black",
              pointBorderColor: "black",
            },
          ],
        });
      }
    };

    if (discountData.length > 0) {
      prepareChartData();
    }
  }, [
    discountData,
    timePeriod,
    startDate,
    endDate,
    isAll,
    isTotal,
    selectedStatus,
    filterData,
  ]);

  // Logic to disable View by options when the selected date range is too large
  useEffect(() => {
    if (startDate && endDate && !isTotal && !isAll) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDifference = end - start;
      const oneMonth = 31 * 24 * 60 * 60 * 1000; // 31 days in ms
      const fourMonths = 121 * 24 * 60 * 60 * 1000; // 121 days in ms

      // If time difference > 121 days, disable day and week views
      if (timeDifference > fourMonths) {
        setIsTimePeriodDisabled(true);
        setTimePeriod("year");
      }
      // If time difference > 31 days but < 121 days, disable day view
      else if (timeDifference > oneMonth) {
        setIsTimePeriodDisabled(true);
        setTimePeriod("month");
      } else {
        setIsTimePeriodDisabled(false);
      }
    }
  }, [startDate, endDate, isTotal, isAll]);

  // Event handlers
  const handleAllChange = (e) => {
    const isChecked = e.target.checked;
    setIsAll(isChecked);
    if (isChecked) {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleTotalChange = (e) => {
    setIsTotal(e.target.checked);
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Get status filter text for chart title
  const getStatusFilterText = () => {
    switch (selectedStatus) {
      case "active":
        return "Active Discounts";
      case "inactive":
        return "Inactive Discounts";
      default:
        return "All Discounts";
    }
  };

  // Get the appropriate time period display text
  const getTimePeriodText = () => {
    switch (timePeriod) {
      case "day":
        return "Daily";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
      case "year":
        return "Yearly";
      default:
        return "";
    }
  };

  if (
    !chartData.labels ||
    !chartData.datasets ||
    chartData.datasets.length === 0
  ) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div className="chartDiscount">
      <form className="filterForm">
        <div className="filterFormGroup">
          <label htmlFor="all" className="filterFormLabel">
            Show All Data:
          </label>
          <input
            type="checkbox"
            id="all"
            checked={isAll}
            style={{ margin: "10px" }}
            onChange={handleAllChange}
          />
        </div>
        <div className="filterFormGroup">
          <label htmlFor="totalData" className="filterFormLabel">
            Total Data:
          </label>
          <input
            type="checkbox"
            id="totalData"
            checked={isTotal}
            style={{ margin: "10px" }}
            onChange={handleTotalChange}
          />
        </div>
        {/* Status Filter Select */}
        <div className="filterFormGroup">
          <label htmlFor="status" className="filterFormLabel">
            Status:
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="filterFormSelect"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="filterFormGroup">
          <label htmlFor="timePeriod" className="filterFormLabel">
            View by:
          </label>
          <select
            id="timePeriod"
            value={timePeriod}
            onChange={handleTimePeriodChange}
            className="filterFormSelect"
            disabled={isTotal || isTimePeriodDisabled}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        {!isAll && (
          <div className="filterFormGroup">
            <label htmlFor="startDate" className="filterFormLabel">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filterFormInput"
            />
          </div>
        )}
        {!isAll && (
          <div className="filterFormGroup">
            <label htmlFor="endDate" className="filterFormLabel">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filterFormInput"
            />
          </div>
        )}
      </form>

      <div className="chartDiscount-barChart">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                title: {
                  display: true,
                  text: `Discount Revenue Analysis - ${getStatusFilterText()}`,
                },
              },
              datalabels: {
                display: false,
                color: "black",
                font: {
                  weight: "bold",
                  size: 14,
                },
                formatter: (value) => value.toFixed(0),
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const value = tooltipItem.raw;
                    return `${tooltipItem.dataset.label}: ${value.toFixed(2)}`;
                  },
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: "Time Period",
                },
              },
              y: {
                stacked: true,
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Revenue Discount",
                },
              },
            },
          }}
          style={{
            width: "100%",
            maxWidth: "900px",
            height: "auto",
            backgroundColor: "white",
            border: "1px solid #dee2e6",
            borderRadius: "10px",
            padding: "15px",
            margin: "20px auto",
          }}
        />
      </div>
    </div>
  );
}
