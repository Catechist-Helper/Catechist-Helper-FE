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

interface CatechistDialogProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

const CatechistDialog: React.FC<CatechistDialogProps> = ({
  open,
  onClose,
  refresh,
}) => {
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
  const [fullchristianNames, setFullChristianNames] = useState<any[]>([]);
  const [christianNames, setChristianNames] = useState<any[]>([]);
  const [levels, setLevels] = useState([]);
  const [selectedChristianNameId, setSelectedChristianNameId] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState(null);

  useEffect(() => {
    // Fetch Christian Names
    const fetchChristianNames = async () => {
      try {
        const { data } = await christianNamesApi.getAllChristianNames();
        setChristianNames(
          data.data.items.map((item: any) => ({
            value: item.id,
            label: item.name,
          }))
        );
        setFullChristianNames(data.data.items);
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
  }, []);

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
    //Validation
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
    if (!formData.birthPlace.trim()) {
      sweetAlert.alertWarning("Nơi sinh là bắt buộc!", "", 1000, 22);
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
      accountFormData.append("email", formData.email);
      accountFormData.append("password", password);
      accountFormData.append("fullName", formData.fullName);
      accountFormData.append("gender", formData.gender);
      accountFormData.append("phone", formData.phone);
      if (formData.avatar) {
        accountFormData.append("avatar", formData.avatar);
      }
      accountFormData.append("RoleName", "Catechist");

      // Gọi API
      const accountResponse = await accountApi.createAccount(accountFormData);
      console.log("Account created successfully:", accountResponse);

      let catechistFormData = new FormData();
      if (formData.avatar) {
        catechistFormData.append("ImageUrl", formData.avatar || "");
      }
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
        selectedChristianNameId ?? ""
      );
      catechistFormData.append("LevelId", selectedLevelId ?? "");
      catechistFormData.append("AccountId", accountResponse.data.data.id);

      console.log(formData, password, selectedChristianNameId, selectedLevelId);

      const cateResponse =
        await catechistApi.createCatechist(catechistFormData);
      console.log("Catechist created successfully:", cateResponse);

      sweetAlert.alertSuccess("Thêm giáo lý viên thành công!", "", 1000, 22);
      refresh();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm giáo lý viên:", error);
      sweetAlert.alertFailed("Không thể thêm giáo lý viên!", "", 1000, 22);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Thêm giáo lý viên</DialogTitle>
      <DialogContent>
        <TextField
          label="Email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tên đầy đủ"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Giới tính</InputLabel>
          <MuiSelect
            value={formData.gender}
            onChange={(e) => {
              handleInputChange("gender", e.target.value);
              setChristianNames(
                [...fullchristianNames]
                  .filter((name: any) => name.gender == e.target.value)
                  .map((item: any) => ({
                    value: item.id,
                    label: item.name,
                  }))
              );
              setSelectedChristianNameId(null);
              //   setFullChristianNames(data.data.items);
            }}
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
        />
        <TextField
          label="Ngày sinh"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Nơi sinh"
          value={formData.birthPlace}
          onChange={(e) => handleInputChange("birthPlace", e.target.value)}
          fullWidth
          margin="normal"
        />
        {/* Additional fields */}
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
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatechistDialog;
