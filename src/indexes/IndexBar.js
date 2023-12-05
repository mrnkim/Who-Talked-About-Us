import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import closeIcon from "../svg/Close.svg";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteIndex } from "../api/apiHooks";
import { keys } from "../api/keys";

import "./VideoIndex.css";

export function IndexBar({ vidPage, index, setIndexId, taskVideos }) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const queryClient = useQueryClient();
  const videosData = queryClient.getQueryData([
    keys.VIDEOS,
    index?._id,
    vidPage,
  ]);
  const deleteIndexMutation = useDeleteIndex(setIndexId);

  const showDeleteConfirmationMessage = () => {
    setShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationMessage = () => {
    setShowDeleteConfirmation(false);
  };

  async function deleteIndex() {
    await deleteIndexMutation.mutateAsync(index._id);
    hideDeleteConfirmationMessage();
  }

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [keys.VIDEOS, index._id, vidPage],
    });
  }, [taskVideos, index._id, vidPage]);

  return (
    <div
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
      className="default-index"
    >
      <div className="indexBar">
        <i className="bi bi-folder"></i>
        <span style={{ marginLeft: "10px", fontSize: "1.1rem" }}>
          {index.index_name}
        </span>
        <span style={{ marginLeft: "5px" }}>
          (
          {videosData &&
            videosData.page_info &&
            videosData.page_info.total_results}{" "}
          videos)
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
