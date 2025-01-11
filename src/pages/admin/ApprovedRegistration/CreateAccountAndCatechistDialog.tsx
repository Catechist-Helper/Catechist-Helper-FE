import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  Grid,
} from "@mui/material";
import { Formik, Form } from "formik";
import Select from "react-select";
import catechistApi from "../../../api/Catechist";
import christianNamesApi from "../../../api/ChristianName";
import levelApi from "../../../api/Level";
import sweetAlert from "../../../utils/sweetAlert";
import {
  isVietnamesePhoneNumberValid,
  isEmailValid,
} from "../../../utils/validation";
import { CatechistItemResponse } from "../../../model/Response/Catechist";
import accountApi from "../../../api/Account";
import useAppContext from "../../../hooks/useAppContext";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import registrationApi from "../../../api/Registration";
import interviewProcessApi from "../../../api/InterviewProcess";
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";

interface CreateAccountAndCatechistDialogProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  updateMode?: boolean;
  updatedCatechist?: CatechistItemResponse | null;
  registrationItem?: RegistrationItemResponse;
}

const CreateAccountAndCatechistDialog: React.FC<
  CreateAccountAndCatechistDialogProps
> = ({
  open,
  onClose,
  refresh,
  updateMode,
  updatedCatechist,
  registrationItem,
}) => {
  const [christianNames, setChristianNames] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [initialValues] = useState({
    email: registrationItem?.email || "",
    fullName: registrationItem?.fullName || "",
    gender: registrationItem?.gender || "",
    phone: registrationItem?.phone || "",
    dateOfBirth: registrationItem?.dateOfBirth.split("T")[0] || "",
    birthPlace: updatedCatechist?.birthPlace || "",
    fatherName: updatedCatechist?.fatherName || "",
    fatherPhone: updatedCatechist?.fatherPhone || "",
    motherName: updatedCatechist?.motherName || "",
    motherPhone: updatedCatechist?.motherPhone || "",
    address: updatedCatechist?.address || "",
    qualification: updatedCatechist?.qualification || "",
    christianNameId: updatedCatechist?.christianNameId || "",
    levelId: updatedCatechist?.levelId || "",
    avatar: null,
  });
  const [gender, setGender] = useState<string>(updatedCatechist?.gender ?? "");

  const fetchChristianNames = async () => {
    try {
      const { data } = await christianNamesApi.getAllChristianNames();
      setChristianNames(
        data.data.items
          .filter((item: any) => item.gender == gender)
          .map((item: any) => ({
            value: item.id,
            label: item.name,
          }))
      );
    } catch (error) {
      console.error("Error fetching Christian Names:", error);
    }
  };

  useEffect(() => {
    if (gender != "") {
      fetchChristianNames();
    }
  }, [gender]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const { data } = await levelApi.getAllLevel();
        const sortedArray = data.data.items.sort(
          (a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel
        );
        setLevels(
          sortedArray.map((item: any) => ({
            value: item.id,
            label: `Tên: ${item.name} - Phân cấp: ${item.hierarchyLevel}`,
          }))
        );
      } catch (error) {
        console.error("Error fetching Levels:", error);
      }
    };

    fetchLevels();
    if (registrationItem?.gender) {
      setGender(registrationItem.gender);
    }
  }, []);

  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.email || !isEmailValid(values.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!values.fullName.trim()) {
      errors.fullName = "Tên đầy đủ là bắt buộc";
    }
    if (!values.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc";
    }
    if (!values.qualification.trim()) {
      errors.qualification = "Học vấn là bắt buộc";
    }
    // if (!values.fatherName.trim()) {
    //   errors.fatherName = "Tên cha là bắt buộc";
    // }
    // if (!values.motherName.trim()) {
    //   errors.motherName = "Tên mẹ là bắt buộc";
    // }
    if (!values.gender) {
      errors.gender = "Giới tính là bắt buộc";
      errors.christianNameId = "Vui lòng chọn giới tính trước";
    }
    if (!values.phone || !isVietnamesePhoneNumberValid(values.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
    if (!values.dateOfBirth || new Date(values.dateOfBirth) >= new Date()) {
      errors.dateOfBirth = "Ngày sinh phải là một ngày trước hiện tại";
    }
    if (!values.birthPlace.trim()) {
      errors.birthPlace = "Nơi sinh là bắt buộc";
    }
    if (
      values.fatherPhone &&
      !isVietnamesePhoneNumberValid(values.fatherPhone)
    ) {
      errors.fatherPhone = "Số điện thoại cha không hợp lệ";
    }
    if (
      values.motherPhone &&
      !isVietnamesePhoneNumberValid(values.motherPhone)
    ) {
      errors.motherPhone = "Số điện thoại mẹ không hợp lệ";
    }
    if (values.gender && !values.christianNameId) {
      errors.christianNameId = "Tên Thánh là bắt buộc";
    }
    if (!values.levelId && !updateMode) {
      errors.levelId = "Cấp độ là bắt buộc";
    }
    return errors;
  };

  const { enableLoading, disableLoading } = useAppContext();
  const handleSubmit = async (values: any) => {
    try {
      enableLoading();

      const formData = new FormData();
      formData.append("FullName", values.fullName);
      formData.append("Gender", values.gender);
      formData.append("Phone", values.phone);
      formData.append("DateOfBirth", values.dateOfBirth);
      formData.append("BirthPlace", values.birthPlace);
      formData.append("FatherName", values.fatherName);
      formData.append("FatherPhone", values.fatherPhone);
      formData.append("MotherName", values.motherName);
      formData.append("MotherPhone", values.motherPhone);
      formData.append("Address", values.address);
      formData.append("Qualification", values.qualification);
      formData.append("ChristianNameId", values.christianNameId);
      formData.append("LevelId", values.levelId || "");
      if (values.avatar) {
        formData.append("ImageUrl", values.avatar);
      }

      if (updateMode && updatedCatechist) {
        formData.append("IsTeaching", updatedCatechist.isTeaching.toString());
        formData.append("AccountId", updatedCatechist.account.id);
        await catechistApi.updateCatechist(updatedCatechist.id, formData);
        sweetAlert.alertSuccess(
          "Cập nhật giáo lý viên thành công",
          "",
          2500,
          26
        );
      } else {
        const generateRandomPassword = (): string => {
          const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
          const numberChars = "0123456789";
          const specialChars = "@#$%&*!";
          const allChars =
            upperCaseChars + lowerCaseChars + numberChars + specialChars;

          const passwordLength = 8;
          let password = "";

          // Đảm bảo mỗi loại ký tự xuất hiện ít nhất một lần
          password += upperCaseChars.charAt(
            Math.floor(Math.random() * upperCaseChars.length)
          );
          password += lowerCaseChars.charAt(
            Math.floor(Math.random() * lowerCaseChars.length)
          );
          password += numberChars.charAt(
            Math.floor(Math.random() * numberChars.length)
          );
          password += specialChars.charAt(
            Math.floor(Math.random() * specialChars.length)
          );

          // Điền thêm các ký tự ngẫu nhiên cho đến khi đạt đủ độ dài
          for (let i = password.length; i < passwordLength; i++) {
            if (i % 2 == 0) {
              password += allChars.charAt(
                Math.floor(Math.random() * allChars.length)
              );
            } else {
              password =
                allChars.charAt(Math.floor(Math.random() * allChars.length)) +
                password;
            }
          }

          // Trộn ngẫu nhiên các ký tự trong mật khẩu để không theo thứ tự cố định
          password = password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

          return password;
        };

        const password = generateRandomPassword();

        // Tạo FormData để truyền vào API
        const accountFormData = new FormData();
        accountFormData.append("email", values.email);
        accountFormData.append("password", password);
        accountFormData.append("fullName", values.fullName);
        accountFormData.append("gender", values.gender);
        accountFormData.append("phone", values.phone);
        if (values.avatar) {
          accountFormData.append("avatar", values.avatar);
        }
        accountFormData.append("RoleName", "Catechist");

        // Gọi API
        const accountResponse = await accountApi.createAccount(accountFormData);
        formData.append("AccountId", accountResponse.data.data.id);

        const catechistProfileRes =
          await catechistApi.createCatechist(formData);
        sweetAlert.alertSuccess("Thêm giáo lý viên thành công", "", 2500, 25);

        if (registrationItem) {
          await registrationApi.updateRegistration(registrationItem.id, {
            status: registrationItem.status,
            note:
              registrationItem.note && registrationItem.note != ""
                ? registrationItem.note +
                  ". Đã tạo tài khoản: Mã " +
                  catechistProfileRes.data.data.code
                : "Đã tạo tài khoản: Mã " + catechistProfileRes.data.data.code,
          });

          let processRes = await interviewProcessApi.createInterviewProcess({
            registrationId: registrationItem.id,
            name: RegistrationProcessTitle.TAO_TAI_KHOAN,
          });

          await interviewProcessApi.updateInterviewProcess(
            processRes.data.data.id,
            {
              name: RegistrationProcessTitle.TAO_TAI_KHOAN,
              status: RegistrationProcessStatus.Approved,
            }
          );
        }
      }

      refresh();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra", "", 2000, 25);
    } finally {
      disableLoading();
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{updateMode ? "Cập nhật" : "Thêm"} giáo lý viên</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, setFieldValue, errors, touched }) => (
            <Form>
              {/* Upload Ảnh */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <div className="mt-4">
                    {values.avatar ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={URL.createObjectURL(values.avatar)}
                          style={{
                            borderRadius: "3px",
                            width: "300px",
                            height: "400px",
                          }}
                        />
                        <Button
                          onClick={() => setFieldValue("avatar", null)}
                          color="error"
                          variant="contained"
                          className="mt-2"
                        >
                          Xóa ảnh
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={
                            updatedCatechist?.imageUrl ??
                            "https://via.placeholder.com/150"
                          }
                          style={{
                            borderRadius: "3px",
                            width: "300px",
                            height: "400px",
                          }}
                        />
                        <Button
                          variant="contained"
                          component="label"
                          className="mt-2"
                        >
                          {updateMode ? "Cập nhật ảnh" : "Tải ảnh"}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) =>
                              setFieldValue(
                                "avatar",
                                e.target.files ? e.target.files[0] : null
                              )
                            }
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={
                      <span>
                        Tên đầy đủ <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.fullName && !!errors.fullName}
                    helperText={touched.fullName && errors.fullName}
                    disabled={updateMode}
                  />

                  <FormControl
                    fullWidth
                    margin="normal"
                    error={touched.gender && !!errors.gender}
                    disabled={updateMode}
                  >
                    <InputLabel>
                      Giới tính <span style={{ color: "red" }}>*</span>
                    </InputLabel>
                    <MuiSelect
                      label={
                        <span>
                          Giới tính <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      name="gender"
                      value={values.gender}
                      onChange={(e) => {
                        setFieldValue("gender", e.target.value);
                        setGender(e.target.value);
                        setFieldValue("christianNameId", null);
                      }}
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                    </MuiSelect>
                    {touched.gender && errors.gender && (
                      <p
                        className="text-[0.8rem] ml-3"
                        style={{ color: "red", marginTop: "5px" }}
                      >
                        {errors.gender}
                      </p>
                    )}
                  </FormControl>

                  <TextField
                    label={
                      <span>
                        Ngày sinh <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled={updateMode}
                    name="dateOfBirth"
                    type="date"
                    value={values.dateOfBirth}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    error={touched.dateOfBirth && !!errors.dateOfBirth}
                    helperText={touched.dateOfBirth && errors.dateOfBirth}
                  />

                  <TextField
                    label={
                      <span>
                        Nơi sinh <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled={updateMode}
                    name="birthPlace"
                    value={values.birthPlace}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.birthPlace && !!errors.birthPlace}
                    helperText={touched.birthPlace && errors.birthPlace}
                  />

                  <TextField
                    label={
                      <span>
                        Email <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled={updateMode}
                  />

                  <TextField
                    label={
                      <span>
                        Số điện thoại <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={
                      <span>
                        Địa chỉ <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.address && !!errors.address}
                    helperText={touched.address && errors.address}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={
                      <span>
                        Học vấn <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="qualification"
                    value={values.qualification}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.qualification && !!errors.qualification}
                    helperText={touched.qualification && errors.qualification}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={<span>Tên cha</span>}
                    name="fatherName"
                    value={values.fatherName}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.fatherName && !!errors.fatherName}
                    helperText={touched.fatherName && errors.fatherName}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={<span>Số điện thoại cha </span>}
                    name="fatherPhone"
                    value={values.fatherPhone}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.fatherPhone && !!errors.fatherPhone}
                    helperText={touched.fatherPhone && errors.fatherPhone}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={<span>Tên mẹ</span>}
                    name="motherName"
                    value={values.motherName}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.motherName && !!errors.motherName}
                    helperText={touched.motherName && errors.motherName}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={<span>Số điện thoại mẹ</span>}
                    name="motherPhone"
                    value={values.motherPhone}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    error={touched.motherPhone && !!errors.motherPhone}
                    helperText={touched.motherPhone && errors.motherPhone}
                  />
                </Grid>

                <Grid item xs={!updateMode ? 6 : 12}>
                  <div className="mt-2">
                    <InputLabel className="ml-3">
                      Tên Thánh <span style={{ color: "red" }}>*</span>
                    </InputLabel>
                    <Select
                      options={christianNames}
                      value={
                        christianNames.find(
                          (item: any) => item.value === values.christianNameId
                        ) || null
                      }
                      onChange={(selectedOption: any) =>
                        setFieldValue(
                          "christianNameId",
                          selectedOption ? selectedOption.value : null
                        )
                      }
                      placeholder="Chọn Tên Thánh"
                      isSearchable
                    />
                    {touched.christianNameId && errors.christianNameId && (
                      <p
                        className="text-[0.8rem] ml-3"
                        style={{ color: "red", marginTop: "5px" }}
                      >
                        {errors.christianNameId}
                      </p>
                    )}
                  </div>
                </Grid>

                <Grid item xs={6}>
                  {!updateMode && (
                    <div className="mt-2">
                      <InputLabel className="ml-3">
                        Cấp độ <span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <Select
                        options={levels}
                        value={
                          levels.find(
                            (item: any) => item.value === values.levelId
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "levelId",
                            selectedOption ? selectedOption.value : null
                          )
                        }
                        placeholder="Chọn Cấp độ"
                        isSearchable
                      />
                      {touched.levelId && errors.levelId && (
                        <p
                          className="text-[0.8rem] ml-3"
                          style={{ color: "red", marginTop: "5px" }}
                        >
                          {errors.levelId}
                        </p>
                      )}
                    </div>
                  )}
                </Grid>
              </Grid>

              <DialogActions className="mt-4">
                <Button variant="outlined" onClick={onClose} color="secondary">
                  Hủy
                </Button>
                <Button
                  variant="outlined"
                  type="submit"
                  color="primary"
                  // disabled={
                  //   Object.keys(errors).length > 0 ||
                  //   !Object.keys(touched).length
                  // }
                  onClick={() => {
                    if (Object.keys(errors).length > 0) {
                      sweetAlert.alertFailed(
                        "Có lỗi xảy ra khi nhập liệu",
                        "",
                        5000,
                        23
                      );
                    }
                  }}
                >
                  {updateMode ? "Cập nhật" : "Thêm"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountAndCatechistDialog;
