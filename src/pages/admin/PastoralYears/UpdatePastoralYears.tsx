import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { message } from "antd";
import pastoralYearsApi from "../../../api/PastoralYear";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { pastoralYearStatus } from "../../../enums/PastoralYear";
import { formatDate } from "../../../utils/formatDate";

const UpdatePastoralYear: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      note: "",
      pastoralYearStatus: pastoralYearStatus.START,
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const [startYear, endYear] = values.name.split("-");
        const formattedName = formatDate.YYYY_YYYY(startYear, endYear);
        await pastoralYearsApi.updatePastoralYears(
          id!,
          formattedName,
          values.note,
          values.pastoralYearStatus
        );

        message.success("Cập nhật niên khóa thành công!");
        navigate(PATH_ADMIN.pastoral_years);
      } catch (error) {
        console.error("Update failed: ", error);
        message.error("Cập nhật niên khóa không thành công");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const loadPastoralYear = async () => {
      try {
        const response = await pastoralYearsApi.getById(id!);
        const pastoralYear = response.data;

        formik.setValues({
          name: pastoralYear.data.name,
          note: pastoralYear.data.note,
          pastoralYearStatus: pastoralYear.data.pastoralYearStatus,
        });
      } catch (error) {
        console.error("Failed to fetch pastoralYear data:", error);
        message.error("Không thể tải thông tin niên khóa");
      }
    };

    loadPastoralYear();
  }, [id]);

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">CẬP NHẬT NIÊN KHÓA</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Niên khóa
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="note"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Ghi chú
            </label>
            <input
              id="note"
              name="note"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Bắt đầu</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="pastoralYearStatus"
                  value={pastoralYearStatus.FINISH}
                  checked={
                    formik.values.pastoralYearStatus ===
                    pastoralYearStatus.FINISH
                  }
                  onChange={() =>
                    formik.setFieldValue(
                      "pastoralYearStatus",
                      pastoralYearStatus.FINISH
                    )
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Kết thúc</label>
              </div>
            </div>
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật niên khóa"}
            </button>
            <Link
              to={PATH_ADMIN.pastoral_years}
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

export default UpdatePastoralYear;
