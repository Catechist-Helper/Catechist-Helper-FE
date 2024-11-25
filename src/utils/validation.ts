// Kiểm tra số điện thoại Việt Nam hợp lệ (10-11 số)
export const isVietnamesePhoneNumberValid = (phone: string): boolean => {
    const phoneRegex = /^(0|\+84)(3[2-9]|5[2-9]|7[0-9]|8[1-9]|9[0-9])[0-9]{7,8}$/;
    return phoneRegex.test(phone);
  };
  
  // Kiểm tra email hợp lệ
  export const isEmailValid = (email: string): boolean => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Kiểm tra định dạng email cơ bản
    return emailRegex.test(email);
  };
  