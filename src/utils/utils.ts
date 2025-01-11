import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";

export const setLocalStorage = (name: string, value: string) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(name, value);
    } else {
      console.error("localStorage is not available.");
    }
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
};

export const getLocalStorage = (name: string) => {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(name);
    } else {
      console.error("localStorage is not available.");
      return null;
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

export const setUserInfo = (userInfo: any) => {
  setLocalStorage(
    "USER_INFO",
    JSON.stringify(userInfo)
  );
};

// export const getUserInfo = () => {
//   return getLocalStorage("USER_INFO");
// };
// export const getUserInfo = () => 
//   JSON.parse(getLocalStorage("USER_INFO") || '{}');
export const getUserInfo = () => {
  const user = getLocalStorage("USER_INFO");
  return user ? JSON.parse(user) : {};
};


export const getUserInfoId = () => {
  var userInfoString : any = getUserInfo();
  var userInfo = JSON.parse(userInfoString);
  return userInfo && userInfo.id ? userInfo.id : null;
};

export const formatPhone = (phone: string): string => {
  const cleanedPhone = phone.replace(/\D/g, '');
  if (cleanedPhone.length === 10) {
    return cleanedPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleanedPhone.length === 11) {
    return cleanedPhone.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3');
  } else {
    return phone;
  }
};

export const storeCurrentPath = (path: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
      path
    );
  }
}

