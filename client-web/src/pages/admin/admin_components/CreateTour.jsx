// import "./createtour.css";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import FormInputCreateTour from "./FormInputCreateTour";
import FormDropDownCreateTour from "./FormDropDownCreateTour";
import FormDragImageCreateTour from "./FormDragImageCreateTour";
import DragDropImageUploader from "./DragDropImageUploader";
import LocationMap from "./LocationMap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { ToastContainer, toast } from "react-toastify";
import PlaceTagCreateTour from "./PlaceTagCreateTour";
import { Context } from "../../../context/ContextProvider";
function CreateTour() {
  const navigate = useNavigate();

  // State cho Pop-up upload images và thumbnail
  const [popUp, setPopUp] = useState(false);
  const [popUpType, setPopUpType] = useState();
  const { user } = useContext(Context);

  // State để xác định form tạo tour
  const [tourTypeCreate, setTourTypeCreate] = useState("Create Original");

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
    guideLanguage: "",
    tourGuide: "",
  });

  console.log("formData", formData);

  const [imgs, setImgs] = useState([]);
  const [thumbnail, setThumbnail] = useState([]);

  const [orgTours, setOrgTours] = useState([]);
  const [orgTourId, setOrgTourId] = useState();

  const [resetLocations, setResetLocations] = useState(false);
  const [resetStartEndPoint, setResetStartEndPoint] = useState(false);

  const [guideList, setGuideList] = useState([]);

  // State báo lỗi
  const [errors, setErrors] = useState({});

  // Khi mở pop-up sẽ không thể scroll screen
  useEffect(() => {
    if (popUp) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    // Cleanup khi component unmount
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [popUp]);

  useEffect(() => {
    setImgs(formData.images);
    setThumbnail(formData.thumbnail);
  }, [formData.images, formData.thumbnail]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/originalTour/`)
      .then((data) => setOrgTours(data.data.originalTours));
    notify(`Change to ${tourTypeCreate}`, "warn");
    setFormData({
      title: "",
      description: "",
      duration: "",
      experienceJourney: [],
      images: [],
      thumbnail: "",
      category: "",
      status: true,
      price: "",
      experienceStart: "",
      experienceEnd: "",
      dateStart: { date: "", time: "" },
      dateEnd: "",
      totalSlots: "",
      revenue: 0,
      tmpPlace: "",
      place: [],
    });
    setErrors({});
    // setResetLocations(true);
    axios
      .get(`http://localhost:5000/account/guide/`)
      .then((data) => setGuideList(data.data.guides));
  }, [tourTypeCreate]);

  // Fetch Data cities từ static data trong public
  const [cities, setCities] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/city.json")
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  // Dùng để render tên city vì city được lưu trong DB là code
  const [formDataPlacesName, setFormDataPlacesName] = useState();
  useEffect(() => {
    const tmpPlaces =
      formData.place?.map(
        (code) => cities.find((city) => city.code === code) || { code }
      ) || [];

    setFormDataPlacesName(tmpPlaces);
  }, [formData.place]);

  // Fetch Org Tour Details
  useEffect(() => {
    if (orgTourId) {
      axios
        .get(`http://localhost:5000/originalTour/${orgTourId}`)
        .then((response) => {
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
        })
        .catch((error) => {
          console.error("Error fetching original tour:", error); // Handle any errors
        });
    }
  }, [orgTourId]);

  // Hàm xử lý thêm location, được truyền vào component LocationMap
  const handleAddLocation = (point, newLocation) => {
    setFormData((prevData) => {
      if (point === "start") {
        return {
          ...prevData,
          experienceStart: newLocation[0], // Chỉ có một phần tử duy nhất
        };
      } else if (point === "end") {
        return {
          ...prevData,
          experienceEnd: newLocation[0], // Chỉ có một phần tử duy nhất
        };
      } else {
        return {
          ...prevData,
          experienceJourney: newLocation,
        };
      }
    });
  };

  // Hàm Xử lý nút back, back về page manage tour
  const handleBackButtonClick = () => {
    navigate(-1);
  };

  function calculateDateEnd(dateStart, duration) {
    let startDate = new Date(dateStart);
    let dateEnd = new Date(startDate);

    dateEnd.setDate(startDate.getDate() + (duration - 1));

    return dateEnd.toISOString().split("T")[0]; // Trả về YYYY-MM-DD
  }

  // console.log("formData place", formData.place);

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Kiểm tra các trường bắt buộc
    const requiredFields =
      tourTypeCreate === "Replicate Original"
        ? {
            price: "Price",
            experienceStart: "Experience Start",
            experienceEnd: "Experience End",
            dateStartDate: "Start Date",
            dateStartTime: "Start Time",
            totalSlots: "Total Slots",
            guideLanguage: "Language",
          }
        : {
            title: "Title",
            description: "Description",
            duration: "Duration",
            experienceJourney: "Experience Journey",
            images: "Images",
            thumbnail: "Thumbnail",
            place: "Place",
          };

    const newErrors = {};
    Object.keys(requiredFields).forEach((key) => {
      if (key === "dateStartDate" && !formData.dateStart.date) {
        newErrors[key] = `${requiredFields[key]} is required`;
      } else if (key === "dateStartTime" && !formData.dateStart.time) {
        newErrors[key] = `${requiredFields[key]} is required`;
      } else if (
        key === "experienceJourney" &&
        formData.experienceJourney.length === 0
      ) {
        newErrors[key] = `${requiredFields[key]} is required`;
      } else if (key === "place" && formData.place.length === 0) {
        newErrors[key] = `${requiredFields[key]} is required`;
      } else if (key === "thumbnail" && formData.thumbnail.length !== 1) {
        newErrors[key] = "Exactly one thumbnail image is required";
      } else if (
        key === "images" &&
        (formData.images.length < 1 || formData.images.length > 4)
      ) {
        newErrors[key] = "At least one and up to four tour images are required";
      } else if (
        key !== "dateStartDate" &&
        key !== "dateStartTime" &&
        !formData[key]
      ) {
        newErrors[key] = `${requiredFields[key]} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let thumbnailPath;
    let imagePaths;

    const formDataImg = new FormData();
    formDataImg.append("thumbnail", formData.thumbnail[0].file);
    formData.images.forEach((img) => {
      formDataImg.append("images", img.file);
    });

    try {
      const response = await fetch(`http://localhost:5000/upload`, {
        method: "POST",
        body: formDataImg,
      });

      const data = await response.json();
      thumbnailPath = data.thumbnailPath;
      imagePaths = data.imagePaths;
    } catch (error) {
      console.error(error);
    }

    // Gửi dữ liệu lên server
    if (tourTypeCreate === "Create Original") {
      axios
        .post("http://localhost:5000/originalTours/", {
          originalTourCode: "O",
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          experienceJourney: formData.experienceJourney,
          images: imagePaths,
          thumbnail: thumbnailPath,
          category: formData.duration > 1 ? "LONG-TRIP" : "ADVENTURE",
          status: true,
          place: formData.place,
          createdBy: user?.user._id,
          isDeleted: false,
        })
        .then(() => {
          setFormData({
            title: "",
            description: "",
            duration: "",
            experienceJourney: [],
            images: [],
            thumbnail: "",
            category: "",
            status: true,
            price: "",
            experienceStart: "",
            experienceEnd: "",
            dateStart: { date: "", time: "" },
            dateEnd: "",
            totalSlots: "",
            revenue: 0,
            tmpPlace: "",
            place: [],
            guideLanguage: "",
          });
          setErrors({});
          setResetLocations(true);
          notify("Original Tour created successfully!", "success");
        })
        .catch((error) => {
          console.error("Error creating tour:", error.response.data);
          setErrors({ form: error.response.data.message });
        });
    } else {
      axios
        .post("http://localhost:5000/subsidiaryTours/", {
          subTourCode: "S",
          guidedBy: formData.tourGuide,
          originalTourId: orgTourId,
          createdBy: user?.user._id,
          price: formData.price,
          experienceStart: { ...formData.experienceStart },
          experienceEnd: formData.experienceEnd,
          dateStart: formData.dateStart,
          dateEnd: calculateDateEnd(formData.dateStart.date, formData.duration),
          totalSlots: formData.totalSlots,
          availableSlots: formData.totalSlots,
          status: true,
          revenue: 0,
          guideLanguage: formData.guideLanguage,
          hide: false,
          isCanceled: false,
          isDeleted: false,
        })
        .then(() => {
          setFormData((prev) => {
            return {
              ...prev,
              price: "",
              experienceStart: {},
              experienceEnd: {},
              dateStart: { date: "", time: "" },
              totalSlots: "",
            };
          });
          setErrors({});
          setResetStartEndPoint(true);
          notify("Subsidiary Tour created successfully!", "success");
        })
        .catch((error) => {
          console.error("Error creating tour:", error.response.data);
          setErrors({ form: error.response.data.message });
        });
    }
  };

  const handleOrgTourId = (e) => {
    const selectedTourId = e.target.value;
    setOrgTourId(selectedTourId);
  };

  const handleTourGuide = (e) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        tourGuide: e.target.value,
      };
    });
  };

  const notify = (message, status) => {
    if (status === "success") {
      return toast.success(message);
    }
    if (status === "error") {
      return toast.error(message);
    }
    if (status === "warn") {
      return toast.warning(message);
    }
  };

  const handleChangeTourType = (e) => {
    setTourTypeCreate(e.target.value);
  };

  const handleChangePlace = (e) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        place: [...prevData.place, e.target.value],
        tmpPlace: e.target.value,
      };
    });
    notify(`Add place successfully`, "success");
  };

  const handleChangeTmpPlace = (place) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        tmpPlace: place,
      };
    });
  };

  const handleChangeLanguage = (e) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        guideLanguage: e.target.value,
      };
    });
  };

  const handleRemovePlace = (placeName, e) => {
    e.preventDefault();
    setFormData((prevFormData) => ({
      ...prevFormData,
      place: prevFormData.place.filter((place) => place !== placeName),
    }));
    notify(`Remove place successfully`, "error");
  };

  return (
    <>
      <section className="container createTour">
        <div className="createTourTitle">
          <button onClick={() => handleBackButtonClick()}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>Create Tour</span>
        </div>
        <form>
          <div className="formLayoutTopCreateTour">
            <FormDropDownCreateTour
              dropDownLabel={"Create type"}
              dropDownType={"tourType"}
              // setTourTypeCreate={setTourTypeCreate}
              handleChange={handleChangeTourType}
            />

            {tourTypeCreate === "Replicate Original" && (
              <>
                <div className="formLayoutTopOriginalTourCreateTour">
                  <FormDropDownCreateTour
                    dropDownLabel={"Original"}
                    dropDownType={"original"}
                    // setTourTypeCreate={setTourTypeCreate}
                    orgTours={orgTours}
                    handleChange={handleOrgTourId}
                  />
                </div>
                <div className="formLayoutTopOriginalTourCreateTour">
                  <FormDropDownCreateTour
                    dropDownLabel={"Tour guide"}
                    dropDownType={"guide"}
                    // setTourTypeCreate={setTourTypeCreate}
                    // orgTours={orgTours}
                    guideList={guideList}
                    handleChange={handleTourGuide}
                  />
                </div>
              </>
            )}

            <div className="formLayoutTopUploadImgCreateTour">
              <div className="formLayoutTopUploadImgItemCreateTour">
                <FormDragImageCreateTour
                  setPopUp={setPopUp}
                  setPopUpType={setPopUpType}
                  title={"Upload thumbnail"}
                  thumbnail={thumbnail}
                  imgs={imgs}
                  disabled={tourTypeCreate === "Replicate Original"}
                  handleToast={notify}
                  error={errors.thumbnail}
                />
              </div>
              <div className="formLayoutTopUploadImgItemCreateTour">
                <FormDragImageCreateTour
                  setPopUp={setPopUp}
                  setPopUpType={setPopUpType}
                  title={"Upload tour images"}
                  thumbnail={thumbnail}
                  imgs={imgs}
                  disabled={tourTypeCreate === "Replicate Original"}
                  handleToast={notify}
                  error={errors.images}
                />
              </div>
            </div>
            <FormInputCreateTour
              fieldName={"Title"}
              fieldObj={"title"}
              setFormData={setFormData}
              formData={formData}
              disabled={tourTypeCreate === "Replicate Original"}
              error={errors.title}
            />
            <FormInputCreateTour
              fieldName={"Description"}
              fieldObj={"description"}
              setFormData={setFormData}
              formData={formData}
              disabled={tourTypeCreate === "Replicate Original"}
              error={errors.description}
            />
          </div>

          <div className="formLayoutBottomCreateTour">
            <div className="formLayoutBottomLayoutCreateTour">
              {tourTypeCreate === "Create Original" ? (
                <div className="formLayoutBottomLayoutLeftFirstColumnCreateTour">
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Duration - day(s)"}
                      fieldObj={"duration"}
                      setFormData={setFormData}
                      formData={formData}
                      isNum={true}
                      error={errors.duration}
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
                      error={errors.price}
                    />
                  </div>
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Slot"}
                      fieldObj={"totalSlots"}
                      setFormData={setFormData}
                      formData={formData}
                      isNum={true}
                      error={errors.totalSlots}
                    />
                  </div>
                </div>
              )}

              {tourTypeCreate !== "Create Original" && (
                <div style={{ display: "flex", gap: "50px" }}>
                  <FormInputCreateTour
                    fieldName={"Start Date"}
                    fieldObj={"dateStart"}
                    setFormData={setFormData}
                    formData={formData}
                    error={errors.dateStartDate}
                  />
                  <FormInputCreateTour
                    fieldName={"Start Time"}
                    fieldObj={"timeStart"}
                    setFormData={setFormData}
                    formData={formData}
                    // isNum={true}
                    error={errors.dateStartTime}
                  />
                </div>
              )}
            </div>
            <div className="formLayoutBottomLayoutCreateTour">
              {tourTypeCreate !== "Create Original" && (
                <div className="formLayoutBottomLayoutLeftFirstColumnCreateTour">
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormInputCreateTour
                      fieldName={"Duration"}
                      fieldObj={"duration"}
                      setFormData={setFormData}
                      formData={formData}
                      disabled={tourTypeCreate === "Replicate Original"}
                    />
                  </div>
                  <div className="formLayoutBottomLayoutLeftFirstColumnItemCreateTour">
                    <FormDropDownCreateTour
                      dropDownLabel={"Language"}
                      dropDownType={"language"}
                      handleChange={handleChangeLanguage}
                      error={errors.guideLanguage}
                      formData={formData}
                    />
                  </div>
                </div>
              )}

              <FormDropDownCreateTour
                dropDownLabel={"Place"}
                dropDownType={"place"}
                handleChange={handleChangePlace}
                disabled={tourTypeCreate === "Replicate Original"}
                error={errors.place}
                initialPlace={formData.place}
                handleRemovePlace={handleRemovePlace}
                handleChangeTmpPlace={handleChangeTmpPlace}
              />
              {formData.place.length > 0 && (
                <div className="placeTagContainer">
                  {formDataPlacesName.map((place) => (
                    <PlaceTagCreateTour
                      place={place}
                      handleRemovePlace={handleRemovePlace}
                      handleChange={handleChangePlace}
                      handleChangeTmpPlace={handleChangeTmpPlace}
                      disabled={tourTypeCreate !== "Create Original"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {tourTypeCreate !== "Create Original" && (
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
                  tourTypeCreate={tourTypeCreate}
                  onAddLocation={handleAddLocation}
                  // initialLocations={formData.experienceJourney}
                  place={formData.tmpPlace}
                  // resetLocations={resetLocations}
                  resetStartEndPoint={resetStartEndPoint}
                  handleToast={notify}
                  error={errors.experienceStart}
                />
              </div>
              <div className="locationMap" style={{ flex: 1 }}>
                <LocationMap
                  title={"Journey End"}
                  tourTypeCreate={tourTypeCreate}
                  onAddLocation={handleAddLocation}
                  // initialLocations={formData.experienceJourney}
                  place={formData.tmpPlace}
                  // resetLocations={resetLocations}
                  resetStartEndPoint={resetStartEndPoint}
                  handleToast={notify}
                  error={errors.experienceEnd}
                />
              </div>
            </div>
          )}
          <div className="locationMap">
            <LocationMap
              title={"Journey Activities"}
              tourTypeCreate={tourTypeCreate}
              onAddLocation={handleAddLocation}
              initialLocations={formData.experienceJourney}
              place={formData.tmpPlace}
              resetLocations={resetLocations}
              handleToast={notify}
              disabled={tourTypeCreate === "Replicate Original"}
              error={errors.experienceJourney}
            />
          </div>

          <div className="formSubmitBtnCreateTour">
            <button onClick={(e) => handleSubmit(e)}>Save</button>
          </div>
        </form>
        {popUp && (
          <DragDropImageUploader
            imgs={imgs}
            setImgs={setImgs}
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            setPopUp={setPopUp}
            popUpType={popUpType}
            formData={formData}
            setFormData={setFormData}
            hanldeToast={notify}
          />
        )}
        <ToastContainer style={{ width: "auto" }} />
      </section>
    </>
  );
}

export default CreateTour;
