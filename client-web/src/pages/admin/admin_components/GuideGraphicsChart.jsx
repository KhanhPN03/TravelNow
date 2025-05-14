import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register necessary components for Chart.js
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ChartDataLabels
);

const GuideGraphicsChart = () => {
  const [chartData, setChartData] = useState({
    genderData: { male: 0, female: 0 },
    ageData: { under18: 0, between18and30: 0, between30and50: 0, above50: 0 },
    dateData: [],
    totalData: 0,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timePeriod, setTimePeriod] = useState("day");
  const [isAll, setIsAll] = useState(true);
  const [isTotal, setIsTotal] = useState(true);
  const [isTimePeriodDisabled, setIsTimePeriodDisabled] = useState(false);
  const [selectedGender, setSelectedGender] = useState("all");

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `Week ${weekNum}, ${d.getFullYear()}`;
  };

  // Helper function to format date range
  const formatDateRange = (dateStr) => {
    if (!dateStr) return "All time";
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const calculateData = useCallback(
    (data) => {
      const genderCount = { male: 0, female: 0 };
      const ageCount = {
        under18: 0,
        between18and30: 0,
        between30and50: 0,
        above50: 0,
      };
      const dateCount = {};
      let totalCount = 0;

      const filteredGuides = data.filter((guide) => guide.role === "guide");

      filteredGuides.forEach((guide) => {
        const createdAt = new Date(guide.createdAt);

        if (
          timePeriod !== "all" &&
          ((startDate && createdAt < new Date(startDate)) ||
            (endDate && createdAt > new Date(endDate)))
        ) {
          return;
        }

        if (selectedGender !== "all" && guide.gender !== selectedGender) {
          return;
        }

        if (guide.gender === "male") genderCount.male++;
        else if (guide.gender === "female") genderCount.female++;

        const age =
          new Date().getFullYear() - new Date(guide.DOB).getFullYear();
        if (age < 18) ageCount.under18++;
        else if (age >= 18 && age <= 30) ageCount.between18and30++;
        else if (age > 30 && age <= 50) ageCount.between30and50++;
        else if (age > 50) ageCount.above50++;

        const date = new Date(guide.createdAt);
        let key;

        if (timePeriod === "day") {
          key = `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`;
        } else if (timePeriod === "week") {
          key = getWeekNumber(date);
        } else if (timePeriod === "month") {
          key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        } else if (timePeriod === "year") {
          key = `${date.getFullYear()}`;
        }

        if (!dateCount[key]) dateCount[key] = { male: 0, female: 0 };
        if (guide.gender === "male") dateCount[key].male++;
        else if (guide.gender === "female") dateCount[key].female++;

        totalCount++;
      });

      const sortedKeys = Object.keys(dateCount).sort((a, b) => {
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

      const cumulativeData = sortedKeys.map((key) => ({
        _id: key,
        count: dateCount[key],
      }));

      setChartData({
        genderData: genderCount,
        ageData: ageCount,
        dateData: cumulativeData,
        totalData: totalCount,
      });
    },
    [startDate, endDate, timePeriod, selectedGender]
  );

  useEffect(() => {
    // Hàm để fetch và xử lý dữ liệu
    const fetchGuideData = () => {
      axios
        .get("http://localhost:5000/account/guide/")
        .then((response) => {
          const guides = response.data.guides || [];
          if (guides.length > 0) {
            // Lọc chỉ lấy các guide có deleted = false
            const activeGuides = guides.filter(
              (guide) => guide.deleted === false
            );
            if (activeGuides.length > 0) {
              calculateData(activeGuides);
            } else {
              console.warn("No active guides found.");
            }
          } else {
            console.warn("No guides found.");
          }
        })
        .catch((error) => console.error("Error fetching guide data", error));
    };

    // Initial data fetch
    fetchGuideData();

    // Set interval to refresh data every 5 minutes (300000 milliseconds)
    const interval = setInterval(fetchGuideData, 300000); // 5 minutes

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [calculateData]);

  useEffect(() => {
    if (startDate && endDate && !isTotal && !isAll) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDifference = end - start;
      const oneMonth = 31 * 24 * 60 * 60 * 1000;
      const fourMonths = 121 * 24 * 60 * 60 * 1000;

      if (timeDifference > fourMonths) {
        setIsTimePeriodDisabled(true);
        setTimePeriod("year");
      } else if (timeDifference > oneMonth) {
        setIsTimePeriodDisabled(true);
        setTimePeriod("month");
      } else {
        setIsTimePeriodDisabled(false);
      }
    }
  }, [startDate, endDate, isTotal, isAll]);

  const totalMale = chartData.dateData.reduce(
    (total, item) => total + item.count.male,
    0
  );
  const totalFemale = chartData.dateData.reduce(
    (total, item) => total + item.count.female,
    0
  );

  const pieChartDataGender = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [totalMale, totalFemale],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const pieChartDataAge = {
    labels: ["Under 18", "18-30", "30-50", "Above 50"],
    datasets: [
      {
        data: [
          chartData.ageData.under18,
          chartData.ageData.between18and30,
          chartData.ageData.between30and50,
          chartData.ageData.above50,
        ],
        backgroundColor: ["#FF9F40", "#FFCD56", "#4BC0C0", "#FF6A00"],
      },
    ],
  };

  const getXAxisLabels = () => {
    if (isTotal) {
      return [`${formatDateRange(startDate)} to ${formatDateRange(endDate)}`];
    } else if (isAll) {
      return chartData.dateData.map((item) => item._id);
    } else {
      return chartData.dateData.map((item) => item._id);
    }
  };

  const barChartData = {
    labels: getXAxisLabels(),
    datasets: [
      {
        label: "Male",
        data: isTotal
          ? [totalMale]
          : chartData.dateData.map((item) => item.count.male || 0),
        backgroundColor: "rgb(65, 131, 156, 0.2)",
        hidden: selectedGender === "female",
      },
      {
        label: "Female",
        data: isTotal
          ? [totalFemale]
          : chartData.dateData.map((item) => item.count.female || 0),
        backgroundColor: "rgb(231, 127, 171, 0.2)",
        hidden: selectedGender === "male",
      },
      {
        label: "Total",
        data: isTotal
          ? [totalMale + totalFemale]
          : chartData.dateData.map((item) =>
              selectedGender === "all"
                ? item.count.male + item.count.female
                : selectedGender === "male"
                ? item.count.male
                : item.count.female
            ),
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
  };

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

  const handleGenderChange = (e) => {
    setSelectedGender(e.target.value);
  };

  const getGenderFilterText = () => {
    switch (selectedGender) {
      case "male":
        return "Male Guides";
      case "female":
        return "Female Guides";
      default:
        return "All Guides";
    }
  };

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

  return (
    <div className="chartCustomer">
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
        <div className="filterFormGroup">
          <label htmlFor="gender" className="filterFormLabel">
            Gender:
          </label>
          <select
            id="gender"
            value={selectedGender}
            onChange={handleGenderChange}
            className="filterFormSelect"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="filterFormGroup">
          <label htmlFor="timePeriod" className="filterFormLabel">
            View by:
          </label>
          <select
            id="timePeriod"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            disabled={isTimePeriodDisabled}
            className="filterFormSelect"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        {!isAll && (
          <>
            <div className="filterFormGroup">
              <label htmlFor="startDate" className="filterFormLabel">
                From:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filterFormInput"
              />
            </div>
            <div className="filterFormGroup">
              <label htmlFor="endDate" className="filterFormLabel">
                To:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filterFormInput"
              />
            </div>
          </>
        )}
      </form>

      <div className="chartCustomer-pieCharts">
        <div className="chartCustomer-barChart">
          <h3>Guide Growth Over Time - {getGenderFilterText()}</h3>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                datalabels: {
                  display: (context) => context.dataset.type === "line",
                  color: "black",
                  font: { weight: "bold", size: 14 },
                  formatter: (value) => value,
                },
              },
              scales: {
                x: {
                  stacked: true,
                  title: { display: true, text: "Time" },
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  title: { display: true, text: "Number of Guides" },
                },
              },
            }}
          />
        </div>
        <div className="chartWrapper">
          <div className="chartCustomer-pieChart">
            <h3>Gender Distribution</h3>
            <Pie
              data={pieChartDataGender}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => {
                        const total = tooltipItem.dataset.data.reduce(
                          (sum, value) => sum + value,
                          0
                        );
                        const value = tooltipItem.raw;
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                  datalabels: {
                    display: false,
                    color: "black",
                    font: { weight: "bold", size: 14 },
                    formatter: (value, context) => {
                      const total = context.dataset.data.reduce(
                        (sum, value) => sum + value,
                        0
                      );
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${percentage}%`;
                    },
                  },
                  legend: {
                    display: true,
                    position: "top",
                    labels: { font: { weight: "bold", size: 14 } },
                  },
                },
              }}
            />
          </div>
          <div className="chartCustomer-pieChart">
            <h3>Age Distribution - {getGenderFilterText()}</h3>
            <Pie
              data={pieChartDataAge}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => {
                        const total = tooltipItem.dataset.data.reduce(
                          (sum, value) => sum + value,
                          0
                        );
                        const value = tooltipItem.raw;
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                  datalabels: {
                    display: false,
                    color: "black",
                    font: { weight: "bold", size: 14 },
                    formatter: (value, context) => {
                      const total = context.dataset.data.reduce(
                        (sum, value) => sum + value,
                        0
                      );
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${percentage}%`;
                    },
                  },
                  legend: {
                    display: true,
                    position: "top",
                    labels: { font: { weight: "bold", size: 14 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideGraphicsChart;
