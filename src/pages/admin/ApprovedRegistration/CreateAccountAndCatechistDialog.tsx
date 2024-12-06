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
  Select as MuiSelect,
  MenuItem,
} from "@mui/material";
import catechistApi from "../../../api/Catechist";
import accountApi from "../../../api/Account";
import sweetAlert from "../../../utils/sweetAlert";
import {
  isVietnamesePhoneNumberValid,
  isEmailValid,
} from "../../../utils/validation";
import Select from "react-select";
import christianNamesApi from "../../../api/ChristianName";
import levelApi from "../../../api/Level";
import registrationApi from "../../../api/Registration";
import interviewProcessApi from "../../../api/InterviewProcess";
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";
import useAppContext from "../../../hooks/useAppContext";

interface CreateAccountAndCatechistDialogProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  registrationItem: any; // Dữ liệu từ hàng được chọn
}

const CreateAccountAndCatechistDialog: React.FC<
  CreateAccountAndCatechistDialogProps
> = ({ open, onClose, refresh, registrationItem }) => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    gender: "",
    phone: "",
    avatar: null as File | null,
    dateOfBirth: "",
    birthPlace: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    address: "",
    qualification: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [christianNames, setChristianNames] = useState<any[]>([]);
  const [levels, setLevels] = useState([]);
  const [selectedChristianNameId, setSelectedChristianNameId] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    // Điền dữ liệu từ hàng được chọn
    if (registrationItem) {
      console.log(registrationItem);
      setFormData({
        email: registrationItem.email || "",
        fullName: registrationItem.fullName || "",
        gender: registrationItem.gender || "",
        phone: registrationItem.phone || "",
        dateOfBirth:
          new Date(registrationItem.dateOfBirth).toISOString().split("T")[0] ||
          "",
        birthPlace: "",
        fatherName: "",
        fatherPhone: "",
        motherName: "",
        motherPhone: "",
        address: "",
        qualification: "",
        avatar: null,
      });
    }
    // Fetch Christian Names
    const fetchChristianNames = async () => {
      try {
        const { data } = await christianNamesApi.getAllChristianNames();
        setChristianNames(
          data.data.items
            .filter((item: any) => {
              if (!registrationItem) return true;
              return item.gender == registrationItem.gender;
            })
            .map((item: any) => ({
              value: item.id,
              label: item.name,
            }))
        );
      } catch (error) {
        console.error("Error fetching Christian Names:", error);
      }
    };

    // Fetch Levels
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

    fetchChristianNames();
    fetchLevels();
  }, [registrationItem]);

  useEffect(() => {}, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, avatar: null });
      setPreviewAvatar(null);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!isEmailValid(formData.email)) {
      sweetAlert.alertWarning("Email không hợp lệ!", "", 1000, 22);
      return;
    }
    if (!formData.fullName.trim()) {
      sweetAlert.alertWarning("Tên đầy đủ là bắt buộc!", "", 1000, 22);
      return;
    }
    if (!formData.gender) {
      sweetAlert.alertWarning("Giới tính là bắt buộc!", "", 1000, 22);
      return;
    }
    if (!isVietnamesePhoneNumberValid(formData.phone)) {
      sweetAlert.alertWarning("Số điện thoại không hợp lệ!", "", 1000, 22);
      return;
    }
    if (!formData.dateOfBirth || new Date(formData.dateOfBirth) >= new Date()) {
      sweetAlert.alertWarning(
        "Ngày sinh phải là một ngày trước hiện tại!",
        "",
        1000,
        22
      );
      return;
    }
    if (!selectedChristianNameId) {
      sweetAlert.alertWarning("Vui lòng chọn Tên Thánh!", "", 1000, 22);
      return;
    }
    if (!selectedLevelId) {
      sweetAlert.alertWarning("Vui lòng chọn Cấp độ!", "", 1000, 22);
      return;
    }

    try {
      enableLoading();
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

        for (let i = password.length; i < passwordLength; i++) {
          password += allChars.charAt(
            Math.floor(Math.random() * allChars.length)
          );
        }

        return password
          .split("")
          .sort(() => Math.random() - 0.5)
          .join("");
      };

      const password = generateRandomPassword();

      // Tạo tài khoản
      const accountFormData = new FormData();
      accountFormData.append("email", formData.email);
      accountFormData.append("password", password);
      accountFormData.append("fullName", formData.fullName);
      accountFormData.append("gender", formData.gender);
      accountFormData.append("phone", formData.phone);
      if (formData.avatar) {
        accountFormData.append("avatar", formData.avatar);
      }
      accountFormData.append("RoleName", "Catechist");

      const accountResponse = await accountApi.createAccount(accountFormData);

      // Tạo giáo lý viên
      const catechistFormData = new FormData();
      catechistFormData.append("ImageUrl", formData.avatar || "");
      catechistFormData.append("FullName", formData.fullName);
      catechistFormData.append("Gender", formData.gender);
      catechistFormData.append("Phone", formData.phone);
      catechistFormData.append("DateOfBirth", formData.dateOfBirth);
      catechistFormData.append("BirthPlace", formData.birthPlace);
      catechistFormData.append("FatherName", formData.fatherName);
      catechistFormData.append("FatherPhone", formData.fatherPhone);
      catechistFormData.append("MotherName", formData.motherName);
      catechistFormData.append("MotherPhone", formData.motherPhone);
      catechistFormData.append("Address", formData.address);
      catechistFormData.append("Qualification", formData.qualification);
      catechistFormData.append(
        "ChristianNameId",
        selectedChristianNameId || ""
      );
      catechistFormData.append("LevelId", selectedLevelId || "");
      catechistFormData.append("AccountId", accountResponse.data.data.id);

      await catechistApi.createCatechist(catechistFormData);

      sweetAlert.alertSuccess(
        "Tạo tài khoản và giáo lý viên thành công!",
        "",
        1000,
        22
      );

      await registrationApi.updateRegistration(registrationItem.id, {
        status: registrationItem.status,
        note: "Đã tạo tài khoản",
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

      refresh();
      onClose();
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản và giáo lý viên:", error);
      sweetAlert.alertFailed("Không thể thêm giáo lý viên!", "", 1000, 22);
    } finally {
      disableLoading();
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>Tạo tài khoản và thông tin giáo lý viên</DialogTitle>
      <DialogContent>
        <TextField
          label="Email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
          margin="normal"
          disabled
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              color: "green", // Màu chữ đen
              WebkitTextFillColor: "green", // Đảm bảo màu chữ đen trong các trình duyệt Webkit
              opacity: 1, // Giữ độ trong suốt
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.6)", // Giữ màu label mặc định
            },
          }}
        />
        <TextField
          label="Tên đầy đủ"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          fullWidth
          margin="normal"
          disabled
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              color: "green", // Màu chữ đen
              WebkitTextFillColor: "green", // Đảm bảo màu chữ đen trong các trình duyệt Webkit
              opacity: 1, // Giữ độ trong suốt
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.6)", // Giữ màu label mặc định
            },
          }}
        />
        <FormControl
          fullWidth
          margin="normal"
          disabled
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              color: "green", // Màu chữ đen
              WebkitTextFillColor: "green", // Đảm bảo màu chữ đen trong các trình duyệt Webkit
              opacity: 1, // Giữ độ trong suốt
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.6)", // Giữ màu label mặc định
            },
          }}
        >
          <InputLabel>Giới tính</InputLabel>
          <MuiSelect
            value={formData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
          >
            <MenuItem value="Nam">Nam</MenuItem>
            <MenuItem value="Nữ">Nữ</MenuItem>
          </MuiSelect>
        </FormControl>
        <TextField
          label="Số điện thoại"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          fullWidth
          margin="normal"
          disabled
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              color: "green", // Màu chữ đen
              WebkitTextFillColor: "green", // Đảm bảo màu chữ đen trong các trình duyệt Webkit
              opacity: 1, // Giữ độ trong suốt
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.6)", // Giữ màu label mặc định
            },
          }}
        />
        <TextField
          label="Ngày sinh"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          fullWidth
          margin="normal"
          disabled
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              color: "green", // Màu chữ đen
              WebkitTextFillColor: "green", // Đảm bảo màu chữ đen trong các trình duyệt Webkit
              opacity: 1, // Giữ độ trong suốt
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.6)", // Giữ màu label mặc định
            },
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Nơi sinh"
          value={formData.birthPlace}
          onChange={(e) => handleInputChange("birthPlace", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tên cha"
          value={formData.fatherName}
          onChange={(e) => handleInputChange("fatherName", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Số điện thoại cha"
          value={formData.fatherPhone}
          onChange={(e) => handleInputChange("fatherPhone", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tên mẹ"
          value={formData.motherName}
          onChange={(e) => handleInputChange("motherName", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Số điện thoại mẹ"
          value={formData.motherPhone}
          onChange={(e) => handleInputChange("motherPhone", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Địa chỉ"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Học vấn"
          value={formData.qualification}
          onChange={(e) => handleInputChange("qualification", e.target.value)}
          fullWidth
          margin="normal"
        />
        {/* Select for Christian Names */}
        <div className="mt-2">
          <InputLabel>Tên Thánh</InputLabel>
          <Select
            options={christianNames}
            value={
              christianNames.find(
                (item: any) => item.value === selectedChristianNameId
              ) || null
            }
            onChange={(selectedOption: any) =>
              setSelectedChristianNameId(
                selectedOption ? selectedOption.value : null
              )
            }
            placeholder="Chọn Tên Thánh"
            isSearchable
          />
        </div>
        {/* Select for Levels */}
        <div className="mt-3">
          <InputLabel>Cấp độ</InputLabel>
          <Select
            options={levels}
            value={
              levels.find((item: any) => item.value === selectedLevelId) || null
            }
            onChange={(selectedOption: any) =>
              setSelectedLevelId(selectedOption ? selectedOption.value : null)
            }
            placeholder="Chọn Cấp độ"
            isSearchable
          />
        </div>
        {/* Avatar */}
        <div className="my-3">
          {previewAvatar && (
            <div>
              <img
                src={previewAvatar}
                alt="Preview"
                width="500"
                height="500"
                style={{ borderRadius: "3px" }}
              />
              <Button
                onClick={() => handleAvatarChange(null)}
                color="error"
                variant="contained"
              >
                Xóa
              </Button>
            </div>
          )}
          <Button variant="contained" component="label" className="mt-2">
            Tải ảnh
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                handleAvatarChange(e.target.files ? e.target.files[0] : null)
              }
            />
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAccountAndCatechistDialog;
