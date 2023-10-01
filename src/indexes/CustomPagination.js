import React from "react";
import Pagination from "react-bootstrap/Pagination";
import "./CustomPagination.css"; // Import the CSS file

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
    <Pagination className="custom-pagination">
      <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
      {pageNumbers.map((number) => (
        <Pagination.Item
          key={number}
          active={currentPage === number}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Pagination.Item>
      ))}
      <Pagination.Next
        onClick={nextPage}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
}

export default CustomPagination;
