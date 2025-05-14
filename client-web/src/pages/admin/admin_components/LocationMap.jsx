import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Location from "./Location";

// Cấu hình icon marker mặc định
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41], // Kích thước của icon
  iconAnchor: [12, 41], // Điểm neo của icon
  popupAnchor: [1, -34], // Vị trí hiển thị popup so với icon
  shadowSize: [41, 41], // Kích thước của bóng
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = ({
  onAddLocation,
  resetLocations,
  initialLocations,
  initialStartLocation,
  initialEndLocation,
  disabled,
  tourTypeCreate,
  title,
  resetStartEndPoint,
  handleToast,
  place,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // Mảng lưu các địa điểm được thêm bằng cách click
  const [locations, setLocations] = useState([]);
  const [startPoint, setStartPoint] = useState([]);
  const [endPoint, setEndPoint] = useState([]);
  // Kết quả tìm kiếm
  const [searchResult, setSearchResult] = useState(null);
  const [tmpPlace, setTmpPlace] = useState();

  // Cập nhật locations từ initialLocations
  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations([...initialLocations]);
    }
  }, [initialLocations]);

  useEffect(() => {
    if (initialStartLocation && initialStartLocation.length > 0) {
      setStartPoint([...initialStartLocation]);
    }
  }, [initialStartLocation]);

  useEffect(() => {
    if (initialEndLocation && initialEndLocation.length > 0) {
      setEndPoint([...initialEndLocation]);
    }
  }, [initialEndLocation]);

  const prevLocationsRef = useRef([]);
  useEffect(() => {
    if (
      locations.length > 0 &&
      JSON.stringify(prevLocationsRef.current) !== JSON.stringify(locations) &&
      !disabled
    ) {
      onAddLocation("journey", locations);
      prevLocationsRef.current = locations; // Lưu lại giá trị trước đó
    }
  }, [locations]);

  const prevStartPointRef = useRef([]);
  useEffect(() => {
    if (
      startPoint.length > 0 &&
      JSON.stringify(prevStartPointRef.current) !==
        JSON.stringify(startPoint) &&
      !disabled
    ) {
      onAddLocation("start", startPoint);
      prevStartPointRef.current = startPoint; // Lưu lại giá trị trước đó
    }
  }, [startPoint]);

  const prevEndPointRef = useRef([]);
  useEffect(() => {
    if (
      endPoint.length > 0 &&
      JSON.stringify(prevEndPointRef.current) !== JSON.stringify(endPoint) &&
      !disabled
    ) {
      onAddLocation("end", endPoint);
      prevEndPointRef.current = endPoint; // Lưu lại giá trị trước đó
    }
  }, [endPoint]);

  // resetLocations là state sau khi submit thành công
  useEffect(() => {
    // if (resetLocations) {
    // }
    setLocations([]);
  }, [resetLocations, tourTypeCreate]);

  // resetLocations là state sau khi submit thành công
  useEffect(() => {
    if (resetStartEndPoint) {
      setStartPoint([]);
      setEndPoint([]);
    }
  }, [resetStartEndPoint]);

  // tourTypeCreate là state khi đổi form
  // useEffect(() => {
  //   setLocations([]);
  // }, [tourTypeCreate]);

  const [cities, setCities] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/city.json")
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    cities.map((city) => {
      if (city.code === place) {
        handlePlace(city.name);
        return null;
      }
    });
  }, [place]);

  const [mapOption, setMapOption] = useState();

  // Lấy map instance để điều khiển bản đồ
  const MapEvents = () => {
    const mapInstance = useMap();
    useEffect(() => {
      if (tmpPlace && !mapOption) {
        mapInstance.setView([tmpPlace.lat, tmpPlace.lon], 15);
        return;
      }
      if (searchResult && mapOption) {
        mapInstance.setView([searchResult.lat, searchResult.lon], 15);
        return;
      }
    }, [mapInstance, searchResult, tmpPlace]);

    return null;
  };

  // Xử lý khi người dùng click vào bản đồ
  const MapClickHandler = () => {
    useMapEvent("click", async (e) => {
      const { lat, lng } = e.latlng;

      if (!disabled) {
        try {
          // Gọi API reverse geocoding để lấy địa chỉ từ tọa độ
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();

          // Lấy địa chỉ từ kết quả API
          const address = data.display_name || "Unknown Location";

          // Thêm địa điểm vào mảng locations
          const newLocation = {
            id: Date.now(), // Tạo ID duy nhất
            lat,
            lon: lng,
            name: address, // Sử dụng địa chỉ làm tên
            locationName: address,
            locationActivities: "Sightseeing",
          };

          if (title === "Journey Start") {
            setStartPoint([newLocation]);
            handleToast("Add Journey Start Successfully!", "success");
          } else if (title === "Journey End") {
            setEndPoint([newLocation]);
            handleToast("Add Journey End Successfully!", "success");
          } else {
            setLocations((prev) => [...prev, newLocation]);
            handleToast("Add Journey Activity Successfully!", "success");
          }
        } catch (error) {
          console.error("Reverse Geocoding Error:", error);
          alert("Failed to fetch location details. Please try again.");
        }
      }
    });

    return null;
  };

  // Xử lý khi người dùng tìm kiếm
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery) return;

    try {
      // Tìm kiếm địa điểm từ OpenStreetMap (Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];

        // Lưu kết quả tìm kiếm (chỉ để di chuyển bản đồ, không thêm vào mảng locations)
        setSearchResult({ lat, lon, name: display_name });
        setMapOption(true);
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  const handlePlace = async (place) => {
    // e.preventDefault();

    if (!place) return;

    try {
      // Tìm kiếm địa điểm từ OpenStreetMap (Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place
        )}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        // console.log("handlePlace", { lat, lon, name: display_name });

        // Lưu kết quả tìm kiếm (chỉ để di chuyển bản đồ, không thêm vào mảng locations)
        setTmpPlace({ lat, lon, name: display_name });
        setMapOption(false);
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Search Error:", error);
    }
  };

  // Xử lý khi người dùng xóa địa điểm
  const handleRemoveLocation = (id) => {
    const updatedLocations = locations.filter((loc) => loc.id !== id);
    setLocations(updatedLocations);
    handleToast("Remove location successfully!", "error");
  };

  const handleRemoveStartLocation = (id) => {
    const updatedLocations = startPoint.filter((loc) => loc.id !== id);
    setStartPoint(updatedLocations);
    handleToast("Remove start location successfully!", "error");
  };

  const handleRemoveEndLocation = (id) => {
    const updatedLocations = endPoint.filter((loc) => loc.id !== id);
    setEndPoint(updatedLocations);
    handleToast("Remove end location successfully!", "error");
  };

  const handleUpdateLocation = (id, key, value) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) => {
        return loc.id === id ? { ...loc, [key]: value } : loc;
      })
    );
  };

  const handleUpdateStartLocation = (key, value) => {
    setStartPoint((loc) => {
      return {
        ...loc,
        [key]: value,
      };
    });
  };

  const handleUpdateEndLocation = (key, value) => {
    setEndPoint((loc) => {
      return {
        ...loc,
        [key]: value,
      };
    });
  };

  return (
    <div>
      <div className="locationMapSearchContainer">
        <label htmlFor="location">{title}</label>
        <div className="locationMapSearchInputContainer">
          <input
            className="locationMapSearchInput"
            id="location"
            type="text"
            placeholder="Enter city, place, etc"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" onClick={handleSearch}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
        <p className="createTourErrorMessage">{error && error}</p>
      </div>

      {/* MapContainer và TileLayer */}
      <MapContainer
        id="map"
        style={{ height: "500px", width: "100%" }}
        center={[10.7769, 106.7009]}
        zoom={13}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapEvents /> {/* Để có thể sử dụng map instance */}
        <MapClickHandler /> {/* Xử lý sự kiện click trên bản đồ */}
        {/* Hiển thị các marker đã thêm bằng cách click */}
        {title === "Journey Start" &&
          startPoint.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lon]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        {title === "Journey End" &&
          endPoint.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lon]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        {title !== "Journey Start" &&
          title !== "Journey End" &&
          locations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lon]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
      </MapContainer>

      <div>
        <h3 className="locationListLHeader">📍Locations</h3>

        <div className="locationList">
          {title === "Journey Start" &&
            startPoint.map((loc) => (
              <Location
                key={loc.id}
                location={loc}
                handleRemoveLocation={handleRemoveStartLocation}
                handleUpdateLocation={handleUpdateStartLocation}
                disabled={disabled}
              />
            ))}
          {title === "Journey End" &&
            endPoint.map((loc) => (
              <Location
                key={loc.id}
                location={loc}
                handleRemoveLocation={handleRemoveEndLocation}
                handleUpdateLocation={handleUpdateEndLocation}
                disabled={disabled}
              />
            ))}
          {title !== "Journey Start" &&
            title !== "Journey End" &&
            locations.map((loc) => (
              <Location
                key={loc.id}
                location={loc}
                handleRemoveLocation={handleRemoveLocation}
                handleUpdateLocation={handleUpdateLocation}
                disabled={disabled}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
