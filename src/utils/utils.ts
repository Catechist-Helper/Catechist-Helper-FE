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

export const getUserInfo = () => {
  return getLocalStorage("USER_INFO");
};

export const getUserInfoId = () => {
  var userInfoString : any = getUserInfo();
  var userInfo = JSON.parse(userInfoString);
  return userInfo && userInfo.id ? userInfo.id : null;
};
