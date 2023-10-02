import React from "react";
import "./CustomPagination.css"; // Import the CSS file
import nextIcon from "../svg/ChevronRight.svg";
import nextIconDisabled from "../svg/ChevronRightDisabled.svg";
import prevIcon from "../svg/ChevronLeft.svg";
import prevIconDisabled from "../svg/ChevronLeftDisabled.svg";

function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  prevPage,
  nextPage,
}) {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="custom-pagination">
      {currentPage === 1 ? (
        <button disabled className="disabled-button">
          <img src={prevIconDisabled} alt="prev Icon disabled" />
        </button>
      ) : (
        <button onClick={prevPage}>
          <img src={prevIcon} alt="prev Icon" />
        </button>
      )}
      {pageNumbers.map((number) => (
        <button
          key={number}
          className={currentPage === number ? "active" : ""}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}
      {currentPage === totalPages ? (
        <button disabled className="disabled-button">
          <img src={nextIconDisabled} alt="next Icon disabled" />
        </button>
      ) : (
        <button onClick={nextPage}>
          <img src={nextIcon} alt="next Icon" />
        </button>
      )}
    </div>
  );
}

export default CustomPagination;
