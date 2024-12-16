import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate, Link } from "react-router-dom";
import trainApi from "../../../api/TrainingList";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import sweetAlert from "../../../utils/sweetAlert";
import levelApi from "../../../api/Level";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { trainingListStatus } from "../../../enums/TrainingList";
import { useLocation } from "react-router-dom";
import { message } from "antd";
const UpdateTrain: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [levels, setLevels] = useState<any[]>([]);
  const [levelMap, setLevelMap] = useState<{ [key: string]: string }>({});
  console.log(id);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const location = useLocation();
  const editStatusOnly = location.state?.editStatusOnly;

  const fetchCertificatesByNextLevel = async (nextLevelId: string) => {
    try {
      const res = await levelApi.certificatesByLevelId(nextLevelId);
      setCertificates(res.data.data.items || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
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
      trainingListStatus: trainingListStatus.Training,
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await trainApi.updateTrain(
          id!,
          values.name,
          values.description,
          values.certificateId,
          values.previousLevelId,
          values.nextLevelId,
          values.startTime,
          values.endTime,
          values.trainingListStatus
        );
        console.log("Update successful: ", response);

        sweetAlert.alertSuccess(
          "Cập nhật thành công!",
          "Cập nhật danh sách thành công.",
          3000,
          23
        );

        navigate("/admin/training-lists");
      } catch (error) {
        console.error("Update failed: ", error);

        sweetAlert.alertFailed(
          "Cập nhật thất bại!",
          "Đã xảy ra lỗi khi cập nhật danh sách.",
          3000,
          23
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  // const isInputDisabled = editStatusOnly;

  // // Disable radio "Đào tạo" khi đã chuyển sang "Kết thúc"
  // const isTrainingRadioDisabled =
  //   formik.values.trainingListStatus === trainingListStatus.Finished;

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        if (!id) {
          throw new Error("ID is undefined");
        }

        const response = await trainApi.getById(id);
        const train = response.data.data;

        formik.setValues({
          name: train.name,
          description: train.description,
          certificateId: train.certificate?.id || "", // Lấy certificate ID
          previousLevelId: train.previousLevel?.id || "", // Lấy previous level ID
          nextLevelId: train.nextLevel?.id || "", // Lấy next level ID
          startTime: train.startTime,
          endTime: train.endTime,
          trainingListStatus: train.trainingListStatus,
        });
        if (train.nextLevel?.id) {
          fetchCertificatesByNextLevel(train.nextLevel.id);
        }
        console.log("Updated Formik values:", formik.values);
      } catch (error) {
        console.error("Failed to fetch pastoralYear data:", error);
        message.error("Không thể tải thông tin đào tạo");
      }
    };

    fetchTrain();
  }, [id]);

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
        console.error("Không thấy cấp độ: ", err);
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

      formik.setFieldValue("previousLevelId", previousLevelId);
      formik.setFieldValue("nextLevelId", nextLevel ? nextLevel.id : "");

      if (nextLevel) {
        fetchCertificatesByNextLevel(nextLevel.id);
      } else {
        setCertificates([]);
      }
    } else {
      formik.setFieldValue("previousLevelId", "");
      formik.setFieldValue("nextLevelId", "");
      setCertificates([]);
    }
  };

  const isBeforeStartDate = () => {
    const now = new Date();
    const startDate = new Date(formik.values.startTime);
    return now < startDate;
  };

  const isAfterEndDate = () => {
    const now = new Date();
    const endDate = new Date(formik.values.endTime);
    return now > endDate;
  };

  // 1. Cho các trường thông tin cơ bản (name, description, startTime, endTime)
  const isBasicFieldsDisabled =
    editStatusOnly ||
    formik.values.trainingListStatus === trainingListStatus.Training ||
    formik.values.trainingListStatus === trainingListStatus.Finished;

  // 2. Cho các trường đặc biệt (certificate, previous level, next level)
  const isSpecialFieldsDisabled =
    editStatusOnly ||
    formik.values.trainingListStatus === trainingListStatus.NotStarted ||
    formik.values.trainingListStatus === trainingListStatus.Training ||
    formik.values.trainingListStatus === trainingListStatus.Finished;

  // 3. Cho radio buttons
  const trainingRadioDisabled =
    isBeforeStartDate() ||
    formik.values.trainingListStatus === trainingListStatus.Finished;

  const finishedRadioDisabled = isBeforeStartDate() || !isAfterEndDate();

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">
          CHỈNH SỬA DANH SÁCH ĐÀO TẠO
        </h3>
        <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              disabled={isBasicFieldsDisabled}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Mô tả
            </label>
            <input
              id="description"
              name="description"
              type="text"
              disabled={isBasicFieldsDisabled}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={formik.handleChange}
              value={formik.values.description}
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="certificateId"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Chứng chỉ
            </label>
            <select
              id="certificateId"
              name="certificateId"
              disabled={isSpecialFieldsDisabled}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            <label
              htmlFor="previousLevelId"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Bậc cấp trước
            </label>
            <select
              id="previousLevelId"
              name="previousLevelId"
              disabled={isSpecialFieldsDisabled}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Bậc cấp tiếp theo
            </label>
            <input
              id="nextLevelId"
              name="nextLevelId"
              disabled={isSpecialFieldsDisabled}
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            <h2 className="text-xl text-gray-900 dark:text-white font-bold mb-2">
              Thời gian bắt đầu
            </h2>
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  disabled={isBasicFieldsDisabled}
                  className="text-gray-900 dark:text-white text-base font-medium block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={formik.handleChange}
                  value={formik.values.startTime}
                />
              </div>
            </div>
          </div>
          <div className="mb-5">
            <h2 className="text-xl text-gray-900 dark:text-white font-bold mb-2">
              Thời gian kết thúc
            </h2>
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  disabled={isBasicFieldsDisabled}
                  className="text-gray-900 dark:text-white text-base font-medium block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={formik.handleChange}
                  value={formik.values.endTime}
                />
              </div>
            </div>
          </div>
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">Trạng thái</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="trainingListStatus"
                  value={trainingListStatus.Training}
                  checked={
                    formik.values.trainingListStatus ===
                    trainingListStatus.Training
                  }
                  onChange={() =>
                    formik.setFieldValue(
                      "trainingListStatus",
                      trainingListStatus.Training
                    )
                  }
                  disabled={trainingRadioDisabled}
                  className={`w-4 h-4 text-blue-600 ${
                    trainingRadioDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <label
                  className={`ml-2 ${
                    trainingRadioDisabled ? "text-gray-400" : ""
                  }`}
                >
                  Đào tạo
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="trainingListStatus"
                  value={trainingListStatus.Finished}
                  checked={
                    formik.values.trainingListStatus ===
                    trainingListStatus.Finished
                  }
                  onChange={() =>
                    formik.setFieldValue(
                      "trainingListStatus",
                      trainingListStatus.Finished
                    )
                  }
                  disabled={finishedRadioDisabled}
                  className={`w-4 h-4 text-blue-600 ${
                    finishedRadioDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <label
                  className={`ml-2 ${
                    finishedRadioDisabled ? "text-gray-400" : ""
                  }`}
                >
                  Kết thúc
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật danh sách đào tạo"}
            </button>
            <Link
              to={PATH_ADMIN.training_lists}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-5"
            >
              Quay lại
            </Link>
          </div>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default UpdateTrain;
