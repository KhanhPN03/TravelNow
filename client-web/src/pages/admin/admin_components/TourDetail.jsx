import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import FormInputCreateTour from "./FormInputCreateTour";
import FormDropDownCreateTour from "./FormDropDownCreateTour";
import FormDragImageCreateTour from "./FormDragImageCreateTour";
import LocationMap from "./LocationMap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import PlaceTagCreateTour from "./PlaceTagCreateTour";

import { useParams } from "react-router-dom";

function TourDetail() {
  const navigate = useNavigate();
  const { tourType, tourId } = useParams();
  const isOriginalTour = tourType === "original";
  const [imgs, setImgs] = useState([]);
  const [thumbnail, setThumbnail] = useState([]);
  const [cities, setCities] = useState([]);
  const [formDataPlacesName, setFormDataPlacesName] = useState();

  // State cho các field
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    experienceJourney: [],
    images: [],
    thumbnail: {},
    category: "",
    status: true,
    price: 0,
    experienceStart: {},
    experienceEnd: {},
    dateStart: { date: "", time: "" },
    dateEnd: "",
    totalSlots: "",
    revenue: 0,
    tmpPlace: "",
    place: [],
    language: "",
  });

  useEffect(() => {
    setImgs(formData.images);
    setThumbnail(formData.thumbnail);
  }, [formData.images, formData.thumbnail]);

  // Fetch Data cities từ static data trong public
  useEffect(() => {
    fetch("http://localhost:4000/city.json")
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  // Dùng để render tên city vì city được lưu trong DB là code
  useEffect(() => {
    const tmpPlaces =
      formData.place?.map(
        (code) => cities.find((city) => city.code === code) || { code }
      ) || [];
    setFormDataPlacesName(tmpPlaces);
  }, [formData.place, cities]);

  // Fetch Org Tour Details
  useEffect(() => {
    if (tourId) {
      const endpoint = isOriginalTour
        ? `http://localhost:5000/originalTours/${tourId}`
        : `http://localhost:5000/subsidiaryTours/${tourId}`;

      axios
        .get(endpoint)
        .then((response) => {
          if (!isOriginalTour) {
            const subTour = response.data;
            const originalTour = subTour.originalTourId;
            console.log(originalTour);
            console.log(subTour);

            setFormData({
              ...formData,
              title: originalTour.title,
              description: originalTour.description,
              duration: originalTour.duration,
              experienceJourney: originalTour.experienceJourney,
              images: originalTour.images,
              thumbnail: [originalTour.thumbnail],
              place: originalTour.place,
              price: subTour.price,
              totalSlots: subTour.totalSlots,
              guideLanguage: subTour.guideLanguage,
              dateStart: {
                date: subTour.dateStart.date,
                time: subTour.dateStart.time,
              },
              experienceStart: [subTour.experienceStart],
              experienceEnd: [subTour.experienceEnd],
            });
            setImgs(originalTour.images);
            setThumbnail(originalTour.thumbnail);
          } else {
            const originalTour = response.data;
            setFormData({
              ...formData,
              title: originalTour.title,
              description: originalTour.description,
              duration: response.data.duration,
              experienceJourney: originalTour.experienceJourney,
              images: originalTour.images,
              thumbnail: [originalTour.thumbnail],
              place: originalTour.place,
            });
            setImgs(response.data.images);
            setThumbnail(response.data.thumbnail);
          }
        })
        .catch((error) => {
          console.error("Error fetching tour:", error);
        });
    }
  }, [tourId]);

  const handleChangeTmpPlace = (place) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        tmpPlace: place,
      };
    });
  };

  // Hàm Xử lý nút back, back về page manage tour
  const handleBackButtonClick = () => {
    navigate(-1);
  };

  return (
    <>
      <section className="container createTour">
        <div className="createTourTitle">
          <button onClick={handleBackButtonClick}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>Tour Details</span>
        </div>
        <form>
          <div className="formLayoutTopCreateTour">
            <div className="formLayoutTopUploadImgCreateTour">
              <div className="formLayoutTopUploadImgItemCreateTour">
                <FormDragImageCreateTour
                  title={"Upload thumbnail"}
                  thumbnail={thumbnail}
                  imgs={imgs}
                  disabled={true}
                />
              </div>
              <div className="formLayoutTopUploadImgItemCreateTour">
                <FormDragImageCreateTour
                  title={"Upload tour images"}
                  thumbnail={thumbnail}
                  imgs={imgs}
                  disabled={true}
                />
              </div>
            </div>
            <FormInputCreateTour
              fieldName={"Title"}
              fieldObj={"title"}
              setFormData={setFormData}
              formData={formData}
              disabled={true}
            />
            <FormInputCreateTour
              fieldName={"Description"}
              fieldObj={"description"}
              setFormData={setFormData}
              formData={formData}
              disabled={true}
            />
          </div>

          <div className="formLayoutBottomCreateTour">
            <div className="formLayoutBottomLayoutCreateTour">
              {tourType === "original" ? (
                <div className="formLayoutBottomLayoutLeftFirstColumnCreateTour">
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Duration - day(s)"}
                      fieldObj={"duration"}
                      setFormData={setFormData}
                      formData={formData}
                      isNum={true}
                      disabled={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="formLayoutBottomLayoutLeftFirstColumnCreateTour">
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Price"}
                      fieldObj={"price"}
                      setFormData={setFormData}
                      formData={formData}
                      isNum={true}
                      disabled={true}
                    />
                  </div>
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Slot"}
                      fieldObj={"totalSlots"}
                      setFormData={setFormData}
                      formData={formData}
                      isNum={true}
                      disabled={true}
                    />
                  </div>
                </div>
              )}

              {tourType === "subsidiary" && (
                <div style={{ display: "flex", gap: "50px" }}>
                  <FormInputCreateTour
                    fieldName={"Start Date"}
                    fieldObj={"dateStart"}
                    setFormData={setFormData}
                    formData={formData}
                    disabled={true}
                  />
                  <FormInputCreateTour
                    fieldName={"Start Time"}
                    fieldObj={"timeStart"}
                    setFormData={setFormData}
                    formData={formData}
                    disabled={true}
                  />
                </div>
              )}
            </div>
            <div className="formLayoutBottomLayoutCreateTour">
              {tourType !== "original" && (
                <div className="formLayoutBottomLayoutLeftFirstColumnCreateTour">
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Duration"}
                      fieldObj={"duration"}
                      setFormData={setFormData}
                      formData={formData}
                      disabled={true}
                    />
                  </div>
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormDropDownCreateTour
                      dropDownLabel={"Language"}
                      dropDownType={"language"}
                      disabled={true}
                      formData={formData}
                    />
                  </div>
                </div>
              )}

              <FormDropDownCreateTour
                dropDownLabel={"Place"}
                dropDownType={"place"}
                disabled={true}
                initialPlace={formData.place}
              />
              {formData.place.length > 0 && (
                <div className="placeTagContainer">
                  {formDataPlacesName.map((place) => (
                    <PlaceTagCreateTour
                      place={place}
                      disabled={true}
                      handleChangeTmpPlace={handleChangeTmpPlace}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {tourType !== "original" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "32px",
              }}
            >
              <div className="locationMap" style={{ flex: 1 }}>
                <LocationMap
                  title={"Journey Start"}
                  initialStartLocation={formData.experienceStart}
                  place={formData.tmpPlace}
                  disabled={true}
                />
              </div>
              <div className="locationMap" style={{ flex: 1 }}>
                <LocationMap
                  title={"Journey End"}
                  initialEndLocation={formData.experienceEnd}
                  place={formData.tmpPlace}
                  disabled={true}
                />
              </div>
            </div>
          )}
          <div className="locationMap">
            <LocationMap
              title={"Journey Activities"}
              initialLocations={formData.experienceJourney}
              place={formData.tmpPlace}
              disabled={true}
            />
          </div>
        </form>
      </section>
    </>
  );
}

export default TourDetail;
