import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate, Link } from "react-router-dom";
import christianNamesApi from "../../../api/ChristianName";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";

const UpdateChristianName: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      gender: "",
      holyDay: "",
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const formattedHolyDay = values.holyDay
          ? new Date(values.holyDay).toISOString()
          : values.holyDay;

        const response = await christianNamesApi.updateChristianNames(
          id!,
          values.name,
          values.gender,
          formattedHolyDay
        );
        console.log("Update successful: ", response);
        navigate(PATH_ADMIN.christian_name);
      } catch (error) {
        console.error("Update failed: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchChristianName = async () => {
      try {
        if (!id) {
          throw new Error("ID is undefined");
        }

        const response = await christianNamesApi.getById(id);
        const christianName = response.data;

        const formattedHolyDay = christianName.data.holyDay
          ? new Date(christianName.data.holyDay).toISOString().slice(0, 16)
          : "";

        formik.setValues({
          name: christianName.data.name,
          gender: christianName.data.gender,
          holyDay: formattedHolyDay,
        });

        console.log("Updated Formik values:", formik.values);
      } catch (error) {
        console.error("Failed to fetch christianNames data:", error);
      }
    };

    fetchChristianName();
  }, [id]);

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">CẬP NHẬT TÊN THÁNH</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
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
              value={formik.values.name}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">Giới tính</label>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={formik.values.gender === "Nam"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Nam</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={formik.values.gender === "Nữ"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Nữ</label>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label
              htmlFor="holyDay"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Ngày thánh
            </label>
            <input
              id="holyDay"
              name="holyDay"
              type="datetime-local"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={formik.handleChange}
              value={formik.values.holyDay}
            />
          </div>
          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật tên thánh"}
            </button>
            <Link
              to={PATH_ADMIN.christian_name}
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

export default UpdateChristianName;
