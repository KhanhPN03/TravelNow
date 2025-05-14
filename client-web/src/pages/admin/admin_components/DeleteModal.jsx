import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
// Component DeleteModal
const DeleteModal = ({ isOpen, onClose, onDelete, selectedCount }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modalDelete">
        <div className="modalDeletePadding">
          <p className="modalDeleteConten clrDarkBlue ffGTBold">
            <strong className="F20 modalDeleteContenTitle">
              Are you sure?
            </strong>
          </p>
          <p className="modalDeleteConten modalDeleteContenDetail fs-16 ffGTRegular">
            You are about to delete {selectedCount} item
            {selectedCount > 1 ? "s" : ""}, this action cannot be undone.
          </p>
          <div className="modalActionsDelete ffGTRegular fs-14">
            <button className="btnDelete btnModalD" onClick={onDelete}>
              <div className="deleteButtonTicketConten">
                <FontAwesomeIcon icon={faTrashCan} />
              </div>{" "}
              Delete
            </button>
            <button className="btnModalD btCancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
