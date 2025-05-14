import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import PlaceTagCreateTour from "./PlaceTagCreateTour";

export default function FormDropDownCreateTour({
  dropDownType,
  dropDownLabel,
  orgTours,
  guideList,
  handleChange,
  disabled,
  error,
  initialPlace,
  handleRemovePlace,
  handleChangeTmpPlace,
  formData,
}) {
  const [cities, setCities] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/city.json")
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      const tmpPlaces = initialPlace?.map(
        (code) => cities.find((city) => city.code === code) || { code }
      );
      setPlaces(tmpPlaces);
    }
  }, [initialPlace, cities]);

  return (
    <div className="dayMonthYearDropDown ffGTRegular fs-16 clrDarkBlue dropDownCreateTour">
      <label htmlFor={dropDownLabel}>{dropDownLabel}</label>

      <div className="dayMonthYearDropDownContent tourTypesCreateTour mt6CreateTour">
        {dropDownType === "tourType" && (
          <select
            id={dropDownLabel}
            onChange={handleChange}
            defaultValue="Create Original"
          >
            <option value="Replicate Original">Replicate Original</option>
            <option value="Create Original">Create Original</option>
          </select>
        )}
        {dropDownType === "original" && (
          <select id={dropDownLabel} onChange={handleChange} defaultValue="">
            <option value="" disabled>
              Select Original Tour
            </option>
            {orgTours.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.title}
              </option>
            ))}
          </select>
        )}
        {dropDownType === "guide" && (
          <select id={dropDownLabel} onChange={handleChange} defaultValue="">
            <option value="" disabled>
              Select Tour Guide
            </option>
            {guideList.map((guide) => (
              <option key={guide._id} value={guide._id}>
                {guide.username}
              </option>
            ))}
          </select>
        )}
        {dropDownType === "language" && (
          <>
            <select
              id={dropDownLabel}
              // defaultValue=""
              value={formData?.guideLanguage || ""}
              onChange={handleChange}
              disabled={disabled}
            >
              <option value="" disabled>
                Select Language
              </option>
              <option value="English">English</option>
              <option value="Vietnamese">Vietnamese</option>
            </select>
            <p className="createTourErrorMessage">{error && error}</p>
          </>
        )}
        {dropDownType === "place" && (
          <>
            <select
              id={dropDownLabel}
              // value={initialPlace}
              defaultValue=""
              onChange={handleChange}
              disabled={disabled}
              style={{ fontFamily: "Roboto-regular" }}
            >
              <option value="" disabled>
                Select Tour Place
              </option>
              {cities.map((city, index) => (
                <option key={index} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
            <p className="createTourErrorMessage">{error && error}</p>
          </>
        )}
        {dropDownType === "binType" && (
          <select
            id={dropDownLabel}
            onChange={handleChange}
            defaultValue="Original Tour"
          >
            <option value="Original Tour">Original Tour</option>
            <option value="Subsidiary Tour">Subsidiary Tour</option>
            <option value="Discount">Discount</option>
            <option value="Account">Account</option>
          </select>
        )}

        <span className="dayMonthYearDropDownContentIcon">
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </div>

      {/* {dropDownType === "place" && (
        <div className="placeTagContainer">
          {places.map((place) => (
            <PlaceTagCreateTour
              place={place}
              handleRemovePlace={handleRemovePlace}
              handleChange={handleChange}
              handleChangeTmpPlace={handleChangeTmpPlace}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}
