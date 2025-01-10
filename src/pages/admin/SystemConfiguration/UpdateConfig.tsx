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
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import sweetAlert from "../../../utils/sweetAlert";

const UpdateConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any[]>([]);

  const formik = useFormik({
    initialValues: {
      key: "",
      value: "",
    },

    onSubmit: async (values) => {
      let formattedValue = values.value;

      if (
        values.key === SystemConfigKey.START_DATE ||
        values.key === SystemConfigKey.END_DATE
      ) {
        // START_DATE, END_DATE: giữ định dạng DD/MM
        formattedValue = values.value;
      } else if (
        values.key === SystemConfigKey.RestrictedDateManagingCatechism
      ) {
        // RestrictedDateManagingCatechism: chuyển sang DD/MM/YYYY
        const [year, month, day] = values.value.split("-");
        formattedValue = `${day.padStart(2, "0")}/${month.padStart(
          2,
          "0"
        )}/${year}`;
      } else if (values.key === SystemConfigKey.START_TIME) {
        let theEndTime = systemConfig.find(
          (item) => item.key === SystemConfigKey.END_TIME
        );
        if (theEndTime && theEndTime.value <= values.value) {
          sweetAlert.alertWarning(
            "Thời gian kết thúc phải sau thời gian bắt đầu"
          );
          return;
        }
      } else if (values.key === SystemConfigKey.END_TIME) {
        let theStartTime = systemConfig.find(
          (item) => item.key === SystemConfigKey.START_TIME
        );
        if (theStartTime && values.value <= theStartTime.value) {
          sweetAlert.alertWarning(
            "Thời gian kết thúc phải sau thời gian bắt đầu"
          );
          return;
        }
      }

      setIsSubmitting(true);

      try {
        await systemConfigApi.updateConfig(
          id!,
          values.key,
          formattedValue.toString()
        );
        message.success("Cập nhật hệ thống thành công!");
        navigate("/admin/system-configurations");
      } catch (error) {
        console.error("Update failed: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fetchAllSystemConfigs = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> =
        await systemConfigApi.getAllConfig(1, 10);
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        const sortedData = data.data.items.sort(
          (a: any, b: any) =>
            Object.values(SystemConfigKey).indexOf(a.key) -
            Object.values(SystemConfigKey).indexOf(b.key)
        );
        setSystemConfig(sortedData);
      } else {
        console.log("No items found");
      }
    } catch (err) {
      console.error("Không thấy cấu hình hệ thống : ", err);
    }
  };

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

  useEffect(() => {
    fetchAllSystemConfigs();
    fetchSystemConfig();
  }, [id]);

  const generateAvailableDates = (): string[] => {
    const dates: string[] = [];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (let month = 1; month <= 12; month++) {
      const days = daysInMonth[month - 1];
      for (let day = 1; day <= days; day++) {
        const formattedDay = day < 10 ? `0${day}` : day.toString();
        const formattedMonth = month < 10 ? `0${month}` : month.toString();
        dates.push(`${formattedDay}/${formattedMonth}`);
      }
    }

    return dates;
  };

  const availableDates = generateAvailableDates();

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">CẬP NHẬT THÔNG SỐ</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-4">
          <div className="mb-3">
            <label
              htmlFor="key"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Thông số
            </label>
            <input
              id="key"
              name="key"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={getSystemConfigEnumDescription(
                formik.values.key as SystemConfigKey
              )}
              disabled
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="value"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Giá trị
            </label>
            {formik.values.key === SystemConfigKey.START_DATE ||
            formik.values.key === SystemConfigKey.END_DATE ? (
              <select
                id="value"
                name="value"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={formik.handleChange}
                value={formik.values.value}
              >
                {availableDates.map((date: any) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            ) : formik.values.key ===
              SystemConfigKey.RestrictedDateManagingCatechism ? (
              <input
                id="value"
                name="value"
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={formik.handleChange}
                value={
                  formik.values.value.includes("/")
                    ? formik.values.value.split("/").reverse().join("-")
                    : formik.values.value
                }
              />
            ) : formik.values.key === SystemConfigKey.START_TIME ||
              formik.values.key === SystemConfigKey.END_TIME ? (
              <>
                <input
                  id="value"
                  name="value"
                  type="time"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                  onChange={formik.handleChange}
                  value={formik.values.value}
                />

                <div className="mt-3 mb-4 text-primary font-bold">
                  {formik.values.key === SystemConfigKey.START_TIME ? (
                    <p>
                      Thời gian kết thúc năm học:{" "}
                      <input
                        id="value"
                        name="value"
                        type="time"
                        className="text-primary bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        value={
                          systemConfig.find(
                            (item) => item.key === SystemConfigKey.END_TIME
                          )
                            ? systemConfig.find(
                                (item) => item.key === SystemConfigKey.END_TIME
                              ).value
                            : ""
                        }
                        disabled
                      />
                    </p>
                  ) : (
                    <></>
                  )}
                  {formik.values.key === SystemConfigKey.END_TIME ? (
                    <>
                      <p>
                        Thời gian bắt đầu năm học:{" "}
                        <input
                          id="value"
                          name="value"
                          type="time"
                          className="text-primary bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          value={
                            systemConfig.find(
                              (item) => item.key === SystemConfigKey.START_TIME
                            )
                              ? systemConfig.find(
                                  (item) =>
                                    item.key === SystemConfigKey.START_TIME
                                ).value
                              : ""
                          }
                          disabled
                        />
                      </p>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </>
            ) : formik.values.key === SystemConfigKey.WEEKDAY ? (
              <select
                id="value"
                name="value"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={formik.handleChange}
                value={formik.values.value}
              >
                <option value="Monday">Thứ Hai</option>
                <option value="Tuesday">Thứ Ba</option>
                <option value="Wednesday">Thứ Tư</option>
                <option value="Thursday">Thứ Năm</option>
                <option value="Friday">Thứ Sáu</option>
                <option value="Saturday">Thứ Bảy</option>
                <option value="Sunday">Chủ Nhật</option>
              </select>
            ) : formik.values.key ===
              SystemConfigKey.RestrictedUpdateDaysBeforeInterview ? (
              <input
                id="value"
                name="value"
                type="number"
                min="0"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={formik.handleChange}
                value={formik.values.value}
              />
            ) : (
              <input
                id="value"
                name="value"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={formik.handleChange}
                value={formik.values.value}
              />
            )}
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
