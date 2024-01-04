import { useState, useContext } from "react";
import setIndexIdContext from "../common/setIndexIdContext";
import ErrorFallback from "../common/ErrorFallback";
import { Modal, Button } from "react-bootstrap";
import closeIcon from "../svg/Close.svg";
import { useDeleteIndex } from "../apiHooks/apiHooks";
import "./IndexBar.css";

/** Index bar that shows index name and number of total videos
 *
 *  VideoComponents -> IndexBar
 *
 */

export function IndexBar({ index }) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showIndexId, setShowIndexId] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const { setIndexId } = useContext(setIndexIdContext);

  const deleteIndexMutation = useDeleteIndex(setIndexId);

  const showDeleteConfirmationMessage = () => {
    setShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationMessage = () => {
    setShowDeleteConfirmation(false);
  };

  async function deleteIndex() {
    try {
      await deleteIndexMutation.mutateAsync(index._id);
      hideDeleteConfirmationMessage();
    } catch (error) {
      setDeleteError(error);
    }
  }

  return (
    <>
      {!deleteError && (
        <div
          onMouseEnter={() => {
            setShowDeleteButton(true);
            setShowIndexId(true);
          }}
          onMouseLeave={() => {
            setShowDeleteButton(false);
            setShowIndexId(false);
          }}
          className="default-index"
        >
          {/* Index Bar */}
          <div className="indexBar">
            <i className="bi bi-folder"></i>
            <span className="indexName">{index.index_name}</span>
            <span>({index && index.video_count} videos)</span>
            {showIndexId && <div className="indexId">Id: {index._id}</div>}
          </div>

          {/* Delete Index Button */}
          <div className="deleteButtonWrapper">
            {showDeleteButton && (
              <>
                <button
                  className="deleteButton"
                  onClick={showDeleteConfirmationMessage}
                >
                  {closeIcon && (
                    <img src={closeIcon} alt="Icon" className="icon" />
                  )}
                </button>
              </>
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
              <Modal.Body>
                Are you sure you want to delete this index?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger" onClick={deleteIndex}>
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={hideDeleteConfirmationMessage}
                >
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </div>
      )}
      {deleteError && <ErrorFallback error={deleteError} />}
    </>
  );
}
