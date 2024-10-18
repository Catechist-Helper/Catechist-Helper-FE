import React, { useState } from "react";
import { useFormik, FormikHelpers } from "formik";
import { message } from "antd";
import roomsApi from "../../../api/Room";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { AxiosError } from "axios";
import * as Yup from 'yup';

// Define form values interface
interface RoomFormValues {
  name: string;
  description: string;
  image: File | null;
}

const CreateRoom: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Tên phòng học không được bỏ trống.')
      .max(100, 'Tên không được quá 100 ký tự.'),
    description: Yup.string()
      .required('Mô tả không được bỏ trống.')
      .max(500, 'Mô tả không được quá 500 ký tự.'),
  });

  const formik = useFormik<RoomFormValues>({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values: RoomFormValues, { resetForm }: FormikHelpers<RoomFormValues>) => {
      setIsSubmitting(true);
      try {
        // Prepare FormData to send
        const formData = new FormData();
        formData.append("Name", values.name.trim());
        formData.append("Description", values.description.trim());
      
        // Check if image exists and is a file
        if (values.image && values.image instanceof File) {
          formData.append("Image", values.image);

          // Validate MIME type
          if (!values.image.type.startsWith('image/')) {
            message.error("Vui lòng chọn một tệp hình ảnh hợp lệ.");
            setIsSubmitting(false);
            return;
          }

          // Validate file size (limit to 5MB)
          if (values.image.size > 5 * 1024 * 1024) {
            message.error("Kích thước tệp hình ảnh phải nhỏ hơn 5MB.");
            setIsSubmitting(false);
            return;
          }
        } else {
          message.error("Vui lòng chọn một hình ảnh.");
          setIsSubmitting(false);
          return;
        }

        // Debugging FormData content
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        // Make API request
        const response = await roomsApi.createRoom(formData);
        console.log("Response:", response.data);
        message.success("Phòng học được tạo thành công!");
        resetForm(); // Reset form after success
        navigate(PATH_ADMIN.rooms);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ errors: any }>;
        if (axiosError.response && axiosError.response.data && axiosError.response.data.errors) {
          console.error("Lỗi xác thực: ", axiosError.response.data.errors);
          message.error("Lỗi xác thực, vui lòng kiểm tra lại.");
        } else {
          message.error("Không thể tạo phòng học.");
        }
        console.error("Error: ", axiosError);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handle file change event
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      formik.setFieldValue("image", file);
      console.log("Tệp đã chọn:", file);
    } else {
      formik.setFieldValue("image", null); // Reset if no file is chosen
    }
  };

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">TẠO PHÒNG HỌC</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-sm mx-auto mt-5">
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
              Phòng học
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
              onChange={formik.handleChange}
              value={formik.values.name || ""}
            />
            {formik.errors.name && formik.touched.name ? (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            ) : null}
          </div>
          <div className="mb-5">
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">
              Mô tả
            </label>
            <input
              id="description"
              name="description"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
              onChange={formik.handleChange}
              value={formik.values.description}
            />
            {formik.errors.description && formik.touched.description ? (
              <div className="text-red-500 text-sm">{formik.errors.description}</div>
            ) : null}
          </div>
          <div className="mb-5">
            <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900">
              Ảnh phòng học
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo phòng học"}
            </button>
            <Link
              to={PATH_ADMIN.rooms}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 ml-5"
            >
              Quay lại
            </Link>
          </div>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default CreateRoom;
