import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function PlaceTagCreateTour({
  place,
  handleRemovePlace,
  handleChangeTmpPlace,
  disabled,
}) {
  return (
    <div className="placeTag">
      <div
        onClick={() => handleChangeTmpPlace(place.code)}
        className="placeTagName"
      >
        {place.name}
      </div>
      {!disabled && (
        <button
          disabled={disabled}
          onClick={(e) => handleRemovePlace(place.code, e)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}
