import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate, Link } from "react-router-dom";
import roomsApi from "../../../api/Room";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { message } from "antd";
import * as Yup from "yup";

interface RoomFormValues {
  name: string;
  description: string;
  image: File | null;
}

const UpdateRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Để lưu URL ảnh cũ và hiển thị xem trước

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Tên phòng học không được bỏ trống.")
      .max(100, "Tên không được quá 100 ký tự."),
    description: Yup.string()
      .required("Mô tả không được bỏ trống.")
      .max(500, "Mô tả không được quá 500 ký tự."),
  });

  const formik = useFormik<RoomFormValues>({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("Name", values.name.trim());
        formData.append("Description", values.description.trim());

        if (values.image && values.image instanceof File) {
          formData.append("Image", values.image);
        } else if (imagePreview) {
          formData.append("ImageUrl", imagePreview);
        }

        await roomsApi.updateRoom(id!, formData);
        message.success("Cập nhật phòng học thành công!");
        navigate(PATH_ADMIN.rooms);
      } catch (error) {
        message.error("Không thể cập nhật phòng học.");
        console.error("Error: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomsApi.getById(id!);
        const room = response.data;

        formik.setValues({
          name: room.data.name || "",
          description: room.data.description || "",
          image: null,
        });
        setImagePreview(room.data.image || null);
      } catch (error) {
        message.error("Không thể tải thông tin phòng học.");
        console.error("Failed to fetch room data:", error);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      formik.setFieldValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      formik.setFieldValue("image", null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    formik.setFieldValue("image", null);
    setImagePreview(null);
  };

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">CẬP NHẬT PHÒNG HỌC</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Phòng học
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
              onChange={formik.handleChange}
              value={formik.values.name}
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
              onChange={formik.handleChange}
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
              htmlFor="image"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Ảnh phòng học
            </label>
            <div className="flex items-center">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                onChange={handleFileChange}
              />
            </div>

            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} className="w-full h-auto rounded" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2 text-red-500 hover:underline"
                >
                  Xóa ảnh
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật phòng học"}
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

export default UpdateRoom;
