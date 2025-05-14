// TableTicked.jsx
import React from "react";
import TableRowTicked from "./TableRowTicked.jsx";

const TableTicked = ({ data, accountData, onViewDetail, onViewCheckin }) => {
  return (
    <div className="userDetailTable">
      <table className="ttDataTable clrDarkBlue">
        <thead className="ffGTBold">
          <tr>
            <th>Ticket</th>
            <th>Tour Ref</th>
            <th>Ticket Ref</th>
            <th>Rating</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <TableRowTicked
              key={item._id}
              item={item}
              accountData={accountData} // Pass accountData
              onViewDetail={onViewDetail}
              onViewCheckin={onViewCheckin}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableTicked;