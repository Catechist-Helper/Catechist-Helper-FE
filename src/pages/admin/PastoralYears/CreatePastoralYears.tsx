import React, { useState } from "react";
import { useFormik } from "formik";
import { message } from "antd";
import pastoralYearsApi from "../../../api/PastoralYear";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { pastoralYearStatus } from "../../../enums/PastoralYear";
import { formatDate } from "../../../utils/formatDate";

const CreatePastoralYears: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      note: "",
      pastoralYearStatus: pastoralYearStatus.START,
    },
    // validate,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const [startYear, endYear] = values.name.split("-");
        const formattedName = formatDate.YYYY_YYYY(startYear, endYear);

        const response = await pastoralYearsApi.createPastoralYears(
          formattedName,
          values.note,
          values.pastoralYearStatus
        );

        message.success("Tạo niên khóa thành công!");
        console.log("Response: ", response);
        navigate(PATH_ADMIN.pastoral_years);
      } catch (error) {
        message.error("Tạo niên khóa không thành công");
        console.error("Error: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">TẠO NIÊN KHÓA</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Niên khóa
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="note"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Ghi chú
            </label>
            <input
              id="note"
              name="note"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={formik.handleChange}
              value={formik.values.note}
            />
          </div>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">Trạng thái</label>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  type="radio"
                  name="pastoralYearStatus"
                  value={pastoralYearStatus.START}
                  checked={
                    formik.values.pastoralYearStatus ===
                    pastoralYearStatus.START
                  }
                  onChange={() =>
                    formik.setFieldValue(
                      "pastoralYearStatus",
                      pastoralYearStatus.START
                    )
                  } // Cập nhật giá trị trạng thái
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Bắt đầu</label>
              </div>
            </div>
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo" : "Tạo năm mục vụ"}
            </button>
            <button
              type="button"
              onClick={handleGoBack}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-5"
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default CreatePastoralYears;
