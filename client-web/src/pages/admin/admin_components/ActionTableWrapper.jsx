import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faPlus,
  faFileExcel,
  faFilter,
  faSortAlphaAsc,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

export default function ActionTableWrapper({
  hasLeftDeleteButton,
  leftDeleteButtonFunction,
  hasRightActionButtons,
  rightAddButtonFunction,
  rightDeleteButtonFunction,
  rightExportExcelFunction,
  rightRestoreFunction,
  hasLeftAction,
  onSearchChange,
  onFilterClick,
  onSortClick,
  hasLeftActionSort,
  hasAdd,
  hasDelete,
  hasExportExcel,
  hasFilter,
  hasRestore,
  hasSearch,
  leftDeleteButtonCustomTitle,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query); // Truyền giá trị tìm kiếm ra ngoài
    }
  };

  return (
    <div className="searchBarContainer">
      <div className="searchBarLeftContainer">
        {hasLeftDeleteButton && (
          <div className="delBtnContainerSearchBar">
            <button
              className="delBtnSearchBar"
              onClick={leftDeleteButtonFunction}
            >
              <FontAwesomeIcon icon={faTrashCan} />
              <span>
                {leftDeleteButtonCustomTitle
                  ? leftDeleteButtonCustomTitle
                  : "Delete"}
              </span>
            </button>
          </div>
        )}
        {hasSearch && (
          <div className="searchWrapperAdmin">
            <i className="bx bx-search"></i>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        )}
      </div>

      <div className="actionBtnContainerSearchBar">
        {hasRightActionButtons && (
          <>
            {hasAdd && (
              <button
                onClick={rightAddButtonFunction}
                className="actionBtnPlusSearchBar"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            )}
            {hasDelete && (
              <button
                className="actionBtnDelSearchBar"
                onClick={rightDeleteButtonFunction}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            )}
            {hasFilter && (
              <button onClick={onFilterClick} className="actionBtnFilterBar">
                <FontAwesomeIcon icon={faFilter} />
              </button>
            )}
            {hasLeftActionSort && (
              <button onClick={onSortClick} className="actionBtnFilterBar">
                <FontAwesomeIcon icon={faSortAlphaAsc} />
              </button>
            )}
            {hasExportExcel && (
              <button
                className="actionBtnPlusSearchBar"
                onClick={rightExportExcelFunction}
              >
                <FontAwesomeIcon icon={faFileExcel} />
              </button>
            )}
            {hasRestore && (
              <button
                className="actionBtnPlusSearchBar"
                onClick={rightRestoreFunction}
              >
                <FontAwesomeIcon icon={faRotateRight} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
