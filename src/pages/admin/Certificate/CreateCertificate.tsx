import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { message } from "antd";
import certificatesApi from "../../../api/Certificate";
import levelApi from "../../../api/Level";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { AxiosError } from "axios";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import sweetAlert from "../../../utils/sweetAlert";
import * as Yup from "yup";
import { CertificateResponse } from "../../../model/Response/Certificate"; // Đảm bảo đường dẫn đúng

interface RoomFormValues {
  name: string;
  image: File | null;
  description: string;
  levelId: string;
}

const CreateCertificate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const navigate = useNavigate();
  const [levelMap, setLevelMap] = useState<{ [key: string]: string }>({});
  const [certificateData, setCertificateData] = useState<
    CertificateResponse & { levelName?: string }
  >({
    name: "",
    description: "",
    image: "",
    levelId: "",
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hàm tạo hình ảnh chứng chỉ và lưu vào `image` trong `certificateData`
  const generateCertificateImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const backgroundImage = new Image();
        backgroundImage.src = "/public/image/certificate.png"; // Đảm bảo đường dẫn tới ảnh nền là đúng

        backgroundImage.onload = () => {
          // Xóa nội dung cũ và vẽ ảnh nền
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

          // Thiết lập font và căn chỉnh
          ctx.textAlign = "center";

          // // Vẽ tiêu đề "CERTIFICATE"
          ctx.font = "bold 36px Arial";
          ctx.fillStyle = "#FF8C00"; // Màu cam đậm
          ctx.fillText("CERTIFICATE", canvas.width / 2, 100);
          // Vẽ phụ đề "OF APPRECIATION"
          ctx.font = "italic 24px Arial";
          ctx.fillStyle = "#333";
          ctx.fillText("OF APPRECIATION", canvas.width / 2, 140);

          // Vẽ phụ đề "OF APPRECIATION"
          ctx.font = "italic 24px Arial";
          ctx.fillStyle = "#333";
          ctx.fillText("OF APPRECIATION", canvas.width / 2, 140);

          // Vẽ dòng mô tả chứng nhận
          ctx.font = "16px Arial";
          ctx.fillStyle = "#555";
          ctx.fillText(
            "This certificate is proudly presented for honorable achievement to",
            canvas.width / 2,
            180
          );

          ctx.font = "28px Italic Arial";
          ctx.fillStyle = "#ffcc00";
          ctx.fillText(certificateData.name || "", canvas.width / 2, 350);

          // Description
          ctx.font = "18px Arial";
          ctx.fillStyle = "#333";
          ctx.fillText(
            certificateData.description || "",
            canvas.width / 2,
            400
          );

          // Level Name
          ctx.font = "18px Italic Arial";
          ctx.fillStyle = "#333";
          const levelName = levelMap[certificateData.levelId] || "";
          ctx.fillText(levelName, canvas.width / 2, 450);

          // Thêm phần chữ ký
          ctx.font = "italic 16px Arial";
          ctx.fillStyle = "#333";
          ctx.fillText("Date", canvas.width / 4, 450);
          ctx.fillText("Signature", (canvas.width / 4) * 3, 450);
          ctx.moveTo(canvas.width / 4 - 40, 460);
          ctx.lineTo(canvas.width / 4 + 40, 460);
          ctx.moveTo((canvas.width / 4) * 3 - 40, 460);
          ctx.lineTo((canvas.width / 4) * 3 + 40, 460);
          ctx.strokeStyle = "#333";
          ctx.stroke();

          // Chuyển nội dung của canvas thành URL hình ảnh và lưu vào `certificateData`
          const imageURL = canvas.toDataURL("image/png");
          setCertificateData((prev) => ({
            ...prev,
            image: imageURL,
          }));
        };
      }
    }
  };

  useEffect(() => {
    generateCertificateImage();
  }, [
    certificateData.name,
    certificateData.description,
    certificateData.levelId,
    certificateData.levelName,
  ]);

  useEffect(() => {
    levelApi
      .getAllLevel()
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          setLevels(res.data.items);
          // Tạo đối tượng map cho levelId -> levelName
          const map: { [key: string]: string } = {};
          res.data.items.forEach((level: any) => {
            map[level.id] = level.name;
          });
          setLevelMap(map);
        }
      })
      .catch((err) => {
        console.error("Không thấy danh mục: ", err);
      });
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Tên chứng chỉ không được bỏ trống.")
      .max(100, "Tên không được quá 100 ký tự."),
    description: Yup.string()
      .required("Mô tả không được bỏ trống.")
      .max(500, "Mô tả không được quá 500 ký tự."),
    levelId: Yup.string().required("Vui lòng chọn Level ID."),
  });

  function dataURLtoBlob(dataURL: string) {
    const arr = dataURL.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : ""; // Nếu mimeMatch là null, đặt mime là chuỗi rỗng
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const formik = useFormik<RoomFormValues>({
    initialValues: { name: "", image: null, description: "", levelId: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("Name", values.name.trim());
        formData.append("Description", values.description.trim());
        formData.append("LevelId", values.levelId.trim());
        if (certificateData.image) {
          const imageBlob = dataURLtoBlob(certificateData.image);
          formData.append("Image", imageBlob, "certificate.png");
        } else {
          message.error("Vui lòng tạo hình ảnh chứng chỉ.");
          setIsSubmitting(false);
          return;
        }

        await certificatesApi.createCertificates(formData);
        message.success("Chứng chỉ được tạo thành công!");

        setCertificateData({
          name: values.name,
          description: values.description,
          levelId: values.levelId,
          image: certificateData.image, // URL hình ảnh từ `canvas`
        });

        sweetAlert.alertSuccess(
          "Tạo thành công!",
          "Cấp bậc đã được tạo thành công.",
          2000,
          20
        );

        resetForm();
        navigate(PATH_ADMIN.rooms);
      } catch (error) {
        const axiosError = error as AxiosError<{ errors: any }>;
        if (axiosError.response?.data?.errors) {
          message.error("Lỗi xác thực, vui lòng kiểm tra lại.");
        } else {
          message.error("Không thể tạo chứng chỉ.");
        }
        console.error("Error:", axiosError);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Cập nhật dữ liệu `certificateData` khi người dùng nhập
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    formik.handleChange(e);

    if (name === "levelId") {
      const selectedLevel = levels.find((level: any) => level.id === value);
      setCertificateData((prevData) => {
        const updatedData = {
          ...prevData,
          levelId: value,
          levelName: selectedLevel ? selectedLevel.name : "",
        };
        generateCertificateImage(); // Gọi hàm tạo lại hình ảnh
        return updatedData;
      });
    } else {
      setCertificateData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">TẠO CHỨNG CHỈ</h3>
        <div className="flex justify-center mt-5 space-x-10">
          <form
            onSubmit={formik.handleSubmit}
            className="max-w-lg mx-auto mt-5"
          >
            <div className="mb-5">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Tên chứng chỉ
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                onChange={handleInputChange}
                value={formik.values.name || ""}
              />
              {formik.errors.name && formik.touched.name ? (
                <div className="text-red-500 text-sm">{formik.errors.name}</div>
              ) : null}
            </div>
            <div className="mb-5">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Mô tả
              </label>
              <input
                id="description"
                name="description"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                onChange={handleInputChange}
                value={formik.values.description}
              />
              {formik.errors.description && formik.touched.description ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.description}
                </div>
              ) : null}
            </div>
            <div className="mb-5">
              <label
                htmlFor="levelId"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Cấp độ
              </label>
              <select
                id="levelId"
                name="levelId"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                onChange={handleInputChange}
                value={formik.values.levelId}
              >
                <option value="" disabled>
                  Chọn cấp độ
                </option>
                {levels.map((level: any) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
              {formik.errors.levelId && formik.touched.levelId ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.levelId}
                </div>
              ) : null}
            </div>

            <div className="flex items-start mb-5">
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang tạo..." : "Tạo chứng chỉ"}
              </button>
              <Link
                to={PATH_ADMIN.training_lists}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 ml-5"
              >
                Quay lại
              </Link>
            </div>
          </form>

          {/* Canvas ẩn để tạo ảnh chứng chỉ */}
          <canvas
            ref={canvasRef}
            width="800"
            height="600"
            style={{ display: "none" }}
          ></canvas>

          {/* Hiển thị chứng chỉ từ dữ liệu */}
          {certificateData.image && (
            <div>
              <img src={certificateData.image} alt="Certificate Preview" />
            </div>
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default CreateCertificate;
