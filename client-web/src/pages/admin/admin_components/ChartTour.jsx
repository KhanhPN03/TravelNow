import React, { memo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckPlane } from "@fortawesome/free-solid-svg-icons";

const ChartTour = memo(({ chartData }) => {
  console.log(chartData.adventure.value);

  const totalData = [
    { name: "Adventure", value: 30 },
    { name: "Long-trip", value: 70 },
  ];

  const adventureData = [
    { name: "Adventure", value: 30 },
    { name: "Other", value: 70 },
  ];

  const longTripData = [
    { name: "Long-trip", value: 30 },
    { name: "Other", value: 70 },
  ];

  const COLORS = ["#FF6B00", "#226EF0"];
  const PASTEL_COLORS = {
    adventure: ["#FF6B00", "#FFE5D2"],
    longTrip: ["#226EF0", "#E5EFFF"],
  };

  return (
    <div className="dashboardChartContainer">
      <div className="chartCardContainer">
        <div className="chartCard">
          <div className="titleAndDate">
            <span className="titleChart ffGTBold fs-16">Total Tours</span>
            <span className="dateChart ffGTMedium fs-14">
              2024-12-10 - 2025-12-10
            </span>
          </div>
          <div className="chartSection">
            <div className="chartCardHeader">
              <div className="revenueInfo">
                <div className="amountChart">
                  <span className="truckPlane ffGTBold">
                    <FontAwesomeIcon icon={faTruckPlane} />
                  </span>
                  <span className="amountNumber ffGTBold">
                    {chartData.adventure.value + chartData.longTrip.value}
                  </span>
                  <span className="chartPercentageIncrease">
                    <i className="bx bx-trending-up"></i>
                  </span>
                  <span className="fs-14 ffGTBold clrOrange">+10%</span>
                </div>
              </div>
              <div className="chartLegend">
                <div className="legendItem">
                  <div
                    className="legendColor"
                    style={{ backgroundColor: COLORS[0] }}
                  ></div>
                  <span className="fs-14 ffGTRegular">ADVENTURE</span>
                </div>
                <div className="legendItem">
                  <div
                    className="legendColor"
                    style={{ backgroundColor: COLORS[1] }}
                  ></div>
                  <span className="fs-14 ffGTRegular">LONG-TRIP</span>
                </div>
              </div>
            </div>
            <div className="chartContainer">
              <PieChart width={84} height={84}>
                <Pie
                  data={totalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={42}
                  dataKey="value"
                >
                  {totalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </div>
          </div>
        </div>

        {/* Adventure Card */}
        <div className="chartCard">
          <div className="singleChartContainer">
            <PieChart width={84} height={84}>
              <Pie
                data={adventureData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={42}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {adventureData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PASTEL_COLORS.adventure[index]}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
          <span className="chartCategoryTitle fs-14 ffGTBold">ADVENTURE</span>
          <div className="chartStatsContainer">
            <div className="amountChart">
              <span className="truckPlane ffGTBold">
                <FontAwesomeIcon icon={faTruckPlane} />
              </span>
              <span className="amountNumber ffGTBold">
                {chartData.adventure.value} tour(s)
              </span>
            </div>
            <span className="chartPercentage orange ffGTBold fs-20">
              {chartData.adventure.percentage}%
            </span>
          </div>
        </div>

        {/* Long-trip Card */}
        <div className="chartCard">
          <div className="singleChartContainer">
            <PieChart width={84} height={84}>
              <Pie
                data={longTripData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={42}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {longTripData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PASTEL_COLORS.longTrip[index]}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
          <span className="chartCategoryTitle fs-14 ffGTBold">LONG-TRIP</span>
          <div className="chartStatsContainer">
            <div className="amountChart">
              <span className="truckPlane ffGTBold">
                <FontAwesomeIcon icon={faTruckPlane} />
              </span>
              <span className="amountNumber ffGTBold">
                {chartData.longTrip.value} tour(s)
              </span>
            </div>
            <span className="chartPercentage blue ffGTBold fs-20">
              {chartData.longTrip.percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChartTour;
