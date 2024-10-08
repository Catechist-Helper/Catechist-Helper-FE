import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import registrationApi from "../../../api/Registration";

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const navigate = useNavigate(); 

  const [errors, setErrors] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    email: '',
    phone: '',
    isTeachingBefore: '',
    yearOfTeaching: ''
  });

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    email: '',
    phone: '',
    isTeachingBefore: false,
    yearOfTeaching: 0,
    note: '',
    images: null as string[] | null,
  });

 
  const validateStep1 = () => {
    const newErrors = { ...errors };
    
    if (!formData.fullName) newErrors.fullName = 'Chỗ này không được bỏ trống';
    if (!formData.gender) newErrors.gender = 'Chỗ này không được bỏ trống';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Chỗ này không được bỏ trống';
    if (!formData.address) newErrors.address = 'Chỗ này không được bỏ trống';
    if (!formData.email) newErrors.email = 'Chỗ này không được bỏ trống';
 
    const phoneRegex = /^0\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Chỗ này không được bỏ trống';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số';
    }
  
    setErrors(newErrors);
  
    return Object.values(newErrors).every(error => error === '');
  };
  

 
  const validateStep2 = () => {
    const newErrors = { ...errors };
    if (formData.yearOfTeaching < 0) newErrors.yearOfTeaching = 'Số năm giảng dạy không thể âm';
    setErrors(newErrors);
    
    return Object.values(newErrors).every(error => error === '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    try {
      const response = await registrationApi.createRegistration(formData);
      console.log('Registration Success', response);
      setSuccessMessage('Nộp đơn thành công!'); 
      setTimeout(() => {
        navigate('/'); 
      }, 2000);
    } catch (error) {
      console.error('Error submitting registration', error);
      setErrorMessage('Đã xảy ra lỗi khi nộp đơn.');
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-center text-2xl font-bold mb-5">Đăng kí ứng tuyển Huynh Trưởng - Giáo Lý Viên</h2>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
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
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
            </div>
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
              {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Ngày sinh <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Địa chỉ <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Số điện thoại <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>

            <button type="button" onClick={nextStep} className="text-white bg-blue-500 px-4 py-2 rounded-lg">
              Tiếp theo
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                Đã từng làm Giáo lý viên <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="isTeachingBefore"
                  value="true"
                  checked={formData.isTeachingBefore === true}
                  onChange={() => setFormData({ ...formData, isTeachingBefore: true })}
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
                  onChange={() => setFormData({ ...formData, isTeachingBefore: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Chưa từng</label>
              </div>
              {errors.isTeachingBefore && <p className="text-red-500 text-xs">{errors.isTeachingBefore}</p>}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Số năm giảng dạy <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="yearOfTeaching"
                value={formData.yearOfTeaching}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
                min="0"
              />
              {errors.yearOfTeaching && <p className="text-red-500 text-xs">{errors.yearOfTeaching}</p>}
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium" htmlFor="images">
                Chứng chỉ giáo lý:
              </label>
              <input
                type="file"
                name="images"
                multiple
                onChange={handleChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
              <div className="mt-1 text-sm text-gray-500" id="user_avatar_help">
                A profile picture is useful to confirm you are logged into your account
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Ghi chú thêm </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button type="button" onClick={prevStep} className="text-white bg-gray-500 px-4 py-2 rounded-lg">
              Quay lại bước trước
            </button>
            <button type="submit" className="text-white bg-green-500 px-4 py-2 rounded-lg">
              Nộp đơn ứng tuyển
            </button>
          </>
        )}
      </form>

      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
    </div>
  );
};

export default RegisterForm;
