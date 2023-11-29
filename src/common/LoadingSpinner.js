import loadingSpinner from "../svg/LoadingSpinner.svg";

export function LoadingSpinner() {
  return (
    <div className="text-center">
      <div className=" loading-spinner">
        <img src={loadingSpinner} alt="Loading Spinner" />
      </div>
    </div>
  );
}
