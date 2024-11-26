import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate, Link } from "react-router-dom";
import systemConfigApi from "../../../api/SystemConfiguration";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { message } from "antd";
import {
  getSystemConfigEnumDescription,
  SystemConfigKey,
} from "../../../enums/SystemConfig";
const UpdateConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      key: "",
      value: "",
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await systemConfigApi.updateConfig(
          id!,
          values.key,
          values.value
        );
        window.location.reload();
        message.success("Cập nhật hệ thống thành công!");
        console.log("Update successful: ", response);
        navigate("/admin/system-configurations");
      } catch (error) {
        console.error("Update failed: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        if (!id) {
          throw new Error("ID is undefined");
        }

        const response = await systemConfigApi.getById(id);
        const systemConfig = response.data;

        formik.setValues({
          key: systemConfig.data.key,
          value: systemConfig.data.value,
        });

        console.log("Updated Formik values:", formik.values);
      } catch (error) {
        console.error("Failed to fetch systemConfig data:", error);
      }
    };

    fetchSystemConfig();
  }, [id]);

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">CẬP NHẬT THÔNG SỐ</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-sm mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="key"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Thông số
            </label>
            <input
              id="key"
              name="key"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={formik.handleChange}
              value={getSystemConfigEnumDescription(
                formik.values.key as SystemConfigKey
              )}
              disabled
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="value"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Giá trị
            </label>
            <input
              id="value"
              name="value"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={formik.handleChange}
              value={formik.values.value}
            />
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật hệ thống"}
            </button>
            <Link
              to={PATH_ADMIN.system_configurations}
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

export default UpdateConfig;
