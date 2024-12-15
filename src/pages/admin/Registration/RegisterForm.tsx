import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import registrationApi from "../../../api/Registration"; // Import API đã sửa để nhận FormData
import interviewProcessApi from "../../../api/InterviewProcess";
import Swal from "sweetalert2";
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";
import useAppContext from "../../../hooks/useAppContext";
import LoadingScreen from "../../../components/Organisms/LoadingScreen/LoadingScreen";
import sweetAlert from "../../../utils/sweetAlert";

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { isLoading, enableLoading, disableLoading } = useAppContext();

  const [errors, setErrors] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    email: "",
    phone: "",
    isTeachingBefore: "",
    yearOfTeaching: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    email: "",
    phone: "",
    isTeachingBefore: false,
    yearOfTeaching: 0,
    note: "",
    images: [] as File[], // Mảng lưu các file hình ảnh
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Để hiển thị trước ảnh

  const validateStep1 = () => {
    const newErrors = { ...errors };

    if (!formData.fullName) newErrors.fullName = "Chỗ này không được bỏ trống";
    if (!formData.gender) newErrors.gender = "Chỗ này không được bỏ trống";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Chỗ này không được bỏ trống";
    if (!formData.address) newErrors.address = "Chỗ này không được bỏ trống";
    if (!formData.email) newErrors.email = "Chỗ này không được bỏ trống";

    const phoneRegex = /^0\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = "Chỗ này không được bỏ trống";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone =
        "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const validateStep2 = () => {
    const newErrors = { ...errors };
    if (formData.yearOfTeaching < 0)
      newErrors.yearOfTeaching = "Số năm giảng dạy không thể âm";
    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // Thay đổi phần xử lý file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Thay vì ghi đè, thêm ảnh mới vào mảng hiện tại
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...files], // Thêm các file mới vào mảng ảnh
      }));

      // Cập nhật hình ảnh preview
      const imagePreviewsArray = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [
        ...prevPreviews,
        ...imagePreviewsArray,
      ]); // Thêm các ảnh mới vào preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    const confirm = await sweetAlert.confirm(
      "Xác nhận thông tin cá nhân",
      `Kính mong ứng viên <strong>${formData.fullName}</strong> 
      vui lòng xác nhận email <strong>${formData.email}</strong> 
      và số điện thoại <strong>${formData.phone}</strong> là chính xác! 

            <br/><br/>
      Chúng tôi sẽ liên hệ với bạn qua email và số điện thoại này. 
      Xin bạn vui lòng kiểm tra lại lần cuối trước khi nộp hồ sơ.`,
      "Xác nhận nộp",
      "Kiểm tra lại",
      "question"
    );
    if (!confirm) {
      return;
    }
    enableLoading();

    // Tạo đối tượng FormData để gửi qua API
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("fullName", formData.fullName);
    formDataToSubmit.append("gender", formData.gender);
    formDataToSubmit.append("dateOfBirth", formData.dateOfBirth);
    formDataToSubmit.append("address", formData.address);
    formDataToSubmit.append("email", formData.email);
    formDataToSubmit.append("phone", formData.phone);
    formDataToSubmit.append(
      "isTeachingBefore",
      String(formData.isTeachingBefore)
    );
    formDataToSubmit.append("yearOfTeaching", String(formData.yearOfTeaching));
    formData.note && formDataToSubmit.append("note", formData.note);

    // Thêm các file vào FormData (CertificateOfCandidates)
    formData.images.forEach((image) => {
      formDataToSubmit.append(`CertificateOfCandidates`, image); // Đặt đúng tên theo back-end
    });

    try {
      const response =
        await registrationApi.createRegistration(formDataToSubmit);
      console.log("Registration Success", response);
      let process = await interviewProcessApi.createInterviewProcess({
        registrationId: response.data.data.id,
        name: RegistrationProcessTitle.NOP_HO_SO,
      });
      await interviewProcessApi.updateInterviewProcess(process.data.data.id, {
        name: RegistrationProcessTitle.NOP_HO_SO,
        status: RegistrationProcessStatus.Approved,
      });
      // await interviewProcessApi.createInterviewProcess({
      //   registrationId: response.data.data.id,
      //   name: RegistrationProcessTitle.DUYET_DON,
      // });
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: `Nộp đơn đăng ký thành công`,
          html: `Vui lòng theo dõi email mà bạn đã đăng ký: <strong>${formData.email}.</strong><br/>
                Chúng tôi sẽ thông báo các bước tiếp theo qua email của bạn. Xin chân thành cám ơn!`,
          allowOutsideClick: false,
          confirmButtonColor: "green",
          confirmButtonText: "XÁC NHẬN",
        }).then(() => {
          navigate("/");
        });
      }, 200);
    } catch (error) {
      console.error("Error submitting registration", error);
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi nộp đơn",
        "Vui lòng thử lại lần sau",
        5000,
        26
      );
    } finally {
      disableLoading();
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  // Thêm hàm xóa ảnh
  const removeImage = (index: number) => {
    setFormData((prevData) => {
      const newImages = prevData.images.filter((_, i) => i !== index); // Lọc bỏ ảnh tại index
      return { ...prevData, images: newImages };
    });

    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    ); // Cập nhật lại previews
  };

  return (
    <>
      <div className="w-full min-h-screen bg-transparent absolute">
        <div
          className="w-full h-full absolute z-[9999]"
          data-testid="loading-screen"
          style={{
            display: `${isLoading ? "block" : "none"}`,
          }}
        >
          <LoadingScreen transparent={true} />
        </div>
        <div className="w-full px-40 mt-5 mb-5">
          <h2 className="text-center text-2xl font-bold mb-5">
            Đăng kí ứng tuyển làm Giáo Lý Viên
          </h2>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                {/* Họ và tên */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs">{errors.fullName}</p>
                  )}
                </div>

                {/* Giới tính */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={formData.gender === "Nam"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label className="ml-2">Nam</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={formData.gender === "Nữ"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label className="ml-2">Nữ</label>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-xs">{errors.gender}</p>
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs">{errors.address}</p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>

                <div
                  className="w-full flex justify-between"
                  style={{ zIndex: "500" }}
                >
                  <button
                    style={{ zIndex: "500" }}
                    type="button"
                    onClick={() => {
                      navigate(-1);
                    }}
                    className="text-white bg-gray-500 px-4 py-2 rounded-lg"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    style={{ zIndex: "500" }}
                    type="button"
                    onClick={nextStep}
                    className="text-white bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Đã từng làm Giáo lý viên */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Đã từng làm Giáo lý viên{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="isTeachingBefore"
                      value="true"
                      checked={formData.isTeachingBefore === true}
                      onChange={() =>
                        setFormData({ ...formData, isTeachingBefore: true })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <label className="ml-2">Đã từng</label>
                  </div>
                  <div className="flex items-center mt-1">
                    <input
                      type="radio"
                      name="isTeachingBefore"
                      value="false"
                      checked={formData.isTeachingBefore === false}
                      onChange={() =>
                        setFormData({ ...formData, isTeachingBefore: false })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <label className="ml-2">Chưa từng</label>
                  </div>
                  {errors.isTeachingBefore && (
                    <p className="text-red-500 text-xs">
                      {errors.isTeachingBefore}
                    </p>
                  )}
                </div>

                {/* Số năm giảng dạy */}
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-medium">
                    Số năm giảng dạy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="yearOfTeaching"
                    value={formData.yearOfTeaching}
                    onChange={handleChange}
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                  {errors.yearOfTeaching && (
                    <p className="text-red-500 text-xs">
                      {errors.yearOfTeaching}
                    </p>
                  )}
                </div>

                {/* Chứng chỉ giáo lý */}
                <div className="mb-3">
                  <label
                    className="block mb-1 text-sm font-medium"
                    htmlFor="images"
                  >
                    Chứng chỉ giáo lý:
                  </label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    Tải lên chứng chỉ giáo lý nếu có
                  </div>

                  {/* Hiển thị hình ảnh đã chọn */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium">
                        Xem trước ảnh đã chọn:
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-auto rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)} // Gọi hàm xóa ảnh
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              &times; {/* Biểu tượng xóa */}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ghi chú */}
                {/* <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                Ghi chú thêm{" "}
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
              />
            </div> */}

                <div
                  className="w-full flex justify-between"
                  style={{ zIndex: "500" }}
                >
                  <button
                    style={{ zIndex: "500" }}
                    type="button"
                    onClick={prevStep}
                    className="text-white bg-gray-500 px-4 py-2 rounded-lg"
                  >
                    Quay lại bước trước
                  </button>
                  <button
                    style={{ zIndex: "500" }}
                    type="submit"
                    className="text-white bg-green-500 px-4 py-2 rounded-lg"
                  >
                    Nộp đơn ứng tuyển
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
