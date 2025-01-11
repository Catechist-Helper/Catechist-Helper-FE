import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import trainApi from "../../../api/TrainingList";
import levelApi from "../../../api/Level";
import "bootstrap/dist/css/bootstrap.min.css";
// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import sweetAlert from "../../../utils/sweetAlert";
// import { trainingListStatus } from "../../../enums/TrainingList";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
const CreateTrain: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levels, setLevels] = useState<any[]>([]);
  const [levelMap, setLevelMap] = useState<{ [key: string]: string }>({});
  const [certificates, setCertificates] = useState<any[]>([]);
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };

  const fetchCertificatesByNextLevel = async (nextLevelId: string) => {
    try {
      const res = await levelApi.certificatesByLevelId(nextLevelId);
      setCertificates(res.data.data.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chứng chỉ:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      certificateId: "",
      previousLevelId: "",
      nextLevelId: "",
      startTime: "",
      endTime: "",
    },
    validate: (values) => {
      const errors: any = {};
      const now = new Date();
      const startDate = new Date(values.startTime);
      const endDate = new Date(values.endTime);

      // Kiểm tra ngày bắt đầu
      if (!values.startTime) {
        errors.startTime = "Vui lòng nhập thời gian bắt đầu.";
      } else if (startDate <= now) {
        errors.startTime = "Thời gian bắt đầu phải lớn hơn ngày hiện tại.";
      }

      // Kiểm tra ngày kết thúc
      if (!values.endTime) {
        errors.endTime = "Vui lòng nhập thời gian kết thúc.";
      } else {
        // Kiểm tra xem có cùng ngày không
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        if (isSameDay || endDate <= startDate) {
          errors.endTime =
            "Ngày kết thúc phải lớn hơn ngày bắt đầu và không được trùng ngày.";
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      if (Object.keys(formik.errors).length > 0) {
        sweetAlert.alertFailed(
          "Thất bại!",
          "Biểu mẫu chứa lỗi. Vui lòng sửa lỗi trước khi tiếp tục.",
          3000,
          true
        );
        return; // Ngăn submit nếu còn lỗi
      }

      setIsSubmitting(true);
      try {
        await trainApi.createTrain(
          values.name,
          values.description,
          values.certificateId,
          values.previousLevelId,
          values.nextLevelId,
          values.startTime,
          values.endTime
        );

        sweetAlert.alertSuccess(
          "Tạo thành công!",
          "Danh sách đào tạo đã được tạo thành công.",
          2000,
          28
        );

        navigate(PATH_ADMIN.training_lists); // Chỉ chuyển hướng khi thành công
      } catch (error) {
        sweetAlert.alertFailed(
          "Thất bại!",
          "Không thể tạo danh sách đào tạo. Vui lòng thử lại.",
          3000,
          30
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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
          const map: { [key: string]: string } = {};
          res.data.items.forEach((level: any) => {
            map[level.id] = level.name;
          });
          setLevelMap(map);
        }
      })
      .catch((err) => {
        console.error("Không thấy danh sách: ", err);
      });
  }, []);

  const handlePreviousLevelChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const previousLevelId = e.target.value;
    const selectedLevel = levels.find((level) => level.id === previousLevelId);

    if (selectedLevel) {
      const currentHierarchyLevel = selectedLevel.hierarchyLevel;
      const nextLevel = levels.find(
        (level) => level.hierarchyLevel === currentHierarchyLevel + 1
      );

      // Update formik values
      formik.setFieldValue("previousLevelId", previousLevelId);
      formik.setFieldValue("nextLevelId", nextLevel ? nextLevel.id : "");
      if (nextLevel) {
        fetchCertificatesByNextLevel(nextLevel.id); // Fetch certificates by next level
      } else {
        setCertificates([]);
      }
    } else {
      formik.setFieldValue("previousLevelId", "");
      formik.setFieldValue("nextLevelId", "");
      setCertificates([]);
    }
  };

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">TẠO DANH SÁCH ĐÀO TẠO</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Mô tả
            </label>
            <input
              id="description"
              name="description"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.description}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="previousLevelId"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Bậc cấp trước
            </label>
            <select
              id="previousLevelId"
              name="previousLevelId"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={handlePreviousLevelChange}
              value={formik.values.previousLevelId}
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
          </div>
          <div className="mb-5">
            <label
              htmlFor="nextLevelId"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Bậc cấp tiếp theo
            </label>
            <input
              id="nextLevelId"
              name="nextLevelId"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              value={
                formik.values.previousLevelId
                  ? levels.find(
                      (level: any) =>
                        level.hierarchyLevel ===
                        levels.find(
                          (prev: any) =>
                            prev.id === formik.values.previousLevelId
                        )?.hierarchyLevel +
                          1
                    )?.name || "Không có cấp tiếp theo"
                  : "Vui lòng chọn cấp trước"
              }
              readOnly
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="certificateId"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Chứng chỉ
            </label>
            <select
              id="certificateId"
              name="certificateId"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.certificateId}
            >
              <option value="">Chọn chứng chỉ</option>
              {certificates.map((certificate: any) => (
                <option key={certificate.id} value={certificate.id}>
                  {certificate.name} - {levelMap[certificate.levelId]}{" "}
                  {/* Hiển thị tên cấp */}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-5">
            <h2 className="text-xl text-gray-900  font-bold mb-2">
              Thời gian bắt đầu
            </h2>
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
              <div className="flex items-center w-full">
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  className={`text-gray-900  text-base font-medium block w-full border ${
                    formik.errors.startTime
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5  `}
                  onChange={formik.handleChange}
                  value={formik.values.startTime}
                />
              </div>
            </div>
            {formik.errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.startTime}
              </p>
            )}
          </div>

          <div className="mb-5">
            <h2 className="text-xl text-gray-900  font-bold mb-2">
              Thời gian kết thúc
            </h2>
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
              <div className="flex items-center w-full">
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  className={`text-gray-900  text-base font-medium block w-full border ${
                    formik.errors.endTime ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5  `}
                  onChange={formik.handleChange}
                  value={formik.values.endTime}
                />
              </div>
            </div>
            {formik.errors.endTime && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.endTime}
              </p>
            )}
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              disabled={Object.keys(formik.errors).length > 0 || isSubmitting}
              className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
                Object.keys(formik.errors).length > 0 || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo danh sách đào tạo"}
            </button>
            <button
              type="button"
              className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-5"
              onClick={handleGoBack}
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default CreateTrain;
