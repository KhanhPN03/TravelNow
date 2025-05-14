import ImgsOverviewCreateTour from "./ImgsOverviewCreateTour";
import ThumbnailOverviewCreateTour from "./ThumbnailOverviewCreateTour";

export default function FormDragImageCreateTour({
  title,
  setPopUp,
  setPopUpType,
  thumbnail,
  imgs,
  disabled,
  handleToast,
  error,
}) {
  const handleClick = () => {
    if (!disabled) {
      setPopUpType(title === "Upload thumbnail" ? "thumbnail" : "imgs");
      setPopUp(true);
    } else {
      if (setPopUp) {
        setPopUp(false);
      }
    }
  };

  return (
    <div onClick={handleClick} className="uploadImgCreateTour clrDarkBlue">
      <label>{title}</label>

      {title === "Upload thumbnail" ? (
        thumbnail?.length > 0 ? (
          <ThumbnailOverviewCreateTour
            thumbnail={thumbnail}
            setPopUp={setPopUp}
            setPopUpType={setPopUpType}
            disabled={disabled}
          />
        ) : (
          <UploadPlaceholder />
        )
      ) : imgs?.length > 0 ? (
        <ImgsOverviewCreateTour
          imgs={imgs}
          setPopUp={setPopUp}
          setPopUpType={setPopUpType}
          disabled={disabled}
        />
      ) : (
        <UploadPlaceholder />
      )}
      <p className="createTourErrorMessage" style={{ textAlign: "center" }}>
        {error && error}
      </p>
    </div>
  );
}

// Component tách riêng để tránh lặp lại mã HTML
const UploadPlaceholder = () => (
  <div className="uploadImgBtnContainerCreateTour">
    <div className="uploadImgBtnCreateTour">
      <div className="uploadImgBtnIconCreateTour">
        <img src="/images/upload.svg" alt="Upload Icon" />
      </div>
      <span>Click to upload</span>
    </div>
  </div>
);
