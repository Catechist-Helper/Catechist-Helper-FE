import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { CatechistSlotResponse } from "../../../model/Response/Class";
import Select from "react-select";
import { formatDate } from "../../../utils/formatDate";
import sweetAlert from "../../../utils/sweetAlert";

interface AdminRequestLeaveDialogProps {
  open: boolean;
  slotId: string;
  date: string;
  catechists: CatechistSlotResponse[];
  onClose: () => void;
  onSubmit: (
    catechistId: string,
    reason: string,
    slotId: string,
    images: File[]
  ) => void;
}

const AdminRequestLeaveDialog: React.FC<AdminRequestLeaveDialogProps> = ({
  open,
  slotId,
  date,
  catechists,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<string>("");
  const [selectedCateId, setSelectedCateId] = useState<any>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    images: [] as File[],
  });

  useEffect(() => {
    setReason("");
    setSelectedCateId({});
  }, [slotId, catechists]);

  const handleSubmit = () => {
    if (!(selectedCateId && selectedCateId.value)) {
      sweetAlert.alertWarning(
        "Vui lòng chọn giáo lý viên nghỉ phép",
        "",
        2500,
        28
      );
      return;
    }
    if (!reason || reason.trim() == "") {
      sweetAlert.alertWarning("Vui lòng nhập lý do nghỉ phép", "", 2500, 25);
      return;
    }
    onSubmit(
      selectedCateId && selectedCateId.value ? selectedCateId.value : "",
      reason,
      slotId,
      formData.images
    );
    setReason("");
    setSelectedCateId({});
  };

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
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>
        <h2 className="font-bold text-[1.5rem] text-primary">Xin nghỉ phép</h2>
      </DialogTitle>
      <DialogContent>
        <p className="mb-2 font-bold">
          Ngày nghỉ: {formatDate.DD_MM_YYYY(date)}
        </p>
        <label className="font-bold mt-1">
          Chọn giáo lý viên nghỉ phép <span style={{ color: "red" }}>*</span>
        </label>
        <Select
          options={catechists.map((cate) => ({
            value: cate.catechist.id,
            label: `${cate.catechist.fullName} - ${cate.catechist.code}`,
          }))}
          value={selectedCateId}
          onChange={(newValue: any) =>
            setSelectedCateId(newValue as { value: string; label: string }[])
          }
          placeholder="Tìm kiếm và chọn người phỏng vấn..."
          className="mt-1 z-[999]"
        />
        <TextField
          label={
            <span>
              Lý do nghỉ phép <span style={{ color: "red" }}>*</span>
            </span>
          }
          multiline
          fullWidth
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3"
        />
      </DialogContent>

      <DialogContent>
        <label className="block mb-1 text-md font-bold" htmlFor="images">
          Ảnh chứng minh
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
          {"Tải lên các ảnh chứng minh"}
        </div>

        {/* Hiển thị hình ảnh đã chọn */}
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Xem trước ảnh đã chọn:</h3>
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
      </DialogContent>

      <DialogActions className="mt-3">
        <Button
          onClick={onClose}
          color="primary"
          variant="outlined"
          className="btn btn-secondary"
        >
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminRequestLeaveDialog;
