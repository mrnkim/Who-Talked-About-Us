import prevIcon from "../svg/ChevronLeft.svg";
import nextIcon from "../svg/ChevronRight.svg";
import prevIconDisabled from "../svg/ChevronLeftDisabled.svg";
import nextIconDisabled from "../svg/ChevronRightDisabled.svg";
import "./PageNav.css";
import { LoadingSpinner } from "./LoadingSpinner";
import { Suspense } from "react";

export function PageNav({ page, setPage, data, isPreviousData }) {
  const nextPage = () => setPage(page + 1);

  const previousPage = () => setPage(page - 1);

  const pagesArray = Array(data.page_info.total_page)
    .fill()
    .map((_, index) => index + 1);

  return (
    <nav className="pageNav">
      {isPreviousData || page === 1 ? (
        <button disabled className="disabled-button">
          <img src={prevIconDisabled} alt="prev Icon disabled" />
        </button>
      ) : (
        <button onClick={previousPage}>
          <img src={prevIcon} alt="prev Icon" />
        </button>
      )}
      {pagesArray.map((pg) => (
        <button
          key={pg}
          className={page === pg ? "active" : ""}
          onClick={() => setPage(pg)}
        >
          {pg}
        </button>
      ))}

      {isPreviousData || page === data.page_info.total_page ? (
        <button disabled className="disabled-button">
          <img src={nextIconDisabled} alt="next Icon disabled" />
        </button>
      ) : (
        <button onClick={nextPage}>
          <img src={nextIcon} alt="next Icon" />
        </button>
      )}
    </nav>
  );
}
