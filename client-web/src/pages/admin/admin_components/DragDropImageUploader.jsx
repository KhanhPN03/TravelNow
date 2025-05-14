import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faTrashCan } from "@fortawesome/free-regular-svg-icons";

export default function DragDropImageUploader({
  setPopUp,
  setThumbnail,
  setImgs,
  thumbnail,
  imgs,
  popUpType,
  formData,
  setFormData,
  hanldeToast,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State tạm thời cho thumb và imgs
  const [tempThumbnail, setTempThumbnail] = useState(thumbnail || []);
  const [tempImgs, setTempImgs] = useState(imgs || []);

  const fileInputRef = useRef(null);

  const selectFiles = () => {
    fileInputRef.current.click();
  };

  const onFileSelect = (event) => {
    const files = event.target.files;
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (files.length === 0) return;

    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.split("/")[0] !== "image") continue;

      const file = files[i];
      const reader = new FileReader();

      if (popUpType === "thumbnail") {
        if (tempThumbnail.length >= 1 || newImages.length >= 1) {
          setErrorMessage("You can only add 1 thumbnail.");
          return;
        }
        newImages.push({
          name: files[i].name,
          tmpUrl: URL.createObjectURL(files[i]),
          url: `/uploads/${files[i].name}`,
          file: file,
        });
      } else {
        if (tempImgs.length + newImages.length >= 4) {
          setErrorMessage("You can only add 4 images.");
          return;
        }
        newImages.push({
          name: files[i].name,
          tmpUrl: URL.createObjectURL(files[i]),
          url: `/uploads/${files[i].name}`,
          file: file,
        });
      }
    }

    if (popUpType === "thumbnail") {
      setTempThumbnail(newImages);
    } else {
      setTempImgs((prevImgs) => [...prevImgs, ...newImages]);
    }
    setErrorMessage("");
  };



  const deleteImg = (index) => {
    if (popUpType === "thumbnail") {
      // Xóa thumbnail
      setTempThumbnail([]);
      setFormData((prevData) => {
        return {
          ...prevData,
          thumbnail: [],
        };
      });
      hanldeToast("Remove thumbnail successfully!", "error");
    } else {
      // Xóa ảnh từ tempImgs
      setTempImgs((prevImgs) => prevImgs.filter((_, i) => i !== index));
      setFormData((prevData) => {
        return {
          ...prevData,
          images: (prevImgs) => prevImgs.filter((_, i) => i !== index),
        };
      });
      hanldeToast("Remove image successfully!", "error");
    }
    setErrorMessage("");
  };

  const handleUpload = () => {
    if (popUpType === "thumbnail") {
      setThumbnail(tempThumbnail);
      setFormData((prevData) => {
        return {
          ...prevData,
          thumbnail: tempThumbnail,
        };
      });
      if (tempThumbnail.length > 0) {
        hanldeToast("Upload thumbnail successfully!", "success");
      }
    } else {
      setImgs(tempImgs);
      setFormData((prevData) => {
        return {
          ...prevData,
          images: tempImgs,
        };
      });
      if (tempImgs.length > 0) {
        hanldeToast("Upload images successfully!", "success");
      }
    }
    setPopUp(false);
  };


  function onDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
    event.dataTransfer.dropEffect = "copy";
  }

  function onDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    handleFiles(files);
  }

  return (
    <div className="popUpContainerCreateTour">
      <div className="popUpCreateTour">
        <div className="popUpHeaderCreateTour">
          <div className="popUpHeaderUploadIconCreateTour">
            <img src="/images/cloud-add.svg" alt="" />
          </div>
          <div className="popUpHeaderTitleCreateTour">
            <span>Upload files</span>
            <span>Select and upload the files of your choice</span>
          </div>
          <div
            onClick={() => setPopUp(false)}
            className="popUpHeaderCloseIconCreateTour"
          >
            <FontAwesomeIcon icon={faCircleXmark} />
          </div>
        </div>

        <div className="popUpBodyCreateTour">
          <div
            className={`popUpBodyDragAreaCreateTour drag-area ${
              isDragging ? "is-dragging" : ""
            } ${errorMessage ? "error" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="popUpBodyUploadIconCreateTour">
              <img src="/images/cloud-add.svg" alt="" />
            </div>
            <div className="popUpBodyTitleCreateTour">
              {errorMessage ? (
                <span style={{ color: "red" }}>{errorMessage}</span>
              ) : isDragging ? (
                <span>Drop files here</span>
              ) : (
                <span>Choose a file or drag & drop it here</span>
              )}
              <span className="popUpBodyTitleDescriptionCreateTour">
                JPEG and PNG formats, up to 50MB
              </span>
            </div>
            {!isDragging && (
              <div className="popUpBodyBrowseBtnContainerCreateTour">
                <button
                  onClick={() => selectFiles()}
                  className="popUpBodyBrowseBtnCreateTour"
                >
                  Browse File
                </button>
              </div>
            )}
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={(event) => onFileSelect(event)}
            />
          </div>

          <div className="popUpBodyFileOverviewContainerCreateTour">
            {(popUpType === "thumbnail" ? tempThumbnail : tempImgs)
              .filter((image) => image !== "") // Lọc trước để loại bỏ ảnh rỗng
              .map((image, index) => {
                return (
                  <div key={index} className="popUpBodyFileOverviewCreateTour">
                    <div className="popUpBodyFileOverviewImageCreateTour">
                      <img src={image.tmpUrl} alt={image.name} />
                      {/* <img
                        src={image.tmpUrl ? image.tmpUrl : `http://localhost:5000${image}`}
                        alt={image.name}
                      /> */}
                    </div>
                    <div className="popUpBodyFileOverviewImageNameCreateTour">
                      <span>{image.name}</span>
                    </div>
                    <div
                      onClick={() => deleteImg(index)}
                      className="popUpBodyFileOverviewDelBtnCreateTour"
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="popUpFooterCreateTour">
          <button onClick={handleUpload}>Upload</button>
        </div>
      </div>
    </div>
  );
}
