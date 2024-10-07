import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="container mt-5">
      <h3 className="text-center">Đăng kí ứng tuyển Huynh Trưởng - Giáo Lý Viên</h3>
      {step === 1 && (
        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="lastName">Họ và tên đệm*</label>
              <input type="text" className="form-control" id="lastName" required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="firstName">Tên*</label>
              <input type="text" className="form-control" id="firstName" required />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="dob">Ngày sinh*</label>
              <input type="date" className="form-control" id="dob" required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone">Số điện thoại*</label>
              <input type="text" className="form-control" id="phone" required />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="email">Email*</label>
            <input type="email" className="form-control" id="email" required />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Giới tính*</label>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="gender" id="male" value="male" required />
                <label className="form-check-label" htmlFor="male">Nam</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="gender" id="female" value="female" required />
                <label className="form-check-label" htmlFor="female">Nữ</label>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="city">Tỉnh/Thành phố đang ở*</label>
              <input type="text" className="form-control" id="city" required />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="address">Địa chỉ cụ thể*</label>
            <input type="text" className="form-control" id="address" required />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleNextStep}>Tiếp theo</button>
        </form>
      )}

      {step === 2 && (
        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="maritalStatus">Tình trạng hôn nhân*</label>
              <select className="form-control" id="maritalStatus" required>
                <option value="">Chọn tình trạng</option>
                <option value="single">Độc thân</option>
                <option value="married">Đã kết hôn</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="teachingLevel">Trình độ giảng dạy*</label>
              <input type="text" className="form-control" id="teachingLevel" required />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Đã từng làm Giáo lý viên*</label>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="hasExperience" id="yes" value="yes" required />
                <label className="form-check-label" htmlFor="yes">Đã từng</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="hasExperience" id="no" value="no" required />
                <label className="form-check-label" htmlFor="no">Chưa từng</label>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="teachingYears">Số năm giảng dạy (nếu có)</label>
              <input type="text" className="form-control" id="teachingYears" />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="experience">Mô tả kinh nghiệm (nếu có)</label>
            <input type="text" className="form-control" id="experience" />
          </div>

          <div className="mb-3">
            <label htmlFor="notes">Ghi chú thêm (nếu có)</label>
            <input type="text" className="form-control" id="notes" />
          </div>

          <div className="mb-3 form-check">
            <input type="checkbox" className="form-check-input" id="confirmation" required />
            <label className="form-check-label" htmlFor="confirmation">
              Xác nhận đăng ký ứng tuyển vào vị trí Huynh Trưởng - Giáo Lý Viên. Và cam kết tuân thủ mọi quy định và thực hiện đầy đủ trách nhiệm của mình trong vai trò này.
            </label>
          </div>

          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-dark" onClick={handlePreviousStep}>Quay lại bước trước</button>
            <button type="submit" className="btn btn-primary">Nộp đơn ứng tuyển</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;
