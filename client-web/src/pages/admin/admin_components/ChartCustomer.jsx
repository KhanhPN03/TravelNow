import React from "react";
import { BarChart, PieChart } from "@mui/x-charts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const ChartCustomer = ({ charData }) => {
  console.log(charData);

  const data = [
    { value: charData.gender.male, color: 'FF6B00' },
    { value: charData.gender.female, color: '#226EF0'},
  ];
  const COLORS = ["#FF6B00", "#226EF0"];

  return (
    <div className="dashboardChartContainer">
      <div className="chartCardContainer">
        <div className="chartCard">
          <div className="titleAndDate">
            <span className="titleChart ffGTBold fs-16">Total Customer</span>
            <span className="dateChart ffGTMedium fs-14">
              2024-12-10 - 2025-12-10
            </span>
          </div>
          <div className="chartSection">
            <div className="chartCardHeader">
              <div className="revenueInfo">
                <div className="amountChart">
                  <span className="users ffGTBold">
                    <FontAwesomeIcon icon={faUsers} />
                  </span>
                  <span className="amountNumber ffGTBold">{charData.gender.totalCount}</span>
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
                  <span className="fs-14 ffGTRegular">Super Admin</span>
                </div>
                <div className="legendItem">
                  <div
                    className="legendColor"
                    style={{ backgroundColor: COLORS[1] }}
                  ></div>
                  <span className="fs-14 ffGTRegular">Admin</span>
                </div>
              </div>
            </div>
            <div className="chartContainer">
              <PieChart
                series={[
                  {
                    data,
                  },
                ]}
                width={200}
                height={100}
              />
            </div>
          </div>
        </div>

        {/* Adventure Card */}
        <div className="chartCard">
          <div className="singleChartContainer">
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: ["group A", "group B", "group C"],
                },
              ]}
              series={[
                { data: [4, 3, 5] },
                { data: [1, 6, 3] },
                { data: [2, 5, 6] },
              ]}
              width={500}
              height={300}
              barLabel="value"
            />
          </div>
          <span className="chartCategoryTitle fs-14 ffGTBold">Female</span>
          <div className="chartStatsContainer">
            <div className="amountChart">
              <span className="users ffGTBold">
                {" "}
                <FontAwesomeIcon icon={faUsers} />
              </span>
              <span className="amountNumber ffGTBold">43.5k</span>
            </div>
            <span className="chartPercentage orange ffGTBold fs-20">30%</span>
          </div>
        </div>

        {/* Long-trip Card */}
        <div className="chartCard">
          <div className="singleChartContainer">
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: 10, label: "series A" },
                    { id: 1, value: 15, label: "series B" },
                    { id: 2, value: 20, label: "series C" },
                  ],
                },
              ]}
              width={400}
              height={200}
            />
          </div>
          <span className="chartCategoryTitle fs-14 ffGTBold">Male</span>
          <div className="chartStatsContainer">
            <div className="amountChart">
              <span className="users ffGTBold">
                {" "}
                <FontAwesomeIcon icon={faUsers} />
              </span>
              <span className="amountNumber ffGTBold">43.5k</span>
            </div>
            <span className="chartPercentage blue ffGTBold fs-20">30%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCustomer;
