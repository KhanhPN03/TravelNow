import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Location({
  location,
  handleRemoveLocation,
  handleUpdateLocation,
  disabled,
}) {
  return (
    <div className="locationDetailsContainer">
      <div className="formInputContainer clrDarkBlue locationDetailsInput">
        <label htmlFor="locationName">Location Name</label>
        <input
          className="mt6CreateTour"
          type="text"
          id="locationName"
          value={location.locationName || ""}
          onChange={(e) =>
            handleUpdateLocation(location.id, "locationName", e.target.value)
          }
          disabled={disabled}
        />
      </div>
      <div className="formInputContainer clrDarkBlue locationDetailsInput">
        <label htmlFor="locationActivities">Location Activities</label>
        <input
          className="mt6CreateTour"
          type="text"
          id="locationActivities"
          value={location.locationActivities || ""}
          onChange={(e) =>
            handleUpdateLocation(
              location.id,
              "locationActivities",
              e.target.value
            )
          }
          disabled={disabled}
        />
      </div>
      <div className="locationDetailsAdressLatLonContainer">
        <div className="locationDetailsAddress">
          <div>Address</div>
          <div>{location.name}</div>
        </div>
        <div className="locationLatLonContainer">
          <FontAwesomeIcon icon={faLocationCrosshairs} />
          <div className="locationLatLon">
            <span>{location.lat}, </span>
            <span>{location.lon}</span>
          </div>
        </div>
      </div>
      <div
        className="locationDetailsRemove"
        onClick={() => {
          if (!disabled) {
            handleRemoveLocation(location.id);
          }
        }}
      >
        <FontAwesomeIcon
          style={{ color: disabled ? "grey" : "red" }}
          icon={faTrash}
        />
      </div>
    </div>
  );
}
