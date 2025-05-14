from flask import Flask
from flask import Flask, render_template, request
import os
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import json

from flask import jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "static"
# CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
CORS(app)


# Load mô hình đã lưu
def load_saved_model(model_path, label_path):
    # Load mô hình
    model = load_model(model_path)
    
    print(f"Model loaded from {model_path}")
    
    # Load labels
    with open(label_path, "r") as f:
        labels = json.load(f)
    print(f"Labels loaded from {label_path}")
    return model, labels

# Phân loại ảnh
def classify_image(model, image_path, target_size):
    # Load và tiền xử lý ảnh
    img = load_img(image_path, target_size=target_size)
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Thêm chiều batch
    #img_array = img_array / 255.0  # Chuẩn hóa (nếu mô hình yêu cầu)
    
    # Dự đoán
    predictions = model.predict(img_array)
    
    predicted_class = np.argmax(predictions, axis=1)[0]

    return predicted_class

# Hiển thị thông tin class được phân loại
def display_classification(class_label, classes):
    
    print(f"Image classified as: {classes[class_label]}")
    return classes[class_label]

model_path = "model.h5"
label_path = "labels.json"
target_size = (224, 224)  # Kích thước ảnh đầu vào của mô hình

model, loaded_labels = load_saved_model(model_path, label_path)


# Hàm xử lý request
@app.route("/", methods=['GET', 'POST'])
def home_page():
    # Nếu là POST (gửi file)
    if request.method == "POST":
         try:
            # Lấy file gửi lên
            # print("request", request.body)
            print(request.files)
            image = request.files['file']
            
            if image:
                # Lưu file
                print(image.filename)
                print(app.config['UPLOAD_FOLDER'])
                path_to_save = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
                print("Save = ", path_to_save)
                image.save(path_to_save)
                
                
                target_size = (224, 224)
                class_label = classify_image(model, path_to_save, target_size)
                print("test:")
                print(class_label)

                ID = class_label
                extra = display_classification(class_label, loaded_labels)

                # Trả về kết quả
                # return render_template("index.html", user_image = image.filename,
                #                            msg="Tải file lên thành công", ID=ID, extra=extra)
                response_data = {"ID": int(class_label), "extra": extra}
                response = jsonify(response_data)
                response.status_code = 200
                print("Sending response:", response_data)
                # return jsonify({"ID": int(ID), "extra": extra})
                return response

            else:
                # Nếu không có file thì yêu cầu tải file
                # return render_template('index.html', msg='Hãy chọn file để tải lên')
                return jsonify({"message": "Hãy chọn file để tải lên"})

         except Exception as ex:
            # Nếu lỗi thì thông báo
            print(ex)
            # return render_template('index.html', msg='Không phân loại được ảnh')
            return jsonify({"message": "Không phân loại được ảnh"})

    else:
        # Nếu là GET thì hiển thị giao diện upload
        return render_template('index.html')


if __name__ == "__main__":
    # app.run(debug=True, host="0.0.0.0", port=9999)
    app.run(debug=True, host="0.0.0.0", port=9999)
    #python app
