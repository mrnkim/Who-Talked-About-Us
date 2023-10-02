import React from "react";
import "./CustomPagination.css"; // Import the CSS file
import nextIcon from "../svg/ChevronRight.svg";
import prevIcon from "../svg/ChevronLeft.svg";

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
      <button onClick={prevPage} disabled={currentPage === 1}>
        <img src={prevIcon} alt="next Icon" />
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          className={currentPage === number ? "active" : ""}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}
      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? "disabled" : ""}
      >
        <img src={nextIcon} alt="next Icon" />
      </button>
    </div>
  );
}

export default CustomPagination;
