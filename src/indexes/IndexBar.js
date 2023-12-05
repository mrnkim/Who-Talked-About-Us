import { Modal, Button } from "react-bootstrap";
import closeIcon from "../svg/Close.svg";

export function IndexBar({
  // handleClick,
  showDeleteButton,
  setShowDeleteButton,
  isIndexSelected,
  index,
  videosData,
  showDeleteConfirmationMessage,
  hideDeleteConfirmationMessage,
  showDeleteConfirmation,
  deleteIndex,
}) {
  return (
    <div
      // onClick={handleClick}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
      className={isIndexSelected ? "selected-index" : "default-index"}
    >
      <div className="indexBar">
        <i className="bi bi-folder"></i>
        <span style={{ marginLeft: "10px", fontSize: "1.1rem" }}>
          {index.index_name}
        </span>
        <span style={{ marginLeft: "5px" }}>
          ({videosData && videosData.page_info.total_results} videos)
        </span>
      </div>

      {/* Delete Index Button */}
      <div className="deleteButtonWrapper">
        {showDeleteButton && (
          <button
            className="deleteButton"
            onClick={showDeleteConfirmationMessage}
          >
            {closeIcon && <img src={closeIcon} alt="Icon" className="icon" />}
          </button>
        )}
      </div>

      {/* Delete Index Confirmation Message */}
      {showDeleteConfirmation && (
        <Modal
          show={showDeleteConfirmation}
          onHide={hideDeleteConfirmationMessage}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Body>Are you sure you want to delete this index?</Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={deleteIndex}>
              Delete
            </Button>
            <Button variant="secondary" onClick={hideDeleteConfirmationMessage}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
