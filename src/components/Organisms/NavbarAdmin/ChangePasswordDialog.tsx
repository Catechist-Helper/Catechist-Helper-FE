import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Validation Schema
const validationSchema = Yup.object({
  currentPassword: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái in hoa")
    .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất một chữ số")
    .matches(/[@$!%*?&]/, "Mật khẩu phải chứa ít nhất một ký tự đặc biệt")
    .required("Mật khẩu hiện tại không được để trống"),
  newPassword: Yup.string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .matches(/[A-Z]/, "Mật khẩu mới phải chứa ít nhất một chữ cái in hoa")
    .matches(/[0-9]/, "Mật khẩu mới phải chứa ít nhất một chữ số")
    .matches(/[@$!%*?&]/, "Mật khẩu mới phải chứa ít nhất một ký tự đặc biệt")
    .required("Mật khẩu mới không được để trống"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), undefined], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu không được để trống"),
});

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { currentPassword: string; newPassword: string }) => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowCurrentPassword = () =>
    setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Đổi mật khẩu</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          validateOnChange={true} // Hiển thị lỗi khi nhập
          validateOnBlur={true} // Hiển thị lỗi khi rời khỏi trường
          onSubmit={onSubmit}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form>
              {/* Mật khẩu hiện tại */}
              <FormControl fullWidth margin="normal">
                <TextField
                  label={
                    <span>
                      Mật khẩu hiện tại <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={values.currentPassword}
                  onChange={(e) => {
                    setFieldValue("currentPassword", e.target.value); // Cập nhật giá trị
                  }}
                  error={touched.currentPassword && !!errors.currentPassword}
                  helperText={touched.currentPassword && errors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowCurrentPassword}
                          edge="end"
                        >
                          {showCurrentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              {/* Mật khẩu mới */}
              <FormControl fullWidth margin="normal">
                <TextField
                  label={
                    <span>
                      Mật khẩu mới <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={values.newPassword}
                  onChange={(e) => {
                    setFieldValue("newPassword", e.target.value); // Cập nhật giá trị
                  }}
                  error={touched.newPassword && !!errors.newPassword}
                  helperText={touched.newPassword && errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowNewPassword} edge="end">
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              {/* Xác nhận mật khẩu mới */}
              <FormControl fullWidth margin="normal">
                <TextField
                  label={
                    <span>
                      Xác nhận mật khẩu mới{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={(e) => {
                    setFieldValue("confirmPassword", e.target.value); // Cập nhật giá trị
                  }}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>

              <DialogActions>
                <Button onClick={onClose} color="primary">
                  Hủy
                </Button>
                <Button type="submit" color="primary">
                  Đổi mật khẩu
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
