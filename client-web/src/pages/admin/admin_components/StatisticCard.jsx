import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StatisticCard = ({
  title,
  value,
  percentageChange,
  viewMoreLink,
  backgroundColor,
}) => {
  return (
    <div className="statisticCard" style={{ backgroundColor: backgroundColor }}>
      <div className="statisticContent">
      <div className="statisticSection">
          <div className="statisticLeft">
            <div className="statisticTitle fs-14 ffGTBold">
              <span>{title}</span>
            </div>
            <div className="StatisticNumber ffGTBold fs-32">
              <span>{value}</span>
            </div>
          </div>
          <i className="bx bx-coin-stack"></i>
        </div>

        <div className="statisticFooter">
          <div>
            <span className="statisticPercentageIncrease">
              <i className="bx bx-trending-up"></i>
            </span>
            <span className="fs-14 ffGTBold">{percentageChange}</span>
          </div>

          <div className="statisticViewMore fs-14 ffGTBold">
            <Link to={viewMoreLink}>View More</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;
