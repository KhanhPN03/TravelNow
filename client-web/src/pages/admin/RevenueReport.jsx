import { useState } from "react";
import AdminHeader from "./admin_components/AdminHeader";
import SidebarNavigate from "./admin_components/SidebarNavigate";
import Chart from "./admin_components/Chart";
import TableContent from "./admin_components/TableContent";
import Pagination from "./admin_components/Pagination";
import WrapperTable from "./admin_components/WrapperTable";
import ActionTableWrapper from "./admin_components/ActionTableWrapper";

const columnsWithImage = ["Name", "Age", "Email"];
const dataWithImage = [
  {
    id: 1,
    Name: "John Doe",
    Age: 30,
    Email: "john@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 2,
    Name: "Jane Smith",
    Age: 25,
    Email: "jane@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 3,
    Name: "Grap",
    Age: 30,
    Email: "john@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 4,
    Name: "Robin chan",
    Age: 25,
    Email: "jane@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 5,
    Name: "Nami",
    Age: 30,
    Email: "john@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 6,
    Name: "Songoku",
    Age: 25,
    Email: "jane@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 1,
    Name: "John Doe",
    Age: 30,
    Email: "john@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 2,
    Name: "Jane Smith",
    Age: 25,
    Email: "jane@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 3,
    Name: "Grap",
    Age: 30,
    Email: "john@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 4,
    Name: "Robin chan",
    Age: 25,
    Email: "jane@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 5,
    Name: "Nami",
    Age: 30,
    Email: "john@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
  {
    id: 6,
    Name: "Songoku",
    Age: 25,
    Email: "jane@example.com",
    image:
      "https://img.freepik.com/premium-photo/cute-anime-girl-reading-book-studying_1186913-5902.jpg?ga=GA1.1.1919458898.1703582107&semt=ais_hybrid",
  },
];

function RevenueReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(2);

  const lastPostIndex = currentPage * rowsPerPage;
  const fisrtPostIndex = lastPostIndex - rowsPerPage;
  const currentRows = dataWithImage.slice(fisrtPostIndex, lastPostIndex);

  return (
    <div className="containerAdmin">
      <SidebarNavigate />
      <div className="rightSidebarContainer">
        <AdminHeader />
        <div className="statisticCardsContainer">
          <Chart />
        </div>
        <div className="dashboardTableContainer">
          <WrapperTable
            hasTabTransform={false}
            hasSelectDateTab={true}
            hasFeedbackTab={false}
            backLinkFeedback={""}
          >
            <div className="tableContainerAdmin">
              <ActionTableWrapper
                hasLeftDeleteButton={false}
                leftDeleteButtonFunction={() => {}}
                hasRightActionButtons={true}
                rightAddButtonFunction={() => {}}
                rightDeleteButtonFunction={() => {}}
              />
              <TableContent
                columns={columnsWithImage}
                data={currentRows}
                hasImageColumn={true}
                backgroundColorButton="var(--clr-dark-blue)"
                labelButton="Options"
                hasCheckbox={true}
              />
              <div className="paginationWrapper">
                <Pagination
                  totalRows={dataWithImage.length}
                  rowsPerPage={rowsPerPage}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </WrapperTable>
        </div>
      </div>
    </div>
  );
}

export default RevenueReport;
