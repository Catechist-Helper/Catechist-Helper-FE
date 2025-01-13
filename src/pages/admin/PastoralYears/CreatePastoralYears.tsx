import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { message } from "antd";
import pastoralYearsApi from "../../../api/PastoralYear";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import { pastoralYearStatus } from "../../../enums/PastoralYear";
import { formatDate } from "../../../utils/formatDate";
import sweetAlert from "../../../utils/sweetAlert";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";

const CreatePastoralYears: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [pastoralYears, setPastoralYears] = useState<any[]>([]);

  const fetchPastoralYears = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> =
        await pastoralYearsApi.getAllPastoralYears(1, 1000);
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        setPastoralYears(
          data.data.items.sort((a: any, b: any) => {
            const yearA = parseInt(a.name.split("-")[0]);
            const yearB = parseInt(b.name.split("-")[0]);
            return yearB - yearA;
          })
        );
      } else {
        console.log("No items found");
      }
    } catch (err) {
      console.error("Không thể lấy danh sách niên khóa: ", err);
    }
  };

  useEffect(() => {
    fetchPastoralYears();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const validateYearRange = (yearRange: string): string | null => {
    const currentYear = new Date().getFullYear(); // Lấy năm hiện tại
    const yearRangeRegex = /^\d{4}-\d{4}$/; // Biểu thức regex để kiểm tra định dạng

    // Kiểm tra định dạng
    if (!yearRangeRegex.test(yearRange)) {
      return "Định dạng niên khóa không hợp lệ. Định dạng phải là yyyy-yyyy.";
    }

    // Tách năm đầu và năm sau
    const [startYear, endYear] = yearRange.split("-").map(Number);

    // Kiểm tra năm đầu không phải là quá khứ
    if (startYear < currentYear) {
      return `Năm đầu không được nhỏ hơn năm hiện tại (${currentYear}).`;
    }

    // Kiểm tra năm sau phải lớn hơn năm đầu đúng 1 năm
    if (endYear !== startYear + 1) {
      return `Năm sau phải lớn hơn năm đầu đúng 1 năm.`;
    }

    return null; // Không có lỗi
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      note: "",
      pastoralYearStatus: pastoralYearStatus.START,
    },
    // validate,
    onSubmit: async (values) => {
      const validateYearName = validateYearRange(values.name);
      if (validateYearName != null) {
        sweetAlert.alertWarning(validateYearName, "", 5000, 28);
        return;
      }

      setIsSubmitting(true);
      try {
        const [startYear, endYear] = values.name.split("-");
        const formattedName = formatDate.YYYY_YYYY(startYear, endYear);

        if (
          pastoralYears &&
          pastoralYears.length > 0 &&
          pastoralYears.findIndex(
            (item) => item.name && item.name == formattedName
          ) >= 0
        ) {
          sweetAlert.alertWarning(
            "Đã tồn tại niên khóa " + formattedName,
            "",
            5000,
            26
          );
          setIsSubmitting(false);
          return;
        }

        await pastoralYearsApi.createPastoralYears(
          formattedName,
          values.note,
          values.pastoralYearStatus
        );

        message.success("Tạo niên khóa thành công!");
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
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Niên khóa <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.name}
              placeholder="Nhập niên khóa (yyyy-yyyy)"
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
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.note}
              placeholder="Nhập ghi chú niên khóa"
            />
          </div>

          {/* <div className="mb-5">
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
          </div> */}

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
